'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dumbbell, Plus, CheckCircle2, Trash2 } from 'lucide-react'
import { AddWorkoutModal } from './AddWorkoutModal'
import { logWorkout, getTodaysWorkoutLog, deleteWorkoutPlan } from '@/lib/workout'
import { toast } from 'react-hot-toast'

interface WorkoutTodayProps {
  userId?: string
}

export function WorkoutToday({ userId }: WorkoutTodayProps) {
  const [plan, setPlan] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [logging, setLogging] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dayOfWeek = new Date().getDay()

  const load = async () => {
    if (!userId) { setLoading(false); return }
    const supabase = createClient()
    const { data } = await supabase
      .from('workout_plans')
      .select('*, workout_plan_exercises(*, exercises(*))')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .maybeSingle()
    
    if (data) {
      setPlan(data)
      const log = await getTodaysWorkoutLog(userId, data.id)
      setIsCompleted(!!log)
    }
    setLoading(false)
  }

  const handleLog = async () => {
    if (!userId || !plan || logging || isCompleted) return
    setLogging(true)
    try {
      await logWorkout(userId, plan.id)
      setIsCompleted(true)
      toast.success('Workout logged! Keep it up! 💪')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLogging(false)
    }
  }

  const handleDelete = async () => {
    if (!plan || !confirm('Delete this workout plan?')) return
    try {
      await deleteWorkoutPlan(plan.id)
      toast.success('Workout plan deleted')
      setPlan(null)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  useEffect(() => { load() }, [userId])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Dumbbell className="w-4 h-4" /> Today's Workout
        </CardTitle>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </CardHeader>
      
      <AddWorkoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId ?? ''}
        onSuccess={load}
      />
      <CardContent>
        {loading && <div className="h-16 bg-zinc-800 rounded animate-pulse" />}
        {!loading && !plan && (
          <div className="text-center py-4">
            <p className="text-zinc-500 text-sm">Rest day 🧘</p>
            <p className="text-zinc-600 text-xs mt-1">No workout scheduled for today</p>
          </div>
        )}
        {plan && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">{plan.name}</p>
                <button onClick={handleDelete} className="p-1 hover:text-red-400 text-zinc-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Badge variant="default">{plan.estimated_duration_mins}min</Badge>
            </div>
            <p className="text-xs text-zinc-400">{plan.focus}</p>
            <div className="space-y-1.5">
              {plan.workout_plan_exercises?.slice(0, 4).map((wpe: any) => (
                <div key={wpe.id} className="flex justify-between text-xs">
                  <span className="text-zinc-300">{wpe.exercises?.name}</span>
                  <span className="text-zinc-500">{wpe.sets}×{wpe.reps}</span>
                </div>
              ))}
              {plan.workout_plan_exercises?.length > 4 && (
                <p className="text-xs text-zinc-600">+{plan.workout_plan_exercises.length - 4} more</p>
              )}
            </div>
            
            <Button
              onClick={handleLog}
              disabled={isCompleted || logging}
              variant={isCompleted ? 'outline' : 'default'}
              className="w-full mt-4"
            >
              {isCompleted ? (
                <span className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
              ) : logging ? 'Logging...' : 'Mark as Done'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
