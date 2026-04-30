import clsx from 'clsx'

function TailRight() {
  return (
    <svg
      className="absolute -right-[5px] bottom-0"
      width="13"
      height="13"
      viewBox="0 0 13 13"
      aria-hidden="true"
    >
      <path
        d="M0 0 C0 7 3 11 8 12.5 C10 13 13 13 13 13 L 0 13 Z"
        fill="#007aff"
      />
    </svg>
  )
}

function TailLeft() {
  return (
    <svg
      className="absolute -left-[5px] bottom-0"
      width="13"
      height="13"
      viewBox="0 0 13 13"
      aria-hidden="true"
    >
      <path
        d="M13 0 C13 7 10 11 5 12.5 C3 13 0 13 0 13 L 13 13 Z"
        fill="#e9e9eb"
      />
    </svg>
  )
}

export default function ChatBubble({
  message,
  showAvatar,
  isRoleSwitch,
  isLastInRun,
}) {
  const isUser = message.role === 'user'
  const spacingClass = isRoleSwitch ? 'mt-4' : 'mt-1'

  if (isUser) {
    return (
      <div className={clsx('flex justify-end', spacingClass)}>
        <div className="relative max-w-[75%] bg-[#007aff] text-white px-3 py-2 text-[15px] leading-snug rounded-2xl break-words">
          {message.image && (
            <img
              src={message.image}
              alt=""
              className="rounded-xl mb-1 max-h-64 w-full object-cover"
            />
          )}
          {message.text && <span>{message.text}</span>}
          {isLastInRun && <TailRight />}
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
        {showAvatar ? '🍽️' : ' '}
      </span>
      <div className="relative max-w-[75%] bg-[#e9e9eb] text-black px-3 py-2 text-[15px] leading-snug rounded-2xl break-words">
        {message.text}
        {isLastInRun && <TailLeft />}
      </div>
    </div>
  )
}
