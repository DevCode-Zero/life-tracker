// ============================================================
// LIFE TRACKER — Core Types
// ============================================================

// ── User & Auth ──────────────────────────────────────────────
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  age?: number
  weight_kg?: number
  height_cm?: number
  income_monthly?: number
  currency: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  user_id: string
  theme: 'light' | 'dark' | 'system'
  notifications_enabled: boolean
  morning_reminder_time: string   // "07:00"
  evening_reminder_time: string   // "20:00"
  sip_reminder_day: number        // 1-28 (day of month)
  notion_connected: boolean
  notion_page_id?: string
  weekly_report_enabled: boolean
}

// ── Habits ───────────────────────────────────────────────────
export type HabitCategory = 'health' | 'fitness' | 'finance' | 'learning' | 'nutrition'
export type HabitFrequency = 'daily' | 'weekly'

export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  category: HabitCategory
  frequency: HabitFrequency
  target_days: number[]           // [1,2,3,4,5] = Mon-Fri
  is_active: boolean
  streak_current: number
  streak_best: number
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string            // ISO date string
  note?: string
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[]
  completion_rate_7d: number      // 0-100
  completion_rate_30d: number     // 0-100
  completed_today: boolean
}

export interface WeeklyHabitSummary {
  habit_id: string
  habit_name: string
  emoji: string
  days: {
    date: string
    completed: boolean
  }[]
  completion_rate: number
}

// ── Budget & Finance ─────────────────────────────────────────
export type TransactionType = 'income' | 'expense' | 'saving' | 'investment'
export type BudgetCategory =
  | 'salary'
  | 'rent'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'personal'
  | 'entertainment'
  | 'health'
  | 'learning'
  | 'sip'
  | 'emergency_fund'
  | 'other'

export interface BudgetItem {
  id: string
  user_id: string
  name: string
  category: BudgetCategory
  type: TransactionType
  budgeted_amount: number
  month: string                   // "2026-03"
  is_recurring: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  budget_item_id?: string
  name: string
  category: BudgetCategory
  type: TransactionType
  amount: number
  date: string
  note?: string
  created_at: string
}

export interface MonthlyBudgetSummary {
  month: string
  total_income: number
  total_expenses: number
  total_savings: number
  total_invested: number
  remaining_buffer: number
  savings_rate: number            // percentage
  transactions: Transaction[]
}

export interface Investment {
  id: string
  user_id: string
  name: string
  type: 'sip' | 'emergency_fund' | 'ppf' | 'nps' | 'stocks' | 'other'
  monthly_amount: number
  total_invested: number
  current_value?: number
  started_at: string
  is_active: boolean
}

export interface FinancialGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  category: 'emergency_fund' | 'investment' | 'purchase' | 'travel' | 'other'
  is_completed: boolean
  created_at: string
}

// ── Workout & Routine ────────────────────────────────────────
export type WorkoutType = 'strength' | 'cardio' | 'yoga' | 'walk' | 'rest'
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core' | 'full_body'

export interface Exercise {
  id: string
  name: string
  muscle_group: MuscleGroup
  equipment: 'none' | 'dumbbell' | 'barbell' | 'resistance_band' | 'pull_up_bar'
  instructions: string
  video_url?: string
}

export interface WorkoutPlan {
  id: string
  user_id: string
  name: string
  day_of_week: number             // 0=Sun, 1=Mon...
  workout_type: WorkoutType
  focus: MuscleGroup
  exercises: WorkoutPlanExercise[]
  estimated_duration_mins: number
  is_active: boolean
}

export interface WorkoutPlanExercise {
  exercise_id: string
  exercise: Exercise
  sets: number
  reps: string                    // "10-12" or "30s"
  rest_seconds: number
  order: number
}

export interface WorkoutLog {
  id: string
  user_id: string
  workout_plan_id?: string
  name: string
  workout_type: WorkoutType
  started_at: string
  completed_at?: string
  duration_mins?: number
  notes?: string
  exercises_completed: CompletedExercise[]
}

export interface CompletedExercise {
  exercise_id: string
  exercise_name: string
  sets_completed: SetLog[]
}

export interface SetLog {
  set_number: number
  reps_completed: number
  weight_kg?: number
  duration_secs?: number
}

export interface DailyRoutine {
  id: string
  user_id: string
  label: string
  time: string                    // "HH:MM"
  is_done: boolean
  order: number
  created_at: string
}

// ── Nutrition & Meals ────────────────────────────────────────
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MealPlan {
  id: string
  user_id: string
  day_of_week: number
  meal_type: MealType
  name: string
  description?: string
  protein_g: number
  carbs_g: number
  fat_g: number
  calories: number
  ingredients: string[]
  is_template: boolean
}

export interface MealLog {
  id: string
  user_id: string
  meal_plan_id?: string
  name: string
  meal_type: MealType
  logged_at: string
  protein_g: number
  carbs_g: number
  fat_g: number
  calories: number
  photo_url?: string
  notes?: string
}

export interface DailyNutritionSummary {
  date: string
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  total_calories: number
  target_protein_g: number
  target_calories: number
  meals: MealLog[]
}

export interface GroceryItem {
  id: string
  user_id: string
  name: string
  quantity: string
  estimated_cost: number
  category: string
  is_purchased: boolean
  week_of: string                 // "2026-W10"
}

// ── Dashboard & Analytics ────────────────────────────────────
export interface DashboardStats {
  user: User
  today: {
    date: string
    habits_completed: number
    habits_total: number
    habit_score: number           // 0-100
    calories_consumed: number
    workout_done: boolean
    steps?: number
  }
  streak: {
    current: number
    best: number
  }
  finance: {
    month: string
    income: number
    expenses: number
    savings: number
    savings_rate: number
    buffer: number
  }
  life_score: number              // 0-100 composite
  weekly_trends: WeeklyTrend[]
}

export interface WeeklyTrend {
  date: string
  habit_score: number
  calories: number
  workout_done: boolean
  money_saved: number
}

// ── API Response Types ───────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

// ── Form Types ───────────────────────────────────────────────
export interface CreateHabitForm {
  name: string
  emoji: string
  category: HabitCategory
  frequency: HabitFrequency
  target_days: number[]
}

export interface CreateTransactionForm {
  name: string
  category: BudgetCategory
  type: TransactionType
  amount: number
  date: string
  note?: string
}

export interface CreateWorkoutLogForm {
  name: string
  workout_type: WorkoutType
  duration_mins: number
  notes?: string
}

export interface CreateMealLogForm {
  name: string
  meal_type: MealType
  protein_g: number
  carbs_g: number
  fat_g: number
  calories: number
  notes?: string
}
