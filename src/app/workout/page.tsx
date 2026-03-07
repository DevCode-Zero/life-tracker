'use client'

import { useStore } from '@/store'
import { WorkoutToday } from '@/components/workout/WorkoutToday'
import { DailyRoutineTimeline } from '@/components/workout/DailyRoutineTimeline'

export default function WorkoutPage() {
  const { user } = useStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-extrabold tracking-tight">Workout & Fitness 🏋️</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Stay active and track your daily routine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorkoutToday userId={user?.id ?? ''} />
        </div>
        <div>
          <DailyRoutineTimeline />
        </div>
      </div>
    </div>
  )
}
