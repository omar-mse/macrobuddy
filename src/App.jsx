import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import ChatList from './components/ChatList'
import InputBar from './components/InputBar'
import {
  uploadFoodImage,
  insertFoodLog,
  fetchTodayCalories,
} from './lib/supabase'
import {
  createChatSession,
  sendToBuddy,
  fileToBase64,
  extractMacroJSON,
  stripMacroJSON,
} from './lib/gemini'

const GOAL = 3000

const SEED_MESSAGES = [
  {
    id: 'm0',
    role: 'ai',
    text: "Hey! I'm ready when you are. What's on the menu today? 🍽️",
    ts: Date.now(),
  },
]

export default function App() {
  const [messages, setMessages] = useState(SEED_MESSAGES)
  const [consumed, setConsumed] = useState(0)
  const [sending, setSending] = useState(false)
  const chatRef = useRef(null)

  if (!chatRef.current) {
    chatRef.current = createChatSession()
  }

  useEffect(() => {
    fetchTodayCalories()
      .then(setConsumed)
      .catch((err) => console.error('fetchTodayCalories failed', err))
  }, [])

  async function handleSend({ text, imageFile, imagePreview }) {
    if (sending) return
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
          publicImageUrl = await uploadFoodImage(imageFile)
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
          await insertFoodLog({ ...macros, image_url: publicImageUrl })
          setConsumed((c) => c + (macros.calories || 0))
          fetchTodayCalories()
            .then(setConsumed)
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

  return (
    <div className="flex flex-col h-[100svh] bg-[#f2f2f7]">
      <Header consumed={consumed} goal={GOAL} />
      <ChatList messages={messages} />
      <InputBar onSend={handleSend} disabled={sending} />
    </div>
  )
}
