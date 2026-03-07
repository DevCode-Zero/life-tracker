# 🏠 Life Tracker

> Your Personal Operating System — Health, Finance & Habits

A **fully functional PWA** (Progressive Web App) built with Next.js 14, Supabase, and TypeScript. Works on both mobile and web. No app store required.

---

## ⚡ Features

| Module | Features |
|---|---|
| ⚡ **Habits** | Daily tracker, 7-day grid, streak counter, monthly checkboxes, categories |
| 💰 **Budget** | Income/expense logger, monthly summary, savings rate, 12-month tracker |
| 🍽️ **Nutrition** | Weekly meal plan, macro tracking, grocery list, protein targets |
| 🏋️ **Workout** | Home workout plan (no gym), exercise library, workout logs, routine |
| 📊 **Dashboard** | Life Score, stat cards, financial goals, daily timeline |
| 🔗 **Notion Sync** | Two-way sync with your Notion workspace |
| 📱 **PWA** | Installable on iOS/Android, works offline, push notifications |

---

## 🏗️ Tech Stack

```
Frontend:   Next.js 14 (App Router) + TypeScript + Tailwind CSS
State:      Zustand (with persistence)
Database:   Supabase (Postgres + Auth + Realtime + RLS)
Forms:      React Hook Form + Zod validation
UI:         Radix UI primitives + custom components
Animations: Framer Motion
Testing:    Jest + Testing Library + Playwright (E2E)
CI/CD:      GitHub Actions → Vercel
```

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/life-tracker.git
cd life-tracker
npm install
```

### 2. Set up Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. Run `docs/schema.sql` in your Supabase SQL editor
3. Copy your project URL and anon key

### 3. Configure Environment
```bash
cp .env.example .env.local
# Fill in your Supabase credentials
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Run Tests
```bash
npm run test              # Unit tests
npm run test:coverage     # With coverage report
npm run test:e2e          # E2E with Playwright
npm run test:all          # Everything
```

---

## 📁 Project Structure

```
life-tracker/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── dashboard/        # Main dashboard
│   │   ├── habits/           # Habit tracker
│   │   ├── budget/           # Budget & finance
│   │   ├── nutrition/        # Meal plans
│   │   ├── workout/          # Workout planner
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── ui/               # Base UI components
│   │   ├── habits/           # Habit components
│   │   ├── budget/           # Budget components
│   │   ├── nutrition/        # Nutrition components
│   │   ├── workout/          # Workout components
│   │   ├── layout/           # Sidebar, nav, shell
│   │   └── shared/           # Shared components
│   ├── lib/
│   │   ├── supabase/         # Supabase clients
│   │   ├── habits.ts         # Habits data layer
│   │   ├── budget.ts         # Budget data layer
│   │   ├── validators/       # Zod schemas
│   │   └── utils/            # Helper functions
│   ├── store/                # Zustand global state
│   └── types/                # TypeScript types
├── tests/
│   ├── unit/                 # Jest unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # Playwright E2E tests
├── docs/
│   └── schema.sql            # Full Supabase schema
├── .github/workflows/        # CI/CD pipeline
└── public/
    └── manifest.json         # PWA manifest
```

---

## 🗺️ Roadmap

- [ ] **v1.0** — Core dashboard, habits, budget, nutrition, workout
- [ ] **v1.5** — Mobile PWA with push notifications, Notion sync
- [ ] **v2.0** — AI Coach , weekly auto-reports

---

## 🧪 Test Coverage

```
✓ Unit Tests:        36/36 passing
✓ Validators:        Full Zod schema coverage
✓ E2E Tests:         Auth, Dashboard, Habits, Budget, Nutrition, Workout, PWA, Mobile
✓ CI/CD:             GitHub Actions → Lint → Test → Build → Deploy
```

---

## 📱 Install as App

**Android:** Open in Chrome → Menu → "Add to Home Screen"
**iPhone:** Open in Safari → Share → "Add to Home Screen"

---

## 🔐 Security

- Row Level Security (RLS) enabled on all Supabase tables
- Users can only access their own data
- JWT-based authentication via Supabase Auth
- No sensitive data in client-side state

---

Built for ** User who ever logins ** — 🇮🇳 | *"Build the life you want, one habit at a time"*
