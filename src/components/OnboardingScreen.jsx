import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ACTIVITY_OPTIONS, calculateMacros } from '../lib/macros'

const CALC_LINES = [
  'Analyzing your body stats…',
  'Estimating your daily burn…',
  'Building your macro split…',
  'Locking in your bulking plan…',
]

const slideVariants = {
  enter:  (d) => ({ opacity: 0, x: d > 0 ?  24 : -24 }),
  center:       ({ opacity: 1, x: 0 }),
  exit:   (d) => ({ opacity: 0, x: d > 0 ? -24 :  24 }),
}

const MONTHS     = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su']

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ value, onChange, minDate, darkMode }) {
  const dk   = darkMode
  const minD = new Date(minDate + 'T00:00:00')

  const [view, setView] = useState(() => {
    const seed = value ? new Date(value + 'T00:00:00') : minD
    return { year: seed.getFullYear(), month: seed.getMonth() }
  })
  const { year, month } = view

  const canGoPrev = year > minD.getFullYear() ||
    (year === minD.getFullYear() && month > minD.getMonth())

  const prev = () => {
    if (!canGoPrev) return
    setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })
  }
  const next = () => {
    setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })
  }

  const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells  = Math.ceil((firstDow + daysInMonth) / 7) * 7
  const grid = Array.from({ length: totalCells }, (_, i) => {
    const d = i - firstDow + 1
    return d >= 1 && d <= daysInMonth ? d : null
  })

  const pad    = n => String(n).padStart(2, '0')
  const toStr  = d => `${year}-${pad(month + 1)}-${pad(d)}`
  const today  = new Date().toISOString().split('T')[0]

  return (
    <div className={`rounded-2xl border overflow-hidden transition-colors duration-300 ${
      dk ? 'bg-white/[0.05] border-white/[0.09]' : 'bg-white/70 border-gray-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between px-4 py-3">
        <button type="button" onClick={prev} disabled={!canGoPrev}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90 ${
            canGoPrev ? dk ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                      : 'opacity-20 cursor-not-allowed'
          }`}>
          <ChevronLeft size={16} />
        </button>
        <span className={`text-[14px] font-semibold ${dk ? 'text-white' : 'text-gray-800'}`}>
          {MONTHS[month]} {year}
        </span>
        <button type="button" onClick={next}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90 ${
            dk ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
          }`}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 px-2">
        {DAY_LABELS.map(d => (
          <div key={d} className={`h-7 flex items-center justify-center text-[10px] font-semibold ${dk ? 'text-gray-600' : 'text-gray-400'}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 px-2 pb-3">
        {grid.map((day, i) => {
          if (!day) return <div key={i} className="h-9" />
          const ds       = toStr(day)
          const disabled = ds < minDate
          const selected = ds === value
          const isToday  = ds === today
          return (
            <div key={i} className="h-9 flex items-center justify-center">
              <button type="button" onClick={() => onChange(ds)} disabled={disabled}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-medium transition-all ${
                  selected  ? 'bg-[#007aff] text-white'
                  : disabled ? `opacity-20 cursor-not-allowed ${dk ? 'text-white' : 'text-gray-800'}`
                  : isToday  ? `ring-1 ring-[#007aff] text-[#007aff] cursor-pointer active:scale-90 ${dk ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`
                  : `cursor-pointer active:scale-90 ${dk ? 'text-white hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'}`
                }`}>
                {day}
              </button>
            </div>
          )
        })}
      </div>

      {value && (
        <div className={`border-t px-4 py-2.5 text-center text-[11px] font-medium ${
          dk ? 'border-white/[0.06] text-gray-500' : 'border-gray-100 text-gray-400'
        }`}>
          {new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          })}
        </div>
      )}
    </div>
  )
}

// ── Unit helpers ──────────────────────────────────────────────────────────────
function cvtWeight(val, from, to) {
  const n = parseFloat(val)
  if (!val || isNaN(n) || from === to) return val
  return to === 'lbs' ? String(Math.round(n * 2.2046 * 10) / 10)
                      : String(Math.round(n / 2.2046 * 10) / 10)
}
function cvtHeight(val, from, to) {
  const n = parseFloat(val)
  if (!val || isNaN(n) || from === to) return val
  return to === 'in' ? String(Math.round(n / 2.54 * 10) / 10)
                     : String(Math.round(n * 2.54 * 10) / 10)
}
const toKg = (v, u) => u === 'lbs' ? parseFloat(v) / 2.2046 : parseFloat(v)
const toCm = (v, u) => u === 'in'  ? parseFloat(v) * 2.54   : parseFloat(v)

// ── Unit toggle ───────────────────────────────────────────────────────────────
function UnitToggle({ options, value, onChange, darkMode }) {
  const dk = darkMode
  return (
    <div className={`flex rounded-lg border overflow-hidden text-[11px] font-semibold ${dk ? 'border-white/10' : 'border-gray-200'}`}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`px-2.5 py-1 transition-colors ${
            value === opt
              ? dk ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
              : dk ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
          }`}>
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OnboardingScreen({ onComplete, darkMode = false, userId }) {
  const dk = darkMode

  const [step,           setStep]           = useState(0)
  const [dir,            setDir]            = useState(1)
  const [age,            setAge]            = useState('')
  const [height,         setHeight]         = useState('')
  const [heightUnit,     setHeightUnit]     = useState('cm')
  const [curWeight,      setCurWeight]      = useState('')
  const [goalWeight,     setGoalWeight]     = useState('')
  const [weightUnit,     setWeightUnit]     = useState('kg')
  const [targetDate,     setTargetDate]     = useState('')
  const [activityLevel,  setActivityLevel]  = useState('moderately_active')
  const [calcLine,       setCalcLine]       = useState(-1)
  const [calculating,    setCalculating]    = useState(false)

  const minDate = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 28)
    return d.toISOString().split('T')[0]
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`bulkr_profile_${userId}`)
      if (!saved) return
      const p = JSON.parse(saved)
      if (p.age)           setAge(String(p.age))
      if (p.height)        setHeight(String(p.height))
      if (p.heightUnit)    setHeightUnit(p.heightUnit)
      if (p.curWeight)     setCurWeight(String(p.curWeight))
      if (p.goalWeight)    setGoalWeight(String(p.goalWeight))
      if (p.weightUnit)    setWeightUnit(p.weightUnit)
      if (p.targetDate)    setTargetDate(p.targetDate)
      if (p.activityLevel) setActivityLevel(p.activityLevel)
    } catch {}
  }, [userId])

  const goNext = () => { setDir(1);  setStep(s => s + 1) }
  const goBack = () => { setDir(-1); setStep(s => s - 1) }

  function handleWeightUnitChange(next) {
    setCurWeight(v  => cvtWeight(v, weightUnit, next))
    setGoalWeight(v => cvtWeight(v, weightUnit, next))
    setWeightUnit(next)
  }
  function handleHeightUnitChange(next) {
    setHeight(v => cvtHeight(v, heightUnit, next))
    setHeightUnit(next)
  }

  // Live calorie preview — recomputes whenever any input changes (used on the activity step)
  const liveCalories = useMemo(() => {
    if (!age || !height || !curWeight || !goalWeight || !targetDate) return null
    try {
      return calculateMacros({
        age: +age,
        heightCm:        toCm(height,     heightUnit),
        currentWeightKg: toKg(curWeight,  weightUnit),
        goalWeightKg:    toKg(goalWeight, weightUnit),
        targetDate,
        activityLevel,
      }).calorie_goal
    } catch { return null }
  }, [age, height, curWeight, goalWeight, targetDate, activityLevel, heightUnit, weightUnit])

  async function runCalculation() {
    const profile = {
      age: +age,
      heightCm:        toCm(height,     heightUnit),
      currentWeightKg: toKg(curWeight,  weightUnit),
      goalWeightKg:    toKg(goalWeight, weightUnit),
      targetDate,
      activityLevel,
    }
    localStorage.setItem(`bulkr_profile_${userId}`, JSON.stringify({
      age: +age, height: +height, heightUnit,
      curWeight: +curWeight, goalWeight: +goalWeight, weightUnit,
      targetDate, activityLevel,
    }))
    setCalculating(true)
    for (let i = 0; i < CALC_LINES.length; i++) {
      await new Promise(r => setTimeout(r, 650))
      setCalcLine(i)
    }
    await new Promise(r => setTimeout(r, 500))
    const goals = calculateMacros(profile)
    onComplete({ ...goals, activity_level: activityLevel })
  }

  // ── Shared styles ──────────────────────────────────────────────────────────
  const inputCls   = `w-full py-3.5 px-4 rounded-2xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-colors bg-transparent placeholder:text-gray-500 ${dk ? 'border-white/10 text-white' : 'border-gray-200 text-gray-900'}`
  const labelRow   = 'flex items-center justify-between mb-2'
  const labelCls   = `text-[11px] font-semibold uppercase tracking-wider ${dk ? 'text-gray-500' : 'text-gray-400'}`

  const rawDiff  = +goalWeight - +curWeight
  const showDiff = +curWeight > 0 && +goalWeight > 0

  // ── Steps ──────────────────────────────────────────────────────────────────
  const STEPS = [
    // 0 — Stats
    {
      heading: "Let's build\nyour plan.",
      valid: +age > 0 && +height > 0,
      fields: (
        <div className="flex flex-col gap-4">
          <div>
            <div className={labelRow}><label className={labelCls}>Age</label></div>
            <input type="number" inputMode="numeric" placeholder="25" min="14" max="100"
              value={age} onChange={e => setAge(e.target.value)} className={inputCls} />
          </div>
          <div>
            <div className={labelRow}>
              <label className={labelCls}>Height</label>
              <UnitToggle options={['cm','in']} value={heightUnit} onChange={handleHeightUnitChange} darkMode={dk} />
            </div>
            <input type="number" inputMode="decimal"
              placeholder={heightUnit === 'cm' ? '178' : '70'}
              value={height} onChange={e => setHeight(e.target.value)} className={inputCls} />
          </div>
        </div>
      ),
      btnLabel: 'Continue',
      onNext: goNext,
    },

    // 1 — Weight
    {
      heading: 'Where are\nyou now?',
      valid: +curWeight > 0 && +goalWeight > 0,
      fields: (
        <div className="flex flex-col gap-4">
          <div>
            <div className={labelRow}>
              <label className={labelCls}>Current Weight</label>
              <UnitToggle options={['kg','lbs']} value={weightUnit} onChange={handleWeightUnitChange} darkMode={dk} />
            </div>
            <input type="number" inputMode="decimal"
              placeholder={weightUnit === 'kg' ? '80' : '176'}
              value={curWeight} onChange={e => setCurWeight(e.target.value)} className={inputCls} />
          </div>
          <div>
            <div className={labelRow}>
              <label className={labelCls}>Goal Weight</label>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${dk ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                {weightUnit}
              </span>
            </div>
            <input type="number" inputMode="decimal"
              placeholder={weightUnit === 'kg' ? '90' : '198'}
              value={goalWeight} onChange={e => setGoalWeight(e.target.value)} className={inputCls} />
            <AnimatePresence>
              {showDiff && Math.abs(rawDiff) >= 0.1 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                  className="flex items-baseline gap-1.5 mt-3 px-1"
                >
                  <span className={`text-[15px] font-bold ${rawDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {rawDiff >= 0 ? '+' : ''}{rawDiff.toFixed(1)} {weightUnit}
                  </span>
                  <span className={`text-[12px] ${dk ? 'text-gray-500' : 'text-gray-400'}`}>
                    {rawDiff >= 0 ? 'total to gain' : 'total to cut'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ),
      btnLabel: 'Continue',
      onNext: goNext,
    },

    // 2 — Timeline
    {
      heading: 'When do you\nwant to hit it?',
      valid: !!targetDate && targetDate >= minDate,
      fields: (
        <MiniCalendar value={targetDate} onChange={setTargetDate} minDate={minDate} darkMode={dk} />
      ),
      btnLabel: 'Continue',
      onNext: goNext,
    },

    // 3 — Activity level + live preview
    {
      heading: 'How active\nare you?',
      valid: !!activityLevel,
      fields: (
        <div className="flex flex-col gap-2.5">
          {ACTIVITY_OPTIONS.map(opt => {
            const active = activityLevel === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setActivityLevel(opt.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                  active
                    ? 'border-[#007aff] bg-[#007aff]/10'
                    : dk ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  active ? 'border-[#007aff]' : dk ? 'border-white/25' : 'border-gray-300'
                }`}>
                  {active && <div className="w-2 h-2 rounded-full bg-[#007aff]" />}
                </div>
                <div className="min-w-0">
                  <p className={`text-[14px] font-semibold leading-tight ${dk ? 'text-white' : 'text-gray-900'}`}>
                    {opt.label}
                  </p>
                  <p className={`text-[12px] leading-tight mt-0.5 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>
                    {opt.desc}
                  </p>
                </div>
              </button>
            )
          })}

          {/* Live calorie preview */}
          <AnimatePresence>
            {liveCalories && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
                className={`mt-1 rounded-2xl px-4 py-3.5 border flex items-center justify-between transition-colors ${
                  dk ? 'bg-white/[0.05] border-white/[0.08]' : 'bg-white/70 border-gray-200 shadow-sm'
                }`}
              >
                <span className={`text-[12px] font-semibold uppercase tracking-wider ${dk ? 'text-gray-500' : 'text-gray-400'}`}>
                  Daily Energy Target
                </span>
                <motion.span
                  key={liveCalories}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`text-[22px] font-black tabular-nums ${dk ? 'text-white' : 'text-[#0a0a0a]'}`}
                >
                  {liveCalories.toLocaleString()}
                  <span className={`text-[13px] font-medium ml-1 ${dk ? 'text-gray-400' : 'text-gray-500'}`}>kcal</span>
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ),
      btnLabel: 'Calculate my plan →',
      onNext: runCalculation,
    },
  ]

  // ── Calculating screen ────────────────────────────────────────────────────
  if (calculating) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${dk ? 'bg-black' : 'bg-[#f2f2f7]'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="w-full max-w-sm"
        >
          <h2 className={`text-[32px] font-black tracking-tight leading-tight mb-10 ${dk ? 'text-white' : 'text-[#0a0a0a]'}`}>
            Calculating<br />your plan…
          </h2>
          <div className="flex flex-col gap-5">
            {CALC_LINES.map((line, i) => (
              <AnimatePresence key={i}>
                {calcLine >= i && (
                  <motion.div
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35 }} className="flex items-center gap-3"
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors duration-300 ${
                      calcLine > i ? 'bg-emerald-500 text-white' : 'bg-white/10 animate-pulse'
                    }`}>
                      {calcLine > i ? '✓' : ''}
                    </span>
                    <span className={`text-[15px] font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{line}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Step screens ──────────────────────────────────────────────────────────
  const current = STEPS[step]

  return (
    <div className={`min-h-screen flex flex-col px-6 pt-14 pb-10 ${dk ? 'bg-black' : 'bg-[#f2f2f7]'}`}>
      <div className="w-full max-w-sm mx-auto flex flex-col flex-1">

        <div className="flex gap-1.5 mb-10">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-[3px] rounded-full transition-all duration-300 ${
              i === step   ? `flex-[3] ${dk ? 'bg-white' : 'bg-[#0a0a0a]'}`
              : i < step   ? `flex-1 ${dk ? 'bg-white/40' : 'bg-gray-400'}`
                           : `flex-1 ${dk ? 'bg-white/10' : 'bg-gray-200'}`
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.h2
            key={`h${step}`} custom={dir} variants={slideVariants}
            initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}
            className={`text-[32px] font-black tracking-tight leading-tight whitespace-pre-line mb-8 ${dk ? 'text-white' : 'text-[#0a0a0a]'}`}
          >
            {current.heading}
          </motion.h2>
        </AnimatePresence>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={`f${step}`} custom={dir} variants={slideVariants}
            initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}
            className="flex-1"
          >
            {current.fields}
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-8 flex flex-col gap-2">
          <button type="button" onClick={current.onNext} disabled={!current.valid}
            className="w-full bg-[#007aff] text-white font-semibold text-[15px] py-3.5 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-25">
            {current.btnLabel}
          </button>
          {step > 0 && (
            <button type="button" onClick={goBack}
              className={`w-full text-center text-[13px] py-2 ${dk ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}>
              ← Back
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
