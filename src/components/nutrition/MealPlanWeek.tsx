'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Utensils, Plus, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddMealModal } from './AddMealModal'
import { logMeal, getTodaysMealLogs, deleteMealPlan } from '@/lib/nutrition'
import { toast } from 'react-hot-toast'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

interface MealPlanWeekProps {
  userId?: string
}

export function MealPlanWeek({ userId }: MealPlanWeekProps) {
  const [meals, setMeals] = useState<any[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const today = new Date().getDay()

  const load = async () => {
    if (!userId) { setLoading(false); return }
    const supabase = createClient()
    const [mealsData, logsData] = await Promise.all([
      supabase.from('meal_plans').select('*').eq('user_id', userId).order('day_of_week'),
      getTodaysMealLogs(userId)
    ])
    
    setMeals(mealsData.data ?? [])
    setLogs(logsData)
    setLoading(false)
  }

  const handleLog = async (planId: string) => {
    if (!userId) return
    try {
      await logMeal(userId, planId)
      setLogs([...logs, planId])
      toast.success('Meal logged! 🥙')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meal plan?')) return
    try {
      await deleteMealPlan(id)
      toast.success('Meal plan deleted')
      load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  useEffect(() => { load() }, [userId])

  const todayMeals = meals.filter(m => m.day_of_week === today)
  const totalProtein = todayMeals.reduce((s, m) => s + (m.protein_g ?? 0), 0)
  const totalCalories = todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Utensils className="w-4 h-4" /> Today's Meals
        </CardTitle>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </CardHeader>

      <AddMealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId ?? ''}
        onSuccess={load}
      />
      <CardContent className="space-y-3">
        {loading && <div className="h-24 bg-zinc-800 rounded animate-pulse" />}
        {!loading && todayMeals.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-3">No meals planned for today</p>
        )}
        {todayMeals.map(meal => {
          const isLogged = logs.includes(meal.id)
          return (
            <div key={meal.id} className="group flex justify-between items-start bg-zinc-950/50 p-2 rounded-lg border border-transparent hover:border-zinc-800 transition-all">
              <div className="flex gap-3">
                <button
                  onClick={() => !isLogged && handleLog(meal.id)}
                  disabled={isLogged}
                  className={cn(
                    "mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                    isLogged ? "bg-green-500 border-green-500 text-white" : "border-zinc-700 hover:border-violet-500 text-transparent"
                  )}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">{meal.meal_type}</p>
                    <button onClick={() => handleDelete(meal.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-zinc-700 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className={cn("text-sm transition-colors", isLogged ? "text-zinc-500 line-through" : "text-white font-medium")}>
                    {meal.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400">{Math.round(meal.calories)} kcal</p>
                <p className="text-xs text-blue-400/80 font-medium">{Math.round(meal.protein_g)}g protein</p>
              </div>
            </div>
          )
        })}
        {todayMeals.length > 0 && (
          <div className="flex justify-between pt-2 border-t border-zinc-800 text-xs font-semibold">
            <span className="text-zinc-400">Total</span>
            <span className="text-white">{Math.round(totalCalories)} kcal · {Math.round(totalProtein)}g protein</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
