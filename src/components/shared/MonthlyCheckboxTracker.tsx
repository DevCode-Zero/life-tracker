'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { getYearlySavingsTrack } from '@/lib/budget'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const CURRENT_MONTH = new Date().getMonth() // 0-indexed

interface MonthlyCheckboxTrackerProps {
  userId: string
}

export function MonthlyCheckboxTracker({ userId }: MonthlyCheckboxTrackerProps) {
  const [checkedMonths, setCheckedMonths] = useState<Set<number>>(new Set())
  const [totalSaved, setTotalSaved] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    async function load() {
      try {
        const data = await getYearlySavingsTrack(userId, 2026)
        const saved = new Set<number>()
        let total = 0
        data.forEach((item, idx) => {
          if (item.saved) saved.add(idx)
          total += item.amount
        })
        setCheckedMonths(saved)
        setTotalSaved(total)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  const toggle = (idx: number) => {
    // This is now read-only based on real transactions, 
    // but we could let user click to navigate to that month in budget?
    // For now, let's just keep it as a status display.
  }

  const completedCount = checkedMonths.size

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-title">📅 2026 Savings</h2>
        <span className="text-xs font-mono text-muted-foreground">
          {completedCount}/12 months
        </span>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {MONTHS.map((month, idx) => {
          const isDone = checkedMonths.has(idx)
          const isCurrent = idx === CURRENT_MONTH
          const isFuture = idx > CURRENT_MONTH

          return (
            <motion.button
              key={month}
              whileTap={!isFuture ? { scale: 0.9 } : {}}
              onClick={() => toggle(idx)}
              disabled={isFuture}
              className={cn(
                'aspect-square rounded-lg text-[10px] font-mono font-semibold',
                'flex items-center justify-center border transition-all',
                isFuture && 'opacity-25 cursor-default border-border bg-muted/20 text-muted-foreground',
                !isFuture && !isDone && !isCurrent && 'border-border bg-muted/30 text-muted-foreground hover:border-border-hover hover:text-foreground cursor-pointer',
                isCurrent && !isDone && 'border-violet-500 text-violet-400 bg-violet-500/10 cursor-pointer',
                isDone && 'border-green-500/40 bg-green-500/15 text-green-400 shadow-[0_0_6px_rgba(74,222,128,0.2)]',
              )}
              title={isFuture ? 'Future month' : (isDone ? 'Mark incomplete' : 'Mark complete')}
            >
              {isDone ? '✓' : month}
            </motion.button>
          )
        })}
      </div>

      <p className="text-[11px] text-muted-foreground mt-3 font-mono">
        ₹{totalSaved.toLocaleString('en-IN')} saved this year
      </p>
    </div>
  )
}
