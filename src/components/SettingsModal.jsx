import { useState } from 'react'
import { X, LogOut } from 'lucide-react'

const FIELDS = [
  { key: 'calorie_goal', label: 'Daily Calorie Goal', unit: 'kcal' },
  { key: 'protein_goal', label: 'Protein Goal',       unit: 'g'    },
  { key: 'carbs_goal',   label: 'Carbs Goal',         unit: 'g'    },
  { key: 'fat_goal',     label: 'Fat Goal',           unit: 'g'    },
]

export default function SettingsModal({ current, onSave, onClose, onLogout, darkMode = false }) {
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

  const dk = darkMode

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm px-4 pb-8">
      <div className={`w-full max-w-sm rounded-3xl shadow-xl overflow-hidden transition-colors duration-300 ${dk ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
        <div className={`flex items-center justify-between px-5 pt-5 pb-3 border-b transition-colors duration-300 ${dk ? 'border-white/10' : 'border-gray-100'}`}>
          <h2 className={`text-[16px] font-semibold transition-colors duration-300 ${dk ? 'text-white' : 'text-gray-900'}`}>Daily Goals</h2>
          <button
            type="button"
            onClick={onClose}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-300 ${dk ? 'bg-white/10 text-gray-400 hover:bg-white/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {FIELDS.map(({ key, label, unit }) => (
            <div key={key}>
              <label className={`block text-[11px] font-medium mb-1 uppercase tracking-wide transition-colors duration-300 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>
                {label}
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={`w-full rounded-xl px-4 py-2.5 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-300 ${dk ? 'bg-[#2c2c2e] text-white' : 'bg-[#f2f2f7] text-gray-900'}`}
                />
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none transition-colors duration-300 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#007aff] text-white text-[15px] font-semibold py-3 rounded-2xl disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 text-[15px] font-semibold py-3 rounded-2xl active:scale-[0.98] transition-all ${dk ? 'bg-white/5 text-red-400 hover:bg-white/10' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
