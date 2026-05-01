import clsx from 'clsx'

export default function ChatBubble({ message, isRoleSwitch, darkMode = false }) {
  const isUser = message.role === 'user'
  const spacingClass = isRoleSwitch ? 'mt-4' : 'mt-1'

  if (isUser) {
    return (
      <div className={clsx('flex justify-end', spacingClass)}>
        <div className="max-w-[75%] bg-[#007aff] text-white px-4 py-2.5 text-[15px] leading-snug rounded-3xl break-words">
          {message.image && (
            <img
              src={message.image}
              alt=""
              className="rounded-2xl mb-1 max-h-64 w-full object-cover"
            />
          )}
          {message.text && <span>{message.text}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('flex', spacingClass)}>
      <div className={`max-w-[75%] px-4 py-2.5 text-[15px] leading-snug rounded-3xl break-words transition-colors duration-300 ${darkMode ? 'bg-[#2c2c2e] text-white' : 'bg-[#e9e9eb] text-black'}`}>
        {message.text}
      </div>
    </div>
  )
}
