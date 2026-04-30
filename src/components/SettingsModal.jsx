import { useState } from 'react'
import { X } from 'lucide-react'

const FIELDS = [
  { key: 'calorie_goal', label: 'Daily Calorie Goal', unit: 'kcal' },
  { key: 'protein_goal', label: 'Protein Goal',       unit: 'g'    },
  { key: 'carbs_goal',   label: 'Carbs Goal',         unit: 'g'    },
  { key: 'fat_goal',     label: 'Fat Goal',           unit: 'g'    },
]

export default function SettingsModal({ current, onSave, onClose }) {
  const [form, setForm] = useState({
    calorie_goal: current.calorie_goal,
    protein_goal: current.protein_goal,
    carbs_goal:   current.carbs_goal,
    fat_goal:     current.fat_goal,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({
        calorie_goal: Number(form.calorie_goal) || 0,
        protein_goal: Number(form.protein_goal) || 0,
        carbs_goal:   Number(form.carbs_goal)   || 0,
        fat_goal:     Number(form.fat_goal)     || 0,
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
          <h2 className="text-[16px] font-semibold text-gray-900">Daily Goals</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {FIELDS.map(({ key, label, unit }) => (
            <div key={key}>
              <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wide">
                {label}
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-[#f2f2f7] rounded-xl px-4 py-2.5 pr-10 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-gray-400 pointer-events-none">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#007aff] text-white text-[15px] font-semibold py-3 rounded-2xl disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
