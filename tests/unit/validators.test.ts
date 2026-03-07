import {
  createHabitSchema,
  createTransactionSchema,
  createWorkoutLogSchema,
  createMealLogSchema,
  createGoalSchema,
} from '@/lib/validators'

// ── Habit Validator ───────────────────────────────────────────
describe('createHabitSchema', () => {
  const validHabit = {
    name: 'Morning workout',
    emoji: '🏋️',
    category: 'fitness' as const,
    frequency: 'daily' as const,
    target_days: [1, 2, 3, 4, 5],
  }

  it('accepts valid habit', () => {
    const result = createHabitSchema.safeParse(validHabit)
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createHabitSchema.safeParse({ ...validHabit, name: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('required')
  })

  it('rejects name over 80 chars', () => {
    const result = createHabitSchema.safeParse({
      ...validHabit,
      name: 'a'.repeat(81),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid category', () => {
    const result = createHabitSchema.safeParse({
      ...validHabit,
      category: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty target_days', () => {
    const result = createHabitSchema.safeParse({
      ...validHabit,
      target_days: [],
    })
    expect(result.success).toBe(false)
  })

  it('accepts all 7 days', () => {
    const result = createHabitSchema.safeParse({
      ...validHabit,
      target_days: [1, 2, 3, 4, 5, 6, 7],
    })
    expect(result.success).toBe(true)
  })
})

// ── Transaction Validator ─────────────────────────────────────
describe('createTransactionSchema', () => {
  const validTx = {
    name: 'Grocery shopping',
    category: 'food' as const,
    type: 'expense' as const,
    amount: 1500,
    date: '2026-03-07',
  }

  it('accepts valid transaction', () => {
    expect(createTransactionSchema.safeParse(validTx).success).toBe(true)
  })

  it('rejects negative amount', () => {
    const result = createTransactionSchema.safeParse({ ...validTx, amount: -100 })
    expect(result.success).toBe(false)
  })

  it('rejects zero amount', () => {
    const result = createTransactionSchema.safeParse({ ...validTx, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects invalid date format', () => {
    const result = createTransactionSchema.safeParse({ ...validTx, date: '07/03/2026' })
    expect(result.success).toBe(false)
  })

  it('rejects amount over 10 million', () => {
    const result = createTransactionSchema.safeParse({ ...validTx, amount: 10_000_001 })
    expect(result.success).toBe(false)
  })

  it('accepts optional note', () => {
    const result = createTransactionSchema.safeParse({ ...validTx, note: 'Weekly groceries' })
    expect(result.success).toBe(true)
  })

  it('accepts income type', () => {
    const result = createTransactionSchema.safeParse({
      ...validTx,
      type: 'income',
      category: 'salary',
    })
    expect(result.success).toBe(true)
  })
})

// ── Workout Log Validator ─────────────────────────────────────
describe('createWorkoutLogSchema', () => {
  const validLog = {
    name: 'Chest Day',
    workout_type: 'strength' as const,
    duration_mins: 35,
  }

  it('accepts valid workout log', () => {
    expect(createWorkoutLogSchema.safeParse(validLog).success).toBe(true)
  })

  it('rejects zero duration', () => {
    expect(createWorkoutLogSchema.safeParse({ ...validLog, duration_mins: 0 }).success).toBe(false)
  })

  it('rejects duration over 300 mins', () => {
    expect(createWorkoutLogSchema.safeParse({ ...validLog, duration_mins: 301 }).success).toBe(false)
  })

  it('rejects empty name', () => {
    expect(createWorkoutLogSchema.safeParse({ ...validLog, name: '' }).success).toBe(false)
  })

  it('accepts all workout types', () => {
    const types = ['strength', 'cardio', 'yoga', 'walk', 'rest'] as const
    types.forEach((t) => {
      expect(createWorkoutLogSchema.safeParse({ ...validLog, workout_type: t }).success).toBe(true)
    })
  })
})

// ── Meal Log Validator ────────────────────────────────────────
describe('createMealLogSchema', () => {
  const validMeal = {
    name: '4 Eggs + Roti',
    meal_type: 'breakfast' as const,
    protein_g: 30,
    carbs_g: 40,
    fat_g: 15,
    calories: 420,
  }

  it('accepts valid meal', () => {
    expect(createMealLogSchema.safeParse(validMeal).success).toBe(true)
  })

  it('rejects negative macros', () => {
    expect(createMealLogSchema.safeParse({ ...validMeal, protein_g: -1 }).success).toBe(false)
  })

  it('rejects calories over 5000', () => {
    expect(createMealLogSchema.safeParse({ ...validMeal, calories: 5001 }).success).toBe(false)
  })

  it('accepts all meal types', () => {
    const types = ['breakfast', 'lunch', 'dinner', 'snack'] as const
    types.forEach((t) => {
      expect(createMealLogSchema.safeParse({ ...validMeal, meal_type: t }).success).toBe(true)
    })
  })
})

// ── Financial Goal Validator ──────────────────────────────────
describe('createGoalSchema', () => {
  const validGoal = {
    name: 'Emergency Fund',
    target_amount: 60000,
    current_amount: 18000,
    category: 'emergency_fund' as const,
  }

  it('accepts valid goal', () => {
    expect(createGoalSchema.safeParse(validGoal).success).toBe(true)
  })

  it('rejects negative target', () => {
    expect(createGoalSchema.safeParse({ ...validGoal, target_amount: -1000 }).success).toBe(false)
  })

  it('rejects negative current amount', () => {
    expect(createGoalSchema.safeParse({ ...validGoal, current_amount: -1 }).success).toBe(false)
  })

  it('accepts optional target date', () => {
    const result = createGoalSchema.safeParse({ ...validGoal, target_date: '2026-12-31' })
    expect(result.success).toBe(true)
  })
})
