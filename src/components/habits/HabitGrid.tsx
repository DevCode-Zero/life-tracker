'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getHabitsWithLogs, logHabit, unlogHabit } from '@/lib/habits'
import { useStore } from '@/store'
import { cn, todayString } from '@/lib/utils'
import { format, subDays } from 'date-fns'
import { Plus, Flame, Pencil, Trash2 } from 'lucide-react'
import type { HabitWithLogs } from '@/types'
import { AddHabitModal } from './AddHabitModal'
import { UpdateHabitModal } from './UpdateHabitModal'
import { deleteHabit } from '@/lib/habits'

interface HabitGridProps {
  userId: string
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function HabitGrid({ userId }: HabitGridProps) {
  const { habits, setHabits, updateHabitCompletion } = useStore()
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitWithLogs | null>(null)

  const today = todayString()
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
  )

  const load = useCallback(async () => {
    if (!userId) return
    try {
      const data = await getHabitsWithLogs(userId, 7)
      setHabits(data)
    } finally {
      setLoading(false)
    }
  }, [userId, setHabits])

  useEffect(() => { load() }, [load])

  const handleToggle = async (habit: HabitWithLogs) => {
    if (toggling) return
    setToggling(habit.id)

    const wasCompleted = habit.completed_today
    // Optimistic update
    updateHabitCompletion(habit.id, !wasCompleted)

    try {
      if (wasCompleted) {
        await unlogHabit(habit.id, today)
        toast(`${habit.emoji} ${habit.name} unchecked`, { icon: '↩️' })
      } else {
        await logHabit(habit.id, userId, today)
        toast.success(`${habit.emoji} ${habit.name} done!`)
      }
      await load()
    } catch (err) {
      // Rollback
      updateHabitCompletion(habit.id, wasCompleted)
      toast.error('Failed to update habit')
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return
    try {
      await deleteHabit(habitId)
      toast.success('Habit deleted')
      load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const completedCount = habits.filter((h) => h.completed_today).length
  const score = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="card-title">⚡ Today's Habits</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(), 'EEEE, MMM d')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            'px-3 py-1 rounded-full text-xs font-mono font-semibold border',
            score >= 80 ? 'bg-green-500/10 border-green-500/30 text-green-400' :
            score >= 50 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
            'bg-muted border-border text-muted-foreground'
          )}>
            {completedCount}/{habits.length} · {score}%
          </div>
          <button 
            className="btn-icon" 
            title="Add habit"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        onSuccess={load}
      />

      <UpdateHabitModal
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        habit={editingHabit}
        onSuccess={load}
      />

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[1fr_repeat(7,28px)] gap-x-1 mb-2 px-1">
        <div />
        {DAY_LABELS.map((d, i) => (
          <div
            key={i}
            className={cn(
              'text-center text-[10px] font-semibold font-mono',
              weekDates[i] === today ? 'text-violet-400' : 'text-muted-foreground'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Habit rows */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-9 bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-3xl mb-2">🌱</p>
          <p className="text-sm">No habits yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              weekDates={weekDates}
              today={today}
              isToggling={toggling === habit.id}
              onToggleToday={() => handleToggle(habit)}
              onEdit={() => setEditingHabit(habit)}
              onDelete={() => handleDelete(habit.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function HabitRow({
  habit,
  weekDates,
  today,
  isToggling,
  onToggleToday,
  onEdit,
  onDelete,
}: {
  habit: HabitWithLogs
  weekDates: string[]
  today: string
  isToggling: boolean
  onToggleToday: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      layout
      className={cn(
        'group grid grid-cols-[1fr_repeat(7,28px)] gap-x-1 items-center px-1 py-1.5 rounded-lg',
        'transition-colors hover:bg-muted/30',
        habit.completed_today && 'bg-green-500/5'
      )}
    >
      {/* Habit name */}
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <span className="text-base leading-none">{habit.emoji}</span>
        <span className={cn(
          'text-sm truncate mr-1',
          habit.completed_today ? 'text-foreground font-medium' : 'text-muted-foreground'
        )}>
          {habit.name}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-0.5 hover:text-blue-400 text-zinc-600">
            <Pencil className="w-3 h-3" />
          </button>
          <button onClick={onDelete} className="p-0.5 hover:text-red-400 text-zinc-600">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        {habit.streak_current >= 3 && (
          <span className="ml-auto flex items-center gap-0.5 text-[10px] font-mono text-orange-400 shrink-0">
            <Flame className="w-2.5 h-2.5" />{habit.streak_current}
          </span>
        )}
      </div>

      {/* Day dots */}
      {weekDates.map((date) => {
        const isToday = date === today
        const completed = isToday
          ? habit.completed_today
          : habit.logs.some((l) => l.completed_at === date)
        const isFuture = date > today

        return (
          <button
            key={date}
            disabled={!isToday || isToggling || isFuture}
            onClick={isToday ? onToggleToday : undefined}
            className={cn(
              'w-6 h-6 rounded-md mx-auto flex items-center justify-center',
              'transition-all duration-150',
              isFuture && 'opacity-20 cursor-default',
              !isFuture && !isToday && 'cursor-default',
              isToday && !completed && 'border-2 border-violet-500/50 hover:border-violet-500 hover:bg-violet-500/10 cursor-pointer',
              isToday && isToggling && 'opacity-50',
              completed && 'bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.4)]',
              !completed && !isToday && !isFuture && 'bg-muted/60',
            )}
            title={isToday ? (completed ? 'Mark incomplete' : 'Mark complete') : date}
          >
            {completed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-[10px] text-white font-bold"
              >
                ✓
              </motion.span>
            )}
          </button>
        )
      })}
    </motion.div>
  )
}
