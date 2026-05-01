export const ACTIVITY_OPTIONS = [
  { value: 'sedentary',         label: 'Sedentary',         desc: 'Office job, little exercise',     multiplier: 1.2   },
  { value: 'lightly_active',    label: 'Lightly Active',    desc: '1–3 days/week exercise',          multiplier: 1.375 },
  { value: 'moderately_active', label: 'Moderately Active', desc: '3–5 days/week exercise',          multiplier: 1.55  },
  { value: 'very_active',       label: 'Very Active',       desc: '6–7 days/week hard exercise',     multiplier: 1.725 },
]

export function calculateMacros({
  age, heightCm, currentWeightKg, goalWeightKg, targetDate,
  activityLevel = 'moderately_active',
}) {
  // Mifflin-St Jeor BMR (male baseline — appropriate for a bulk-focused app)
  const bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * age + 5

  const multiplier = ACTIVITY_OPTIONS.find(o => o.value === activityLevel)?.multiplier ?? 1.55
  const tdee = bmr * multiplier

  const isBulk = goalWeightKg > currentWeightKg
  const isCut  = goalWeightKg < currentWeightKg

  let adjustment = 0
  if (isBulk) {
    const days = Math.max(28, (new Date(targetDate) - new Date()) / 864e5)
    const raw  = ((goalWeightKg - currentWeightKg) / days) * 7700
    adjustment = Math.min(Math.max(Math.round(raw), 250), 500)
  } else if (isCut) {
    adjustment = -500
  }

  const calorie_goal = Math.round(tdee + adjustment)
  const protein_goal = Math.round(goalWeightKg * 2)
  const fat_goal     = Math.max(55, Math.round(calorie_goal * 0.25 / 9))
  const carbs_goal   = Math.max(100, Math.round((calorie_goal - protein_goal * 4 - fat_goal * 9) / 4))

  return { calorie_goal, protein_goal, carbs_goal, fat_goal }
}
