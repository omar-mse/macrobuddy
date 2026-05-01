# Dark Mode & Logout Design

**Date:** 2026-05-01  
**Status:** Approved

---

## Overview

Two features: (1) a full-app dark mode toggle with Sun/Moon icon in the header, and (2) a hidden logout triggered by long-pressing the "MacroBuddy" title.

---

## 1. Theme Token System

### Approach
CSS custom properties defined in `index.css` on `:root` (light) and `.dark` (dark). The `dark` class is toggled on `document.documentElement`. Theme preference is persisted to `localStorage`.

### Color Palette

| Token            | Light       | Dark       |
|------------------|-------------|------------|
| `--bg-app`       | `#f2f2f7`   | `#000000`  |
| `--bg-surface`   | `#ffffff`   | `#1c1c1e`  |
| `--bg-surface-2` | `#f2f2f7`   | `#2c2c2e`  |
| `--text-primary` | `#000000`   | `#ffffff`  |
| `--text-secondary` | `#6b7280` | `#8e8e93`  |
| `--text-tertiary` | `#9ca3af`  | `#636366`  |
| `--border`       | `#e5e7eb`   | `#3a3a3c`  |
| `--bubble-ai`    | `#e9e9eb`   | `#2c2c2e`  |
| `--bubble-ai-text` | `#000000` | `#ffffff`  |

### Unchanged elements
- User chat bubbles: `#007aff` (vibrant in both modes)
- Macro bar accents: emerald, amber, rose (unchanged)
- Fitness ring stroke colors: unchanged

### Transition
`:root` gets `transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease` — covers all surfaces automatically.

---

## 2. Header Toggle

### State
`App.jsx` owns theme state:
```js
const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')
```
On mount and on toggle, `document.documentElement.classList.toggle('dark', isDark)` and `localStorage.setItem('theme', isDark ? 'dark' : 'light')`.

### Header layout
```
[Active ●]                    [Sun | Moon]  [Settings]
```
- `isDark === true` → show `Sun` icon (click switches to light)
- `isDark === false` → show `Moon` icon (click switches to dark)
- Icon: 18px, same style as `Settings` (`text-gray-400 hover:text-gray-600 active:scale-90`)
- Props added to `Header`: `isDark: boolean`, `onToggleTheme: () => void`

---

## 3. Logout via Long-Press

### Trigger
Long-press (600ms) on the "MacroBuddy" `<h1>` title in the header.

### Implementation
- `onPointerDown`: start a `setTimeout(signOut, 600)`
- `onPointerUp` / `onPointerLeave`: clear the timeout
- Calls `supabase.auth.signOut()` — the existing `onAuthStateChange` listener in `App.jsx` sets `session` to `null`, which auto-renders `<AuthScreen />`

### Visual feedback
- `transition-opacity duration-150` on the title element
- While holding: opacity drops to 50% (`opacity-50`)
- On release before 600ms: opacity snaps back to 100%
- No confirmation dialog, no visible button

---

## Files to Change

| File | Change |
|------|--------|
| `src/index.css` | Add CSS token definitions + transition on `:root` |
| `src/App.jsx` | Add `isDark` state, `useEffect` to sync class + localStorage, pass props to `Header`, add `onLogout` handler |
| `src/components/Header.jsx` | Add `isDark`/`onToggleTheme` props, Sun/Moon icon, long-press logout on title, update hardcoded colors to CSS vars |
| `src/components/ChatBubble.jsx` | Update AI bubble bg/text to CSS vars |
| `src/components/ChatList.jsx` | Update bg to CSS var if needed |
| `src/components/InputBar.jsx` | Update bg-[#f2f2f7], bg-white, border colors to CSS vars |
| `src/components/SettingsModal.jsx` | Update bg-white, bg-[#f2f2f7], text colors to CSS vars |
| `src/components/Auth.jsx` | Update bg-[#f2f2f7], bg-white to CSS vars |
