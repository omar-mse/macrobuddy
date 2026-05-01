import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

const genAI = new GoogleGenerativeAI(apiKey)

const SYSTEM_PROMPT = `You are a supportive Gym Buddy. When a user sends food info, do not calculate yet. Ask 1-2 probing questions to increase accuracy (e.g., "Was that sourdough or white bread? Any butter?"). Only after they answer, provide a JSON response with: food_name, calories, protein, carbs, fat.

When you are ready to log the food, respond with a short confident sentence followed by a single fenced JSON code block on its own lines, like:

\`\`\`json
{"food_name":"...", "calories":0, "protein":0, "carbs":0, "fat":0}
\`\`\`

Numbers must be plain numbers (no units). Do not include the JSON until you've gathered enough detail through your follow-up questions.`

const model = genAI.getGenerativeModel({
  model: 'gemini-3-flash-preview',
  systemInstruction: SYSTEM_PROMPT,
})

export function createChatSession(history = []) {
  return model.startChat({ history })
}

export async function sendToBuddy(chat, { text, base64Image, mimeType }) {
  const parts = []
  if (base64Image) {
    parts.push({ inlineData: { data: base64Image, mimeType: mimeType || 'image/jpeg' } })
  }
  if (text) parts.push({ text })
  if (parts.length === 0) parts.push({ text: '' })
  const result = await chat.sendMessage(parts)
  return result.response.text()
}

export async function fileToBase64(file) {
  const buf = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunkSize),
    )
  }
  return btoa(binary)
}

export function extractMacroJSON(text) {
  if (!text) return null
  const fenced = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i)
  const candidate = fenced ? fenced[1] : null
  const tryParse = (raw) => {
    try {
      const obj = JSON.parse(raw)
      if (
        obj &&
        typeof obj === 'object' &&
        typeof obj.food_name === 'string' &&
        typeof obj.calories === 'number'
      ) {
        return {
          food_name: obj.food_name,
          calories: Number(obj.calories) || 0,
          protein: Number(obj.protein) || 0,
          carbs: Number(obj.carbs) || 0,
          fat: Number(obj.fat) || 0,
        }
      }
    } catch {
      return null
    }
    return null
  }
  if (candidate) {
    const parsed = tryParse(candidate)
    if (parsed) return parsed
  }
  // Fallback: scan for first {...} block containing food_name + calories.
  const re = /\{[^{}]*"food_name"[^{}]*"calories"[^{}]*\}/
  const m = text.match(re)
  if (m) return tryParse(m[0])
  return null
}

export function stripMacroJSON(text) {
  if (!text) return text
  return text
    .replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/gi, '')
    .trim()
}
