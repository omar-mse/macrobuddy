import { Settings, Sun, Moon, Dumbbell, Zap, Droplet } from 'lucide-react'
import FitnessRing from './FitnessRing'

const MACRO_CONFIG = [
  { key: 'protein', label: 'Protein', color: 'bg-emerald-400', glow: 'shadow-emerald-400/40', Icon: Dumbbell, iconColor: 'text-emerald-400' },
  { key: 'carbs',   label: 'Carbs',   color: 'bg-amber-400',   glow: 'shadow-amber-400/40',   Icon: Zap,      iconColor: 'text-amber-400'   },
  { key: 'fat',     label: 'Fat',     color: 'bg-rose-400',    glow: 'shadow-rose-400/40',    Icon: Droplet,  iconColor: 'text-rose-400'    },
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
    <header
      className={`sticky top-0 z-10 backdrop-blur-xl border-b-[0.5px] px-4 pt-3 pb-4 transition-colors duration-300 ${
        dk ? 'bg-black/70 border-white/[0.08]' : 'bg-white/75 border-gray-200/70'
      }`}
    >
      {/* Top row */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onToggleTheme}
          className={`transition-all active:scale-90 ${dk ? 'text-gray-500 hover:text-gray-200' : 'text-gray-400 hover:text-gray-700'}`}
          aria-label={dk ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dk ? <Sun size={21} /> : <Moon size={21} />}
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className={`transition-all active:scale-90 ${dk ? 'text-gray-500 hover:text-gray-200' : 'text-gray-400 hover:text-gray-700'}`}
          aria-label="Settings"
        >
          <Settings size={21} />
        </button>
      </div>

      {/* Brand + ring */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <span
          className={`text-[26px] font-black tracking-normal transition-colors duration-300 ${
            dk ? 'text-white' : 'text-[#0a0a0a]'
          }`}
        >
          bulkr
        </span>
        <FitnessRing consumed={consumed} goal={goal} size={108} stroke={9}>
          <div className="flex flex-col items-center leading-none">
            <span className={`text-[21px] font-bold tabular-nums transition-colors duration-300 ${dk ? 'text-white' : 'text-black'}`}>
              {consumed.toLocaleString()}
            </span>
            <span className={`text-[10px] mt-1 transition-colors duration-300 ${dk ? 'text-gray-400' : 'text-gray-500'}`}>
              / {goal.toLocaleString()} kcal
            </span>
          </div>
        </FitnessRing>
      </div>

      {/* Macro glass card */}
      <div
        className={`grid grid-cols-3 gap-4 mt-4 rounded-2xl px-4 py-3 transition-colors duration-300 ${
          dk
            ? 'bg-white/[0.05] border border-white/[0.09] backdrop-blur-2xl'
            : 'bg-white/60 border border-white/80 shadow-[0_2px_16px_rgba(0,0,0,0.07)] backdrop-blur-2xl'
        }`}
      >
        {MACRO_CONFIG.map(({ key, label, color, glow, Icon, iconColor }) => {
          const eaten   = Math.round(macros[key] || 0)
          const goal_g  = macroGoals[key]
          const pct     = Math.min(100, goal_g > 0 ? (eaten / goal_g) * 100 : 0)
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <Icon size={12} className={iconColor} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 ${dk ? 'text-gray-400' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                <span className={`text-[11px] font-medium tabular-nums transition-colors duration-300 ${dk ? 'text-gray-300' : 'text-gray-700'}`}>
                  {eaten}g
                </span>
              </div>
              {/* Track */}
              <div className={`h-[6px] w-full rounded-full overflow-hidden transition-colors duration-300 ${dk ? 'bg-white/[0.08]' : 'bg-black/[0.06]'}`}>
                <div
                  className={`h-full rounded-full ${color} shadow-sm ${glow} transition-all duration-500`}
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
