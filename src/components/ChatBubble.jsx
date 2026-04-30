import clsx from 'clsx'

export default function ChatBubble({ message, showAvatar, isRoleSwitch }) {
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
    <div className={clsx('flex items-end gap-1.5', spacingClass)}>
      <span
        className="w-6 text-xl leading-none text-center shrink-0 select-none"
        aria-label={showAvatar ? 'MacroBuddy' : undefined}
      >
        {showAvatar ? '🍽️' : ' '}
      </span>
      <div className="max-w-[75%] bg-[#e9e9eb] text-black px-4 py-2.5 text-[15px] leading-snug rounded-3xl break-words">
        {message.text}
      </div>
    </div>
  )
}
