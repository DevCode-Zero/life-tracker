-- ============================================================
-- LIFE TRACKER — Supabase / PostgreSQL Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users (extends Supabase auth.users) ──────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  age           SMALLINT,
  weight_kg     DECIMAL(5,2),
  height_cm     DECIMAL(5,2),
  income_monthly DECIMAL(12,2),
  currency      TEXT NOT NULL DEFAULT 'INR',
  timezone      TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── User Settings ─────────────────────────────────────────────
CREATE TABLE public.user_settings (
  user_id                 UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme                   TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light','dark','system')),
  notifications_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  morning_reminder_time   TIME NOT NULL DEFAULT '07:00',
  evening_reminder_time   TIME NOT NULL DEFAULT '20:00',
  sip_reminder_day        SMALLINT NOT NULL DEFAULT 1 CHECK (sip_reminder_day BETWEEN 1 AND 28),
  notion_connected        BOOLEAN NOT NULL DEFAULT FALSE,
  notion_page_id          TEXT,
  weekly_report_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Habits ────────────────────────────────────────────────────
CREATE TABLE public.habits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  emoji           TEXT NOT NULL DEFAULT '⚡',
  category        TEXT NOT NULL CHECK (category IN ('health','fitness','finance','learning','nutrition')),
  frequency       TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily','weekly')),
  target_days     SMALLINT[] NOT NULL DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Mon, 7=Sun
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  streak_current  INTEGER NOT NULL DEFAULT 0,
  streak_best     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON public.habits(user_id);

-- ── Habit Logs ────────────────────────────────────────────────
CREATE TABLE public.habit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id        UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, completed_at)  -- One log per habit per day
);

CREATE INDEX idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_date ON public.habit_logs(user_id, completed_at);

-- ── Budget Items (monthly budget plan) ────────────────────────
CREATE TABLE public.budget_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('income','expense','saving','investment')),
  budgeted_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  month           CHAR(7) NOT NULL,   -- "2026-03"
  is_recurring    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_budget_items_user_month ON public.budget_items(user_id, month);

-- ── Transactions ──────────────────────────────────────────────
CREATE TABLE public.transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  budget_item_id  UUID REFERENCES public.budget_items(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('income','expense','saving','investment')),
  amount          DECIMAL(12,2) NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category);

-- ── Investments ───────────────────────────────────────────────
CREATE TABLE public.investments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('sip','emergency_fund','ppf','nps','stocks','other')),
  monthly_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_invested  DECIMAL(12,2) NOT NULL DEFAULT 0,
  current_value   DECIMAL(12,2),
  started_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investments_user_id ON public.investments(user_id);

-- ── Financial Goals ───────────────────────────────────────────
CREATE TABLE public.financial_goals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  target_amount   DECIMAL(12,2) NOT NULL,
  current_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  target_date     DATE,
  category        TEXT NOT NULL CHECK (category IN ('emergency_fund','investment','purchase','travel','other')),
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Exercises (global library) ────────────────────────────────
CREATE TABLE public.exercises (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL UNIQUE,
  muscle_group    TEXT NOT NULL CHECK (muscle_group IN ('chest','back','shoulders','biceps','triceps','legs','core','full_body')),
  equipment       TEXT NOT NULL DEFAULT 'none' CHECK (equipment IN ('none','dumbbell','barbell','resistance_band','pull_up_bar')),
  instructions    TEXT NOT NULL DEFAULT '',
  video_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Workout Plans ─────────────────────────────────────────────
CREATE TABLE public.workout_plans (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  day_of_week           SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  workout_type          TEXT NOT NULL CHECK (workout_type IN ('strength','cardio','yoga','walk','rest')),
  focus                 TEXT NOT NULL,
  estimated_duration_mins SMALLINT NOT NULL DEFAULT 35,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_plans_user ON public.workout_plans(user_id);

-- ── Workout Plan Exercises ────────────────────────────────────
CREATE TABLE public.workout_plan_exercises (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id       UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  exercise_id   UUID NOT NULL REFERENCES public.exercises(id),
  sets          SMALLINT NOT NULL DEFAULT 3,
  reps          TEXT NOT NULL DEFAULT '10-12',
  rest_seconds  SMALLINT NOT NULL DEFAULT 60,
  order_index   SMALLINT NOT NULL DEFAULT 0
);

-- ── Workout Logs ──────────────────────────────────────────────
CREATE TABLE public.workout_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  workout_type    TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  duration_mins   SMALLINT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_logs_user_date ON public.workout_logs(user_id, started_at);

-- ── Meal Plans ────────────────────────────────────────────────
CREATE TABLE public.meal_plans (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type     TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  name          TEXT NOT NULL,
  description   TEXT,
  protein_g     DECIMAL(6,2) NOT NULL DEFAULT 0,
  carbs_g       DECIMAL(6,2) NOT NULL DEFAULT 0,
  fat_g         DECIMAL(6,2) NOT NULL DEFAULT 0,
  calories      DECIMAL(7,2) NOT NULL DEFAULT 0,
  ingredients   TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_template   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_plans_user ON public.meal_plans(user_id);

-- ── Meal Logs ─────────────────────────────────────────────────
CREATE TABLE public.meal_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meal_plan_id  UUID REFERENCES public.meal_plans(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  meal_type     TEXT NOT NULL,
  logged_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  protein_g     DECIMAL(6,2) NOT NULL DEFAULT 0,
  carbs_g       DECIMAL(6,2) NOT NULL DEFAULT 0,
  fat_g         DECIMAL(6,2) NOT NULL DEFAULT 0,
  calories      DECIMAL(7,2) NOT NULL DEFAULT 0,
  photo_url     TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_logs_user_date ON public.meal_logs(user_id, logged_at);

-- ── Grocery List ──────────────────────────────────────────────
CREATE TABLE public.grocery_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  quantity        TEXT NOT NULL DEFAULT '1',
  estimated_cost  DECIMAL(8,2) NOT NULL DEFAULT 0,
  category        TEXT NOT NULL DEFAULT 'general',
  is_purchased    BOOLEAN NOT NULL DEFAULT FALSE,
  week_of         TEXT NOT NULL,  -- "2026-W10"
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row Level Security (RLS) ──────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies — users can only access their own data
CREATE POLICY "Users own data" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own habit_logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own budget_items" ON public.budget_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own investments" ON public.investments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own goals" ON public.financial_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own workout_plans" ON public.workout_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own workout_logs" ON public.workout_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own meal_plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own meal_logs" ON public.meal_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own grocery_items" ON public.grocery_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Exercises are public" ON public.exercises FOR SELECT USING (true);

-- ── Auto-update updated_at ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Auto-create profile on signup ─────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_settings(user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Seed Default Exercises ────────────────────────────────────
INSERT INTO public.exercises (name, muscle_group, equipment, instructions) VALUES
  ('Push-ups', 'chest', 'none', 'Start in plank. Lower chest to floor. Push back up.'),
  ('Diamond Push-ups', 'triceps', 'none', 'Form diamond with hands under chest. Lower and push.'),
  ('Chair Dips', 'triceps', 'none', 'Hands on chair edge behind you. Dip down and push up.'),
  ('Door Pull-ups', 'back', 'pull_up_bar', 'Hang from bar. Pull chest to bar.'),
  ('Inverted Rows', 'back', 'none', 'Lie under table. Pull chest up to table edge.'),
  ('Plank', 'core', 'none', 'Hold straight body position on forearms for time.'),
  ('Crunches', 'core', 'none', 'Lie on back. Crunch abs to lift shoulders.'),
  ('Leg Raises', 'core', 'none', 'Lie flat. Raise straight legs to 90 degrees.'),
  ('Bodyweight Squats', 'legs', 'none', 'Feet shoulder-width. Squat to 90 degrees.'),
  ('Lunges', 'legs', 'none', 'Step forward. Lower back knee to ground.'),
  ('Wall Sit', 'legs', 'none', 'Back to wall. Squat to 90 degrees and hold.'),
  ('Glute Bridges', 'legs', 'none', 'Lie on back. Push hips up, squeeze glutes.'),
  ('Mountain Climbers', 'core', 'none', 'Plank position. Drive knees to chest alternating.'),
  ('Burpees', 'full_body', 'none', 'Squat down, jump back to plank, push-up, jump up.'),
  ('Jump Squats', 'legs', 'none', 'Regular squat but explode up into a jump.');
