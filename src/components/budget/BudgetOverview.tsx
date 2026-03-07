'use client'

import { motion } from 'framer-motion'
import { formatCurrency, toPercent } from '@/lib/utils'
import type { MonthlyBudgetSummary } from '@/types'
import { Plus, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { AddTransactionModal } from './AddTransactionModal'
import { BudgetSettingsModal } from './BudgetSettingsModal'
import { useStore } from '@/store'
import { getMonthlyBudgetSummary, getBudgetItems } from '@/lib/budget'
import { Settings } from 'lucide-react'

// Removed hardcoded BUDGET_ROWS

interface BudgetOverviewProps {
  summary: MonthlyBudgetSummary | null
  loading: boolean
}

export function BudgetOverview({ summary, loading }: BudgetOverviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  const { user, setBudgetSummary } = useStore()

  const refreshSummary = async () => {
    if (!user?.id) return
    const [summaryData, itemsData] = await Promise.all([
      getMonthlyBudgetSummary(user.id),
      getBudgetItems(user.id, summary?.month || new Date().toISOString().slice(0,7))
    ])
    setBudgetSummary(summaryData)
    setBudgetItems(itemsData)
  }

  useEffect(() => {
    if (user?.id && summary?.month) {
      getBudgetItems(user.id, summary.month).then(setBudgetItems)
    }
  }, [user?.id, summary?.month])

  const getSpent = (category: string) => {
    if (!summary) return 0
    return summary.transactions
      .filter((t) => t.category === category && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="card-title">💰 March Budget</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Income: {formatCurrency(summary?.total_income ?? 33000)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-green-500/10 border border-green-500/20 text-green-400">
            {summary?.savings_rate ?? 0}% saved
          </div>
          <button 
            className="btn-icon" 
            title="Budget Settings"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            className="btn-icon" 
            title="Add transaction"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user?.id ?? ''}
        onSuccess={refreshSummary}
      />

      <BudgetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userId={user?.id ?? ''}
        onSuccess={refreshSummary}
      />

      {/* Expense bars */}
      <div className="space-y-4 mb-5">
        {[
          { key: 'rent',      label: 'Rent',       emoji: '🏠', color: 'from-violet-500 to-purple-600' },
          { key: 'food',      label: 'Food',       emoji: '🍛', color: 'from-green-400 to-emerald-500' },
          { key: 'transport', label: 'Transport',  emoji: '🚌', color: 'from-orange-400 to-amber-500'  },
          { key: 'personal',  label: 'Personal',   emoji: '👕', color: 'from-pink-400 to-rose-500'    },
          { key: 'utilities', label: 'Utilities',  emoji: '⚡', color: 'from-blue-400 to-cyan-500'    },
        ].map((row, i) => {
          const spent = getSpent(row.key)
          const budgetItem = budgetItems.find(item => item.category === row.key)
          const budgetAmount = budgetItem?.budgeted_amount || 0
          const pct = budgetAmount > 0 ? toPercent(spent, budgetAmount) : 0
          const isOver = pct > 100

          return (
            <div key={row.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{row.emoji}</span>
                  {row.label}
                </span>
                <span className={cn(
                  'text-xs font-mono',
                  isOver ? 'text-red-400' : 'text-muted-foreground'
                )}>
                  {formatCurrency(spent)} / {formatCurrency(budgetAmount)}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full bg-gradient-to-r', isOver ? 'from-red-500 to-red-600' : row.color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Expenses</p>
          <p className="font-mono text-sm font-semibold text-red-400">
            {formatCurrency(summary?.total_expenses ?? 12833)}
          </p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Saved</p>
          <p className="font-mono text-sm font-semibold text-green-400">
            {formatCurrency(summary?.total_savings ?? 10000)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Buffer</p>
          <p className="font-mono text-sm font-semibold text-violet-400">
            {formatCurrency(summary?.remaining_buffer ?? 10167)}
          </p>
        </div>
      </div>
    </div>
  )
}
