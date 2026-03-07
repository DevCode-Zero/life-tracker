import { z } from 'zod'

// ── Habit ─────────────────────────────────────────────────────
export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Max 80 chars'),
  emoji: z.string().min(1, 'Emoji is required').max(4),
  category: z.enum(['health', 'fitness', 'finance', 'learning', 'nutrition']),
  frequency: z.enum(['daily', 'weekly']),
  target_days: z
    .array(z.number().min(1).max(7))
    .min(1, 'Select at least 1 day'),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>

// ── Transaction ───────────────────────────────────────────────
export const createTransactionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum([
    'salary', 'rent', 'food', 'transport', 'utilities',
    'personal', 'entertainment', 'health', 'learning',
    'sip', 'emergency_fund', 'other',
  ]),
  type: z.enum(['income', 'expense', 'saving', 'investment']),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive')
    .max(10_000_000, 'Amount too large'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  note: z.string().max(200).optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>

// ── Workout Log ───────────────────────────────────────────────
export const createWorkoutLogSchema = z.object({
  name: z.string().min(1, 'Workout name required').max(100),
  workout_type: z.enum(['strength', 'cardio', 'yoga', 'walk', 'rest']),
  duration_mins: z
    .number()
    .min(1, 'Must be at least 1 minute')
    .max(300, 'Max 5 hours'),
  notes: z.string().max(500).optional(),
})

export type CreateWorkoutLogInput = z.infer<typeof createWorkoutLogSchema>

// ── Meal Log ──────────────────────────────────────────────────
export const createMealLogSchema = z.object({
  name: z.string().min(1, 'Meal name required').max(100),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  protein_g: z.number().min(0).max(500),
  carbs_g: z.number().min(0).max(1000),
  fat_g: z.number().min(0).max(300),
  calories: z.number().min(0).max(5000),
  notes: z.string().max(200).optional(),
})

export type CreateMealLogInput = z.infer<typeof createMealLogSchema>

// ── Financial Goal ────────────────────────────────────────────
export const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  target_amount: z.number().positive().max(100_000_000),
  current_amount: z.number().min(0),
  target_date: z.string().optional(),
  category: z.enum([
    'emergency_fund', 'investment', 'purchase', 'travel', 'other',
  ]),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>

// ── Profile ───────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(100),
  age: z.number().min(13).max(120).optional(),
  weight_kg: z.number().min(20).max(500).optional(),
  height_cm: z.number().min(100).max(250).optional(),
  income_monthly: z.number().min(0).optional(),
  currency: z.string().length(3).default('INR'),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
