'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { getMonthlyBudgetSummary } from '@/lib/budget'
import { BudgetOverview } from '@/components/budget/BudgetOverview'
import { GoalsList } from '@/components/budget/GoalsList'
import { TransactionList } from '@/components/budget/TransactionList'

export default function BudgetPage() {
  const { user, budgetSummary, setBudgetSummary } = useStore()
  const [loading, setLoading] = useState(!budgetSummary)

  useEffect(() => {
    if (!user?.id) return
    async function load() {
      try {
        const data = await getMonthlyBudgetSummary(user!.id)
        setBudgetSummary(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, setBudgetSummary])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-extrabold tracking-tight">Budget & Finance 💰</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your income, expenses, and savings goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BudgetOverview summary={budgetSummary} loading={loading} />
          <TransactionList 
            transactions={budgetSummary?.transactions ?? []} 
            onSuccess={async () => {
              if (user?.id) {
                const data = await getMonthlyBudgetSummary(user.id)
                setBudgetSummary(data)
              }
            }}
          />
        </div>
        <div>
          <GoalsList userId={user?.id ?? ''} />
        </div>
      </div>
    </div>
  )
}
