import { useEffect, useRef } from 'react'
import ChatBubble from './ChatBubble'

export default function ChatList({ messages }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <main className="flex-1 overflow-y-auto px-3 py-4">
      {messages.map((m, i) => {
        const prev = messages[i - 1]
        const next = messages[i + 1]
        const isRoleSwitch = !prev || prev.role !== m.role
        const isLastInRun = !next || next.role !== m.role
        const showAvatar = m.role === 'ai' && isLastInRun
        return (
          <ChatBubble
            key={m.id}
            message={m}
            showAvatar={showAvatar}
            isRoleSwitch={isRoleSwitch}
            isLastInRun={isLastInRun}
          />
        )
      })}
      <div ref={endRef} />
    </main>
  )
}
