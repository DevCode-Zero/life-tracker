import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitLog, HabitWithLogs, CreateHabitForm } from '@/types'
import { format, subDays, startOfWeek } from 'date-fns'

const supabase = createClient()

// ── CRUD ─────────────────────────────────────────────────────

export async function getHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createHabit(
  userId: string,
  form: CreateHabitForm
): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert({ ...form, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateHabit(
  habitId: string,
  updates: Partial<Habit>
): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteHabit(habitId: string): Promise<void> {
  // Soft delete
  const { error } = await supabase
    .from('habits')
    .update({ is_active: false })
    .eq('id', habitId)

  if (error) throw new Error(error.message)
}

// ── Logging ───────────────────────────────────────────────────

export async function logHabit(
  habitId: string,
  userId: string,
  date?: string
): Promise<HabitLog> {
  const completedAt = date ?? format(new Date(), 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(
      { habit_id: habitId, user_id: userId, completed_at: completedAt },
      { onConflict: 'habit_id,completed_at' }
    )
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Update streak
  await recalculateStreak(habitId)

  return data
}

export async function unlogHabit(
  habitId: string,
  date: string
): Promise<void> {
  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('habit_id', habitId)
    .eq('completed_at', date)

  if (error) throw new Error(error.message)
  await recalculateStreak(habitId)
}

// ── Queries ───────────────────────────────────────────────────

export async function getHabitsWithLogs(
  userId: string,
  days: number = 7
): Promise<HabitWithLogs[]> {
  const since = format(subDays(new Date(), days), 'yyyy-MM-dd')
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: habits, error: hErr } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at')

  if (hErr) throw new Error(hErr.message)

  const { data: logs, error: lErr } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_at', since)

  if (lErr) throw new Error(lErr.message)

  return (habits ?? []).map((habit) => {
    const habitLogs = (logs ?? []).filter((l) => l.habit_id === habit.id)
    const last7 = habitLogs.filter((l) => l.completed_at >= format(subDays(new Date(), 7), 'yyyy-MM-dd'))
    const last30 = habitLogs.filter((l) => l.completed_at >= format(subDays(new Date(), 30), 'yyyy-MM-dd'))

    return {
      ...habit,
      logs: habitLogs,
      completion_rate_7d: Math.round((last7.length / 7) * 100),
      completion_rate_30d: Math.round((last30.length / 30) * 100),
      completed_today: habitLogs.some((l) => l.completed_at === today),
    }
  })
}

export async function getTodayHabits(userId: string) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const habits = await getHabitsWithLogs(userId, 1)

  return habits.map((h) => ({
    ...h,
    completed_today: h.logs.some((l) => l.completed_at === today),
  }))
}

export async function getWeeklyHabitGrid(userId: string) {
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const today = format(new Date(), 'yyyy-MM-dd')

  const habits = await getHabitsWithLogs(userId, 7)

  return habits.map((habit) => ({
    habit_id: habit.id,
    habit_name: habit.name,
    emoji: habit.emoji,
    days: Array.from({ length: 7 }, (_, i) => {
      const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
      return {
        date,
        completed: habit.logs.some((l) => l.completed_at === date),
        is_today: date === today,
      }
    }),
    completion_rate: habit.completion_rate_7d,
  }))
}

// ── Streak Calculation ────────────────────────────────────────

async function recalculateStreak(habitId: string): Promise<void> {
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('completed_at')
    .eq('habit_id', habitId)
    .order('completed_at', { ascending: false })

  if (!logs || logs.length === 0) return

  let currentStreak = 0
  let checkDate = new Date()

  for (const log of logs) {
    const logDate = format(new Date(log.completed_at), 'yyyy-MM-dd')
    const checkDateStr = format(checkDate, 'yyyy-MM-dd')

    if (logDate === checkDateStr) {
      currentStreak++
      checkDate = subDays(checkDate, 1)
    } else {
      break
    }
  }

  // Get current best streak
  const { data: habit } = await supabase
    .from('habits')
    .select('streak_best')
    .eq('id', habitId)
    .single()

  const bestStreak = Math.max(currentStreak, habit?.streak_best ?? 0)

  await supabase
    .from('habits')
    .update({ streak_current: currentStreak, streak_best: bestStreak })
    .eq('id', habitId)
}
