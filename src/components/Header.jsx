import { Flame } from 'lucide-react'
import FitnessRing from './FitnessRing'

const MACRO_CONFIG = [
  { key: 'protein', label: 'Protein', color: 'bg-emerald-400' },
  { key: 'carbs', label: 'Carbs', color: 'bg-amber-400' },
  { key: 'fat', label: 'Fat', color: 'bg-rose-400' },
]

export default function Header({
  consumed = 0,
  goal = 3000,
  macros = { protein: 0, carbs: 0, fat: 0 },
  macroGoals = { protein: 150, carbs: 300, fat: 100 },
}) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b-[0.5px] border-gray-200 px-4 pt-3 pb-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-green-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Active
        </span>
        <Flame size={18} color="#ff9500" fill="#ff9500" />
      </div>

      <div className="flex flex-col items-center gap-2 mt-1">
        <h1 className="text-base font-semibold text-black tracking-tight">
          MacroBuddy
        </h1>
        <FitnessRing consumed={consumed} goal={goal} size={104} stroke={8}>
          <div className="flex flex-col items-center leading-none">
            <span className="text-[20px] font-semibold text-black">
              {consumed.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 mt-1">
              / {goal.toLocaleString()} kcal
            </span>
          </div>
        </FitnessRing>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        {MACRO_CONFIG.map(({ key, label, color }) => {
          const eaten = Math.round(macros[key] || 0)
          const goal_g = macroGoals[key]
          const remaining = Math.max(0, goal_g - eaten)
          const pct = Math.min(100, (eaten / goal_g) * 100)
          return (
            <div key={key}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] font-medium text-gray-400">{label}</span>
                <span className="text-[10px] text-gray-400">{remaining}g left</span>
              </div>
              <div className="h-[4px] w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </header>
  )
}
