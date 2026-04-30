import { useState } from 'react'
import { X } from 'lucide-react'

const FIELDS = [
  { key: 'meal_name', label: 'Meal Name', placeholder: 'e.g. Banana Shake', type: 'text' },
  { key: 'calories',  label: 'Calories',   placeholder: '0', type: 'number' },
  { key: 'protein',   label: 'Protein (g)', placeholder: '0', type: 'number' },
  { key: 'carbs',     label: 'Carbs (g)',   placeholder: '0', type: 'number' },
  { key: 'fat',       label: 'Fats (g)',    placeholder: '0', type: 'number' },
]

const EMPTY = { meal_name: '', calories: '', protein: '', carbs: '', fat: '' }

export default function QuickAddModal({ onSave, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.meal_name.trim()) return
    setSaving(true)
    try {
      await onSave({
        meal_name: form.meal_name.trim(),
        calories: Number(form.calories) || 0,
        protein:  Number(form.protein)  || 0,
        carbs:    Number(form.carbs)    || 0,
        fat:      Number(form.fat)      || 0,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm px-4 pb-8">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-[16px] font-semibold text-gray-900">Create Quick-Add</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wide">
                {label}
              </label>
              <input
                type={type}
                inputMode={type === 'number' ? 'decimal' : undefined}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full bg-[#f2f2f7] rounded-xl px-4 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !form.meal_name.trim()}
            className="w-full bg-[#007aff] text-white text-[15px] font-semibold py-3 rounded-2xl disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {saving ? 'Saving…' : 'Save to Library'}
          </button>
        </div>
      </div>
    </div>
  )
}
