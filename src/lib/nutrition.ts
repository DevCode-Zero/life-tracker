import { createClient } from '@/lib/supabase/client'
import { todayString } from '@/lib/utils'

const supabase = createClient()

export async function getMealPlans(userId: string) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week')
  
  if (error) throw error
  return data
}

export async function createMealPlan(userId: string, name: string, dayOfWeek: number, mealType: string, calories: number, protein: number) {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      user_id: userId,
      name,
      day_of_week: dayOfWeek,
      meal_type: mealType,
      calories,
      protein_g: protein,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateMealPlan(id: string, updates: any) {
  const { data, error } = await supabase
    .from('meal_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteMealPlan(id: string) {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function logMeal(userId: string, planId: string) {
  // First fetch the plan details to satisfy NOT NULL constraints
  const { data: plan } = await supabase
    .from('meal_plans')
    .select('name, meal_type, calories, protein_g, carbs_g, fat_g')
    .eq('id', planId)
    .single()

  if (!plan) throw new Error('Meal plan not found')

  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: userId,
      meal_plan_id: planId,
      name: plan.name,
      meal_type: plan.meal_type,
      calories: plan.calories,
      protein_g: plan.protein_g,
      carbs_g: plan.carbs_g,
      fat_g: plan.fat_g,
      logged_at: todayString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTodaysMealLogs(userId: string) {
  const today = todayString()
  const { data, error } = await supabase
    .from('meal_logs')
    .select('meal_plan_id')
    .eq('user_id', userId)
    .eq('logged_at', today)
  
  if (error) throw error
  return data?.map(d => d.meal_plan_id) || []
}
