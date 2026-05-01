import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const FOOD_IMAGES_BUCKET = 'food-images'

export async function uploadFoodImage(file, userId) {
  const ext = file.name?.split('.').pop() || 'jpg'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage
    .from(FOOD_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from(FOOD_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function insertFoodLog({
  food_name,
  calories,
  protein,
  carbs,
  fat,
  image_url,
  userId,
}) {
  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      user_id: userId,
      food_name,
      calories,
      protein,
      carbs,
      fat,
      image_url,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('calorie_goal, protein_goal, carbs_goal, fat_goal, activity_level')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertUserSettings(userId, { calorie_goal, protein_goal, carbs_goal, fat_goal, activity_level }) {
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, calorie_goal, protein_goal, carbs_goal, fat_goal, activity_level }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function fetchQuickAddLibrary(userId) {
  const { data, error } = await supabase
    .from('quick_add_library')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function saveQuickAdd(userId, { meal_name, calories, protein, carbs, fat }) {
  const { data, error } = await supabase
    .from('quick_add_library')
    .insert({ user_id: userId, meal_name, calories, protein, carbs, fat })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchTodayChatMessages(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, text, image, ts')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .order('ts', { ascending: true })
  if (error) throw error
  return (data || []).map((row) => ({
    id: row.id,
    role: row.role,
    text: row.text,
    image: row.image || null,
    ts: row.ts,
  }))
}

export async function insertChatMessage(userId, { role, text, image, ts }) {
  const { error } = await supabase
    .from('chat_messages')
    .insert({ user_id: userId, role, text: text || '', image: image || null, ts })
  if (error) throw error
}

export async function fetchTodayMacros(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('food_logs')
    .select('calories, protein, carbs, fat')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
  if (error) throw error
  return (data || []).reduce(
    (acc, row) => ({
      calories: acc.calories + (row.calories || 0),
      protein: acc.protein + (row.protein || 0),
      carbs: acc.carbs + (row.carbs || 0),
      fat: acc.fat + (row.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}
