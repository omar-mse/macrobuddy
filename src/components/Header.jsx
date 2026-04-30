import { Flame } from 'lucide-react'
import FitnessRing from './FitnessRing'

export default function Header({ consumed = 0, goal = 3000 }) {
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
    </header>
  )
}
