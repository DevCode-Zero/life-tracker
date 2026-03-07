'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { Target, Plus, Pencil, Trash2 } from 'lucide-react'
import { formatCompactCurrency } from '@/lib/utils'
import { AddGoalModal } from './AddGoalModal'
import { UpdateGoalModal } from './UpdateGoalModal'
import { deleteFinancialGoal } from '@/lib/budget'
import { toast } from 'react-hot-toast'

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  category: string
  is_completed: boolean
}

interface GoalsListProps {
  userId: string
}

export function GoalsList({ userId }: GoalsListProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const load = async () => {
    if (!userId) return
    const supabase = createClient()
    const { data } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false })
      .limit(5)
    
    setGoals(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [userId])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    try {
      await deleteFinancialGoal(id)
      toast.success('Goal deleted')
      load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4" /> Goals
        </CardTitle>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </CardHeader>

      <AddGoalModal 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        userId={userId}
        onSuccess={load}
      />

      <UpdateGoalModal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        goal={editingGoal}
        onSuccess={load}
      />

      <CardContent className="space-y-4">
        {loading && (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />)}
          </div>
        )}
        {!loading && goals.length === 0 && (
          <p className="text-xs text-zinc-500 text-center py-4">No active goals yet</p>
        )}
        {goals.map(goal => {
          const pct = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100)
          return (
            <div key={goal.id} className="group space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{goal.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{pct}%</Badge>
                  <button 
                    onClick={() => setEditingGoal(goal)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-blue-400 transition-all"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleDelete(goal.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <Progress value={pct} indicatorClassName="bg-emerald-500" />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>{formatCompactCurrency(goal.current_amount)}</span>
                <span>{formatCompactCurrency(goal.target_amount)}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
