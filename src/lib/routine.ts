import { createClient } from './supabase/client'
import { DailyRoutine } from '@/types'

const supabase = createClient()

export async function getRoutines(userId: string): Promise<DailyRoutine[]> {
  const { data, error } = await supabase
    .from('daily_routines')
    .select('*')
    .eq('user_id', userId)
    .order('time', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createRoutine(
  userId: string,
  label: string,
  time: string,
  order: number = 0
): Promise<DailyRoutine> {
  const { data, error } = await supabase
    .from('daily_routines')
    .insert({
      user_id: userId,
      label,
      time,
      is_done: false,
      order,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateRoutine(
  id: string,
  updates: Partial<DailyRoutine>
): Promise<DailyRoutine> {
  const { data, error } = await supabase
    .from('daily_routines')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function toggleRoutine(id: string, is_done: boolean): Promise<void> {
  const { error } = await supabase
    .from('daily_routines')
    .update({ is_done })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function deleteRoutine(id: string): Promise<void> {
  const { error } = await supabase
    .from('daily_routines')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
