# bulkr

A chat-based macro and calorie tracker powered by AI. Describe what you ate, snap a photo, and bulkr figures out the rest — logging macros automatically through a conversational interface.

---

## Features

- **AI food logging** — describe a meal in plain text or upload a photo; the AI asks clarifying questions then logs macros automatically
- **Chat interface** — conversational UX, messages persist per day and reload on refresh
- **Smart onboarding** — 4-step setup collects age, height, weight, goal weight, target date, and activity level to calculate personalised calorie and macro targets
- **Macro targets** — calculated using the Mifflin-St Jeor BMR formula × TDEE activity multiplier, with bulk (+250–500 kcal) or cut (−500 kcal) adjustment
- **Quick Add library** — save meals to a personal library and log them in one tap
- **Photo upload** — attach a food photo and the AI analyses it for macros
- **Google OAuth + email auth** — sign in with Google or email/password
- **Dark mode** — defaults to dark, persists across sessions
- **Glassmorphic UI** — iOS-inspired design with backdrop blur, animated fitness ring, and coloured macro progress bars

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend / DB | Supabase (Postgres + Auth + Storage) |
| AI | Google Gemini (`gemini-3-flash-preview`) |

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/your-username/bulkr.git
cd bulkr
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Supabase setup

Run the following SQL in your Supabase **SQL Editor**:

```sql
-- User settings (macro/calorie goals)
create table if not exists public.user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  calorie_goal integer not null default 3000,
  protein_goal integer not null default 150,
  carbs_goal   integer not null default 300,
  fat_goal     integer not null default 100,
  activity_level text default 'moderately_active'
);

alter table public.user_settings enable row level security;
create policy "Users manage own settings" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Daily food logs
create table if not exists public.food_logs (
  id uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  food_name  text not null,
  calories   integer not null default 0,
  protein    numeric not null default 0,
  carbs      numeric not null default 0,
  fat        numeric not null default 0,
  image_url  text,
  created_at timestamptz default now() not null
);

alter table public.food_logs enable row level security;
create policy "Users manage own logs" on public.food_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Chat messages (persisted per day)
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role       text not null,
  text       text not null default '',
  image      text,
  created_at timestamptz default now() not null
);

alter table public.chat_messages enable row level security;
create policy "Users manage own messages" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Quick Add library
create table if not exists public.quick_add_library (
  id uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  meal_name  text not null,
  calories   integer not null default 0,
  protein    numeric not null default 0,
  carbs      numeric not null default 0,
  fat        numeric not null default 0,
  created_at timestamptz default now() not null
);

alter table public.quick_add_library enable row level security;
create policy "Users manage own library" on public.quick_add_library
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Create a **Storage bucket** named `food-images` and set it to **public**.

### 4. Google OAuth (optional)

In your Supabase project go to **Authentication → Providers → Google** and add your Google OAuth client ID and secret. Set the redirect URL to your app's origin.

### 5. Run

```bash
npm run dev
```

---

## Project Structure

```
src/
├── components/
│   ├── Auth.jsx             # Login / signup / forgot password screen
│   ├── ChatBubble.jsx       # Individual message bubble
│   ├── ChatList.jsx         # Scrollable message list
│   ├── FitnessRing.jsx      # Animated SVG calorie ring
│   ├── Header.jsx           # Sticky header with ring + macro bars
│   ├── InputBar.jsx         # Message input, camera, quick-add menu
│   ├── OnboardingScreen.jsx # 4-step goal setup flow
│   ├── QuickAddModal.jsx    # Save a new meal to the library
│   └── SettingsModal.jsx    # Settings sheet (recalculate / sign out)
├── lib/
│   ├── gemini.js            # Gemini chat session + macro JSON extraction
│   ├── macros.js            # BMR/TDEE calculation logic
│   └── supabase.js          # All Supabase queries
├── App.jsx                  # Root — auth gate, data loading, message orchestration
├── main.jsx
└── index.css
```

---

## Macro Calculation

Goals are calculated during onboarding using **Mifflin-St Jeor BMR**:

```
BMR  = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5
TDEE = BMR × activity multiplier
```

| Activity Level | Multiplier |
|---|---|
| Sedentary | 1.2 |
| Lightly Active | 1.375 |
| Moderately Active | 1.55 |
| Very Active | 1.725 |

Calorie target is then adjusted based on goal:
- **Bulk** — adds 250–500 kcal surplus (scaled to reach goal weight by target date)
- **Cut** — subtracts 500 kcal
- **Maintenance** — no adjustment

Macro split:
- **Protein** — 2g per kg of goal weight
- **Fat** — 25% of calories ÷ 9 (min 55g)
- **Carbs** — remaining calories ÷ 4 (min 100g)

---

## Scripts

```bash
npm run dev      # Start dev server with HMR
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
npm run lint     # ESLint
```

---

## License

MIT
