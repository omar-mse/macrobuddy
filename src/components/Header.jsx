import { Settings, Sun, Moon } from 'lucide-react'
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
  onOpenSettings,
  darkMode = false,
  onToggleTheme,
}) {
  const dk = darkMode

  return (
    <header className={`sticky top-0 z-10 backdrop-blur-md border-b-[0.5px] px-4 pt-3 pb-3 transition-colors duration-300 ${dk ? 'bg-[#1c1c1e]/80 border-white/10' : 'bg-white/70 border-gray-200'}`}>
      <div className="flex justify-between items-center">
        <span className={`text-xs font-medium flex items-center gap-1 ${dk ? 'text-green-400' : 'text-green-600'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Active
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className={`transition-all active:scale-90 ${dk ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label={dk ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dk ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className={`transition-all active:scale-90 ${dk ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mt-1">
        <h1 className={`text-base font-semibold tracking-tight transition-colors duration-300 ${dk ? 'text-white' : 'text-black'}`}>
          MacroBuddy
        </h1>
        <FitnessRing consumed={consumed} goal={goal} size={104} stroke={8}>
          <div className="flex flex-col items-center leading-none">
            <span className={`text-[20px] font-semibold transition-colors duration-300 ${dk ? 'text-white' : 'text-black'}`}>
              {consumed.toLocaleString()}
            </span>
            <span className={`text-[10px] mt-1 transition-colors duration-300 ${dk ? 'text-gray-300' : 'text-gray-600'}`}>
              / {goal.toLocaleString()} kcal
            </span>
          </div>
        </FitnessRing>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        {MACRO_CONFIG.map(({ key, label, color }) => {
          const eaten = Math.round(macros[key] || 0)
          const goal_g = macroGoals[key]
          const pct = Math.min(100, (eaten / goal_g) * 100)
          return (
            <div key={key}>
              <div className="flex items-baseline justify-between mb-1">
                <span className={`text-[10px] font-medium transition-colors duration-300 ${dk ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
                <span className={`text-[10px] transition-colors duration-300 ${dk ? 'text-gray-300' : 'text-gray-600'}`}>{eaten}g</span>
              </div>
              <div className={`h-[4px] w-full rounded-full overflow-hidden transition-colors duration-300 ${dk ? 'bg-white/10' : 'bg-gray-100'}`}>
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
