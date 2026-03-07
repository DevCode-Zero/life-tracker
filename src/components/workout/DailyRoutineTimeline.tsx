import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { getRoutines, toggleRoutine, deleteRoutine } from '@/lib/routine'
import { DailyRoutine } from '@/types'
import { toast } from 'react-hot-toast'
import { AddRoutineModal } from './AddRoutineModal'
import { UpdateRoutineModal } from './UpdateRoutineModal'

interface DailyRoutineTimelineProps {
  userId: string
}

export function DailyRoutineTimeline({ userId }: DailyRoutineTimelineProps) {
  const [routines, setRoutines] = useState<DailyRoutine[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<DailyRoutine | null>(null)

  const load = async () => {
    if (!userId) return
    try {
      const data = await getRoutines(userId)
      setRoutines(data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [userId])

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleRoutine(id, !currentStatus)
      setRoutines(prev => prev.map(r => r.id === id ? { ...r, is_done: !currentStatus } : r))
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteRoutine(id)
      toast.success('Task removed')
      load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Daily Routine</CardTitle>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </CardHeader>

      <AddRoutineModal 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        userId={userId}
        onSuccess={load}
      />

      <UpdateRoutineModal
        isOpen={!!editingRoutine}
        onClose={() => setEditingRoutine(null)}
        routine={editingRoutine}
        onSuccess={load}
      />

      <CardContent>
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />)}
          </div>
        )}
        {!loading && routines.length === 0 && (
          <p className="text-xs text-zinc-500 text-center py-4">No tasks scheduled</p>
        )}
        <div className="relative space-y-0">
          {routines.map((item, i) => (
            <div key={item.id} className="group flex gap-3 pb-4 last:pb-0">
              <div 
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleToggle(item.id, item.is_done)}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 transition-colors ${item.is_done ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-zinc-700'}`} />
                {i < routines.length - 1 && (
                  <div className={`w-px flex-1 mt-1 ${item.is_done ? 'bg-blue-500/40' : 'bg-zinc-800'}`} />
                )}
              </div>
              <div className="flex-1 flex items-center justify-between min-w-0">
                <div 
                  className="cursor-pointer"
                  onClick={() => handleToggle(item.id, item.is_done)}
                >
                  <p className="text-[11px] text-zinc-500 font-mono leading-none mb-1">{item.time}</p>
                  <p className={`text-sm transition-all ${item.is_done ? 'text-zinc-500 line-through' : 'text-white'}`}>{item.label}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingRoutine(editingRoutine || item)} // Simple guard
                    className="p-1 hover:text-blue-400 text-zinc-500 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1 hover:text-red-400 text-zinc-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
