'use client'

import { useStore } from '@/store'
import { HabitGrid } from '@/components/habits/HabitGrid'

export default function HabitsPage() {
  const { user } = useStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-extrabold tracking-tight">Habit Tracker ⚡</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Build the life you want, one habit at a time.
        </p>
      </div>

      <HabitGrid userId={user?.id ?? ''} />
    </div>
  )
}
