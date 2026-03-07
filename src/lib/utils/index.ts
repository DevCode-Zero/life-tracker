import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

// ── Tailwind class merger ─────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Currency ──────────────────────────────────────────────────
export function formatCurrency(
  amount: number,
  currency: string = 'INR'
): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`
  return `₹${amount}`
}

// ── Date helpers ──────────────────────────────────────────────
export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getDayOfWeek(date?: Date): number {
  const d = date ?? new Date()
  const day = d.getDay()
  return day === 0 ? 7 : day  // Convert Sun=0 to Sun=7
}

export function getWeekDates(date?: Date): string[] {
  const today = date ?? new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return format(d, 'yyyy-MM-dd')
  })
}

// ── Life Score Calculator ─────────────────────────────────────
export function calculateLifeScore(params: {
  habitScore: number          // 0-100
  savingsRate: number         // 0-100 percentage
  workoutDaysThisWeek: number // 0-7
  avgSleep?: number           // hours
}): number {
  const { habitScore, savingsRate, workoutDaysThisWeek } = params

  const weightedHabit = habitScore * 0.4
  const weightedFinance = Math.min(savingsRate, 100) * 0.3
  const weightedWorkout = (workoutDaysThisWeek / 7) * 100 * 0.3

  return Math.round(weightedHabit + weightedFinance + weightedWorkout)
}

// ── Streak helpers ────────────────────────────────────────────
export function getStreakEmoji(streak: number): string {
  if (streak >= 365) return '🏆'
  if (streak >= 90) return '💎'
  if (streak >= 30) return '🔥'
  if (streak >= 7) return '⚡'
  return '✨'
}

// ── Percentage helpers ────────────────────────────────────────
export function toPercent(value: number, total: number): number {
  if (total === 0) return 0
  return Math.min(Math.round((value / total) * 100), 100)
}

// ── Color by score ────────────────────────────────────────────
export function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-green-400'
  if (score >= 60) return 'bg-yellow-400'
  if (score >= 40) return 'bg-orange-400'
  return 'bg-red-400'
}

// ── Array helpers ─────────────────────────────────────────────
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key])
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

// ── Sleep & Nutrition helpers ─────────────────────────────────
export function calculateProteinTarget(weightKg: number): number {
  return Math.round(weightKg * 2.2) // 2.2g per kg for muscle building
}

export function calculateCalorieTarget(
  weightKg: number,
  goal: 'maintain' | 'gain' | 'lose' = 'gain'
): number {
  const bmr = weightKg * 24     // simplified BMR
  const tdee = bmr * 1.4        // sedentary-moderate multiplier
  if (goal === 'gain') return Math.round(tdee + 300)
  if (goal === 'lose') return Math.round(tdee - 300)
  return Math.round(tdee)
}
