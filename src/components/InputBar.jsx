import { useEffect, useRef, useState } from 'react'
import { Plus, Camera, ArrowUp, X } from 'lucide-react'
import QuickAddModal from './QuickAddModal'

export default function InputBar({ onSend, onSaveQuickAdd, onQuickLog, libraryItems = [], disabled = false }) {
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const fileRef = useRef(null)
  const menuRef = useRef(null)

  const canSend = (text.trim().length > 0 || imageFile) && !disabled

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

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

  async function handleSaveQuickAdd(item) {
    await onSaveQuickAdd?.(item)
  }

  function handleQuickLog(item) {
    setMenuOpen(false)
    onQuickLog?.(item)
  }

  return (
    <footer className="sticky bottom-0 bg-[#f2f2f7] px-3 pt-2 pb-6">
      {imagePreview && (
        <div className="mb-2 ml-12 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 pr-2">
          <img src={imagePreview} alt="" className="w-12 h-12 object-cover rounded-lg" />
          <button type="button" onClick={clearImage} className="text-gray-500 hover:text-gray-700" aria-label="Remove image">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* + button with popup menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
            aria-label="Quick add"
          >
            <Plus size={22} />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-0 mb-3 w-56 rounded-3xl overflow-hidden shadow-2xl bg-white/60 backdrop-blur-2xl border border-white/40">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setShowModal(true) }}
                className="w-full flex items-center gap-2 px-4 py-3 text-[15px] font-semibold text-gray-900 active:bg-black/5 transition-colors"
              >
                <Plus size={15} strokeWidth={2.5} className="text-gray-500" />
                Add New Meal
              </button>

              {libraryItems.length > 0 && (
                <ul className="max-h-56 overflow-y-auto border-t border-black/10">
                  {libraryItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleQuickLog(item)}
                        className="w-full text-left px-4 py-3 text-[15px] font-semibold text-gray-900 active:bg-black/5 transition-colors truncate"
                      >
                        {item.meal_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-8 h-8 flex items-center justify-center shrink-0 text-gray-500 hover:text-gray-700"
          aria-label="Camera"
        >
          <Camera size={22} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickImage} className="hidden" />

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

      {showModal && (
        <QuickAddModal
          onSave={handleSaveQuickAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </footer>
  )
}
