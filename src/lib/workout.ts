import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { todayString } from '@/lib/utils'

const supabase = createClient()

export async function getWorkoutPlans(userId: string) {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*, workout_plan_exercises(*, exercises(*))')
    .eq('user_id', userId)
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

export async function createWorkoutPlan(userId: string, name: string, dayOfWeek: number, focus: string) {
  const { data, error } = await supabase
    .from('workout_plans')
    .insert({
      user_id: userId,
      name,
      day_of_week: dayOfWeek,
      focus,
      workout_type: 'strength',
      estimated_duration_mins: 45
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateWorkoutPlan(id: string, updates: any) {
  const { data, error } = await supabase
    .from('workout_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteWorkoutPlan(id: string) {
  const { error } = await supabase
    .from('workout_plans')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getWeeklyWorkoutCount(userId: string): Promise<number> {
  const { startOfWeek } = await import('date-fns')
  const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const { count, error } = await supabase
    .from('workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('started_at', start)
  
  if (error) throw error
  return count || 0
}

export async function logWorkout(userId: string, planId: string) {
  // First fetch the plan details
  const { data: plan } = await supabase
    .from('workout_plans')
    .select('name, workout_type, estimated_duration_mins')
    .eq('id', planId)
    .single()

  if (!plan) throw new Error('Workout plan not found')

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: userId,
      workout_plan_id: planId,
      name: plan.name,
      workout_type: plan.workout_type,
      duration_mins: plan.estimated_duration_mins,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTodaysWorkoutLog(userId: string, planId: string) {
  const today = todayString()
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('workout_plan_id', planId)
    .gte('started_at', `${today}T00:00:00`)
    .lte('started_at', `${today}T23:59:59`)
    .maybeSingle()
  
  if (error) throw error
  return data
}
