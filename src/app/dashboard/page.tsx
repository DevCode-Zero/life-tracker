'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { getHabitsWithLogs } from '@/lib/habits'
import { getMonthlyBudgetSummary } from '@/lib/budget'
import { getWeeklyWorkoutCount } from '@/lib/workout'
import { StatCard } from '@/components/shared/StatCard'
import { HabitGrid } from '@/components/habits/HabitGrid'
import { BudgetOverview } from '@/components/budget/BudgetOverview'
import { WorkoutToday } from '@/components/workout/WorkoutToday'
import { MealPlanWeek } from '@/components/nutrition/MealPlanWeek'
import { LifeScoreRing } from '@/components/shared/LifeScoreRing'
import { GoalsList } from '@/components/budget/GoalsList'
import { MonthlyCheckboxTracker } from '@/components/shared/MonthlyCheckboxTracker'
import { DailyRoutineTimeline } from '@/components/workout/DailyRoutineTimeline'
import { formatCompactCurrency, calculateLifeScore, currentMonth } from '@/lib/utils'
import { Activity, Flame, TrendingUp, Wallet } from 'lucide-react'

export default function DashboardPage() {
  const { user, habits, budgetSummary, setHabits, setBudgetSummary } = useStore()
  const [loading, setLoading] = useState(true)
  const [workoutCount, setWorkoutCount] = useState(0)

  const habitsCompletedToday = habits.filter((h) => h.completed_today).length
  const habitScore = habits.length > 0
    ? Math.round((habitsCompletedToday / habits.length) * 100)
    : 0

  const topStreak = habits.reduce((m, h) => Math.max(m, h.streak_current), 0)

  const lifeScore = calculateLifeScore({
    habitScore,
    savingsRate: budgetSummary?.savings_rate ?? 0,
    workoutDaysThisWeek: workoutCount,
  })

  useEffect(() => {
    if (!user?.id) return
    async function load() {
      try {
        const [habitsData, budgetData, wCount] = await Promise.all([
          getHabitsWithLogs(user!.id),
          getMonthlyBudgetSummary(user!.id),
          getWeeklyWorkoutCount(user!.id),
        ])
        setHabits(habitsData)
        setBudgetSummary(budgetData)
        setWorkoutCount(wCount)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-mono text-muted-foreground mb-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 className="text-3xl font-display font-extrabold tracking-tight">
          Good {getGreeting()}, {user?.full_name?.split(' ')[0] ?? 'Xai'} ✦
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {topStreak > 0
            ? `You're on a ${topStreak}-day streak 🔥 Keep it going!`
            : "Start your first habit streak today!"}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Habits Today"
          value={`${habitsCompletedToday}/${habits.length}`}
          change={`${habitScore}% complete`}
          icon={<Activity className="w-4 h-4" />}
          color="purple"
          loading={loading}
        />
        <StatCard
          label="Streak"
          value={`${topStreak}d`}
          change={topStreak > 0 ? "Keep going!" : "Start today"}
          icon={<Flame className="w-4 h-4" />}
          color="orange"
          loading={loading}
        />
        <StatCard
          label="Monthly Savings"
          value={formatCompactCurrency(budgetSummary?.total_savings ?? 0)}
          change={`${budgetSummary?.savings_rate ?? 0}% rate`}
          icon={<Wallet className="w-4 h-4" />}
          color="green"
          loading={loading}
        />
        <StatCard
          label="Life Score"
          value={`${lifeScore}`}
          change={lifeScore >= 70 ? "On track 🚀" : "Room to improve"}
          icon={<TrendingUp className="w-4 h-4" />}
          color="pink"
          loading={loading}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <HabitGrid userId={user?.id ?? ''} />
          <BudgetOverview summary={budgetSummary} loading={loading} />
          <WorkoutToday userId={user?.id ?? ''} />
          <MealPlanWeek userId={user?.id ?? ''} />
        </div>

        {/* Right — 1 col */}
        <div className="space-y-6">
          <LifeScoreRing score={lifeScore} habitScore={habitScore} />
          <MonthlyCheckboxTracker userId={user?.id ?? ''} />
          <DailyRoutineTimeline userId={user?.id ?? ''} />
          <GoalsList userId={user?.id ?? ''} />
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
