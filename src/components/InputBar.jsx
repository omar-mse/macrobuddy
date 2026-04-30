import { useRef, useState } from 'react'
import { Plus, Camera, ArrowUp, X } from 'lucide-react'

export default function InputBar({ onSend, disabled = false }) {
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef(null)

  const canSend = (text.trim().length > 0 || imageFile) && !disabled

  function pickImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  function clearImage() {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  function send() {
    if (!canSend) return
    onSend?.({ text: text.trim(), imageFile, imagePreview })
    setText('')
    setImageFile(null)
    setImagePreview(null)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <footer className="sticky bottom-0 bg-[#f2f2f7] px-3 pt-2 pb-6">
      {imagePreview && (
        <div className="mb-2 ml-12 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 pr-2">
          <img
            src={imagePreview}
            alt=""
            className="w-12 h-12 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={clearImage}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center shrink-0 text-gray-500 hover:text-gray-700"
          aria-label="More"
        >
          <Plus size={22} />
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-8 h-8 flex items-center justify-center shrink-0 text-gray-500 hover:text-gray-700"
          aria-label="Camera"
        >
          <Camera size={22} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={pickImage}
          className="hidden"
        />

        <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-full pl-4 pr-1 py-1 min-h-[36px] shadow-sm">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message"
            disabled={disabled}
            className="flex-1 bg-transparent text-[15px] py-1 focus:outline-none placeholder:text-gray-400 disabled:opacity-60"
          />
          {canSend && (
            <button
              type="button"
              onClick={send}
              className="w-7 h-7 rounded-full bg-[#007aff] text-white flex items-center justify-center shrink-0"
              aria-label="Send"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}
