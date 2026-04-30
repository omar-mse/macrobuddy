import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const GUEST_UUID = '00000000-0000-0000-0000-000000000000'
export const FOOD_IMAGES_BUCKET = 'food-images'

export async function uploadFoodImage(file) {
  const ext = file.name?.split('.').pop() || 'jpg'
  const path = `${GUEST_UUID}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
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
}) {
  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      user_id: GUEST_UUID,
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

export async function fetchTodayCalories() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('food_logs')
    .select('calories')
    .eq('user_id', GUEST_UUID)
    .gte('created_at', today.toISOString())
  if (error) throw error
  return (data || []).reduce((sum, row) => sum + (row.calories || 0), 0)
}
