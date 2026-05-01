import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import ChatList from './components/ChatList'
import InputBar from './components/InputBar'
import AuthScreen from './components/Auth'
import SettingsModal from './components/SettingsModal'
import {
  supabase,
  uploadFoodImage,
  insertFoodLog,
  fetchTodayMacros,
  fetchTodayChatMessages,
  insertChatMessage,
  fetchQuickAddLibrary,
  saveQuickAdd,
  fetchUserSettings,
  upsertUserSettings,
} from './lib/supabase'
import {
  createChatSession,
  sendToBuddy,
  fileToBase64,
  extractMacroJSON,
  stripMacroJSON,
} from './lib/gemini'

const DEFAULT_GOALS = { calorie_goal: 3000, protein_goal: 90, carbs_goal: 300, fat_goal: 60 }

const SEED_MESSAGE = {
  id: 'm0',
  role: 'ai',
  text: "Hey! I'm ready when you are. What's on the menu today? 🍽️",
  ts: 0,
}

function compressImageToDataUrl(file, maxDim = 600, quality = 0.65) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const [ready, setReady] = useState(false)
  const [messages, setMessages] = useState([SEED_MESSAGE])
  const [consumed, setConsumed] = useState(0)
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 })
  const [goals, setGoals] = useState(DEFAULT_GOALS)
  const [library, setLibrary] = useState([])
  const [sending, setSending] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const chatRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setReady(false)
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    setReady(false)
    const uid = session.user.id

    Promise.all([
      fetchTodayMacros(uid),
      fetchQuickAddLibrary(uid),
      fetchUserSettings(uid),
      fetchTodayChatMessages(uid),
    ])
      .then(([macroData, lib, settings, savedMessages]) => {
        const { calories, ...macroRest } = macroData
        setConsumed(calories)
        setMacros(macroRest)
        setLibrary(lib)
        if (settings) setGoals(settings)

        if (savedMessages.length > 0) {
          setMessages([SEED_MESSAGE, ...savedMessages])
          // Rebuild Gemini history; drop a trailing user turn (page closed mid-exchange)
          const history = savedMessages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text || '' }],
          }))
          if (history.at(-1)?.role === 'user') history.pop()
          chatRef.current = createChatSession(history)
        } else {
          setMessages([SEED_MESSAGE])
          chatRef.current = createChatSession()
        }

        setReady(true)
      })
      .catch((err) => {
        console.error('init failed', err)
        chatRef.current = createChatSession()
        setReady(true)
      })
  }, [session])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function handleSaveGoals(newGoals) {
    await upsertUserSettings(session.user.id, newGoals)
    setGoals(newGoals)
  }

  async function handleSaveQuickAdd(item) {
    const saved = await saveQuickAdd(session.user.id, item)
    setLibrary((prev) => [saved, ...prev])
  }

  async function handleQuickLog(item) {
    const userTs = Date.now()
    const userText = item.meal_name

    setMessages((prev) => [
      ...prev,
      { id: `u-ql-${userTs}`, role: 'user', text: userText, ts: userTs },
    ])
    insertChatMessage(session.user.id, { role: 'user', text: userText, image: null, ts: userTs })
      .catch((err) => console.error('save quick-log user msg failed', err))

    try {
      await insertFoodLog({
        food_name: item.meal_name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        image_url: null,
        userId: session.user.id,
      })

      const aiTs = Date.now()
      const aiText = `Logged ${item.meal_name} — ${item.calories} kcal, ${item.protein}g protein, ${item.carbs}g carbs, ${item.fat}g fat 💪`
      setMessages((prev) => [
        ...prev,
        { id: `a-ql-${userTs}`, role: 'ai', text: aiText, ts: aiTs },
      ])
      insertChatMessage(session.user.id, { role: 'ai', text: aiText, image: null, ts: aiTs })
        .catch((err) => console.error('save quick-log ai msg failed', err))

      fetchTodayMacros(session.user.id)
        .then(({ calories, ...rest }) => { setConsumed(calories); setMacros(rest) })
        .catch((err) => console.error('refresh macros failed', err))
    } catch (err) {
      console.error('handleQuickLog failed', err)
      setMessages((prev) => [
        ...prev,
        { id: `a-ql-err-${userTs}`, role: 'ai', text: "Couldn't log that — please try again.", ts: Date.now() },
      ])
    }
  }

  async function handleSend({ text, imageFile, imagePreview }) {
    if (sending || !session) return
    setSending(true)

    const userTs = Date.now()
    const userMsgId = `u-${userTs}`
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', text, image: imagePreview, ts: userTs },
    ])

    try {
      let publicImageUrl = null
      let fallbackDataUrl = null
      let base64Image = null
      let mimeType = null

      if (imageFile) {
        mimeType = imageFile.type || 'image/jpeg'
        base64Image = await fileToBase64(imageFile)
        try {
          publicImageUrl = await uploadFoodImage(imageFile, session.user.id)
          setMessages((prev) =>
            prev.map((m) => m.id === userMsgId ? { ...m, image: publicImageUrl } : m),
          )
        } catch (err) {
          console.error('image upload failed, falling back to data url', err)
          fallbackDataUrl = await compressImageToDataUrl(imageFile)
          setMessages((prev) =>
            prev.map((m) => m.id === userMsgId ? { ...m, image: fallbackDataUrl } : m),
          )
        }
      }

      const savedImageUrl = publicImageUrl || fallbackDataUrl
      insertChatMessage(session.user.id, { role: 'user', text, image: savedImageUrl, ts: userTs })
        .catch((err) => console.error('save user msg failed', err))

      const aiText = await sendToBuddy(chatRef.current, { text, base64Image, mimeType })
      const macroData = extractMacroJSON(aiText)
      const visibleText = macroData ? stripMacroJSON(aiText) || 'Logged it 💪' : aiText

      const aiTs = Date.now()
      setMessages((prev) => [
        ...prev,
        { id: `a-${aiTs}`, role: 'ai', text: visibleText, ts: aiTs },
      ])
      insertChatMessage(session.user.id, { role: 'ai', text: visibleText, image: null, ts: aiTs })
        .catch((err) => console.error('save ai msg failed', err))

      if (macroData) {
        try {
          await insertFoodLog({ ...macroData, image_url: savedImageUrl, userId: session.user.id })
          fetchTodayMacros(session.user.id)
            .then(({ calories, ...rest }) => { setConsumed(calories); setMacros(rest) })
            .catch((err) => console.error('refresh macros failed', err))
        } catch (err) {
          console.error('insertFoodLog failed', err)
          setMessages((prev) => [
            ...prev,
            { id: `a-err-${Date.now()}`, role: 'ai', text: "I couldn't save that to your log — check the food_logs table.", ts: Date.now() },
          ])
        }
      }
    } catch (err) {
      console.error('sendToBuddy failed', err)
      setMessages((prev) => [
        ...prev,
        { id: `a-err-${Date.now()}`, role: 'ai', text: 'Something went wrong reaching the AI. Try again in a sec.', ts: Date.now() },
      ])
    } finally {
      setSending(false)
    }
  }

  if (session === undefined) return null
  if (!session) return <AuthScreen />
  if (!ready) return null

  return (
    <div className="flex flex-col h-[100svh] bg-[#f2f2f7]">
      <Header
        consumed={consumed}
        goal={goals.calorie_goal}
        macros={macros}
        macroGoals={{ protein: goals.protein_goal, carbs: goals.carbs_goal, fat: goals.fat_goal }}
        onOpenSettings={() => setShowSettings(true)}
      />
      <ChatList messages={messages} />
      <InputBar
        onSend={handleSend}
        onSaveQuickAdd={handleSaveQuickAdd}
        onQuickLog={handleQuickLog}
        libraryItems={library}
        disabled={sending}
      />
      {showSettings && (
        <SettingsModal
          current={goals}
          onSave={handleSaveGoals}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
