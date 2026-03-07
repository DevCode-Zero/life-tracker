'use client'

import { useStore } from '@/store'
import { MealPlanWeek } from '@/components/nutrition/MealPlanWeek'

export default function NutritionPage() {
  const { user } = useStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-extrabold tracking-tight">Nutrition & Meals 🍽️</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Plan your weekly meals and track your macros.
        </p>
      </div>

      <div className="max-w-4xl">
        <MealPlanWeek userId={user?.id ?? ''} />
      </div>
    </div>
  )
}
