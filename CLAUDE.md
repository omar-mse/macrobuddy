# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint (React hooks + refresh rules)
```

No test framework is configured.

## Environment Variables

Requires a `.env` file with:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=
```

## Architecture

**MacroBuddy** is a chat-based food tracker. The user describes food (or uploads a photo), and a Gemini AI assistant extracts macros and logs them to Supabase.

### Data Flow

1. User sends text/image via `InputBar` → `App.jsx` orchestrates the flow
2. Images are base64-encoded and uploaded to Supabase `food-images` bucket
3. `lib/gemini.js` sends the message + image to Gemini with a structured system prompt
4. Gemini responds in a conversational style, then embeds a JSON block with `{ food_name, calories, protein, carbs, fat }` once it has enough info
5. `App.jsx` strips the JSON from the visible message, then calls `lib/supabase.js` to write to `food_logs` and re-fetch the daily calorie total
6. `Header.jsx` renders the calorie ring using the updated daily total (goal: 3000 kcal)

### Key Conventions

- **Single anonymous user:** all DB operations use a hardcoded guest UUID (`00000000-0000-0000-0000-000000000000`).
- **AI model:** `gemini-2.5-flash-preview-04-17` in `lib/gemini.js` — the system prompt is defined there and controls the entire conversation flow and JSON output format.
- **Chat session:** a persistent Gemini `ChatSession` object is held in module scope in `gemini.js`; reloading the page resets conversation history.
- **Calorie goal** is hardcoded as `CALORIE_GOAL = 3000` in `App.jsx`.
