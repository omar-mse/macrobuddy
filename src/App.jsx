import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import ChatList from './components/ChatList'
import InputBar from './components/InputBar'
import AuthScreen from './components/Auth'
import {
  supabase,
  uploadFoodImage,
  insertFoodLog,
  fetchTodayMacros,
} from './lib/supabase'
import {
  createChatSession,
  sendToBuddy,
  fileToBase64,
  extractMacroJSON,
  stripMacroJSON,
} from './lib/gemini'

const GOAL = 3000
const MACRO_GOALS = { protein: 90, carbs: 300, fat: 60 }

const SEED_MESSAGES = [
  {
    id: 'm0',
    role: 'ai',
    text: "Hey! I'm ready when you are. What's on the menu today? 🍽️",
    ts: Date.now(),
  },
]

export default function App() {
  const [session, setSession] = useState(undefined)
  const [messages, setMessages] = useState(SEED_MESSAGES)
  const [consumed, setConsumed] = useState(0)
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 })
  const [sending, setSending] = useState(false)
  const chatRef = useRef(null)

  if (!chatRef.current) {
    chatRef.current = createChatSession()
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    fetchTodayMacros(session.user.id)
      .then(({ calories, ...rest }) => { setConsumed(calories); setMacros(rest) })
      .catch((err) => console.error('fetchTodayMacros failed', err))
  }, [session])

  async function handleSend({ text, imageFile, imagePreview }) {
    if (sending || !session) return
    setSending(true)

    const userMsgId = `u-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        text,
        image: imagePreview,
        ts: Date.now(),
      },
    ])

    try {
      let publicImageUrl = null
      let base64Image = null
      let mimeType = null
      if (imageFile) {
        mimeType = imageFile.type || 'image/jpeg'
        base64Image = await fileToBase64(imageFile)
        try {
          publicImageUrl = await uploadFoodImage(imageFile, session.user.id)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === userMsgId ? { ...m, image: publicImageUrl } : m,
            ),
          )
        } catch (err) {
          console.error('image upload failed', err)
        }
      }

      const aiText = await sendToBuddy(chatRef.current, {
        text,
        base64Image,
        mimeType,
      })

      const macros = extractMacroJSON(aiText)
      const visibleText = macros ? stripMacroJSON(aiText) || 'Logged it 💪' : aiText

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'ai',
          text: visibleText,
          ts: Date.now(),
        },
      ])

      if (macros) {
        try {
          await insertFoodLog({ ...macros, image_url: publicImageUrl, userId: session.user.id })
          setConsumed((c) => c + (macros.calories || 0))
          fetchTodayMacros(session.user.id)
            .then(({ calories, ...rest }) => { setConsumed(calories); setMacros(rest) })
            .catch((err) => console.error('refresh total failed', err))
        } catch (err) {
          console.error('insertFoodLog failed', err)
          setMessages((prev) => [
            ...prev,
            {
              id: `a-err-${Date.now()}`,
              role: 'ai',
              text: "I couldn't save that to your log — check the food_logs table.",
              ts: Date.now(),
            },
          ])
        }
      }
    } catch (err) {
      console.error('sendToBuddy failed', err)
      setMessages((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          role: 'ai',
          text: 'Something went wrong reaching the AI. Try again in a sec.',
          ts: Date.now(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  if (session === undefined) return null

  if (!session) return <AuthScreen />

  return (
    <div className="flex flex-col h-[100svh] bg-[#f2f2f7]">
      <Header consumed={consumed} goal={GOAL} macros={macros} macroGoals={MACRO_GOALS} />
      <ChatList messages={messages} />
      <InputBar onSend={handleSend} disabled={sending} />
    </div>
  )
}
