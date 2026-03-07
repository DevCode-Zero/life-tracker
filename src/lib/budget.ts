import { createClient } from '@/lib/supabase/client'
import type {
  Transaction, BudgetItem, MonthlyBudgetSummary,
  Investment, FinancialGoal, CreateTransactionForm
} from '@/types'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const supabase = createClient()

// ── Transactions ──────────────────────────────────────────────

export async function getTransactions(
  userId: string,
  month?: string
): Promise<Transaction[]> {
  const targetMonth = month ?? format(new Date(), 'yyyy-MM')
  const start = `${targetMonth}-01`
  const end = format(endOfMonth(new Date(`${targetMonth}-01`)), 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createTransaction(
  userId: string,
  form: CreateTransactionForm
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...form, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── Budget Items ──────────────────────────────────────────────

export async function getBudgetItems(
  userId: string,
  month: string
): Promise<BudgetItem[]> {
  const { data, error } = await supabase
    .from('budget_items')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .order('type')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function upsertBudgetItem(
  userId: string,
  item: Omit<BudgetItem, 'id' | 'user_id' | 'created_at'>
): Promise<BudgetItem> {
  const { data, error } = await supabase
    .from('budget_items')
    .upsert({ ...item, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── Monthly Summary ───────────────────────────────────────────

export async function getMonthlyBudgetSummary(
  userId: string,
  month?: string
): Promise<MonthlyBudgetSummary> {
  const targetMonth = month ?? format(new Date(), 'yyyy-MM')
  const transactions = await getTransactions(userId, targetMonth)

  const total_income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const total_expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const total_savings = transactions
    .filter((t) => t.type === 'saving')
    .reduce((s, t) => s + t.amount, 0)

  const total_invested = transactions
    .filter((t) => t.type === 'investment')
    .reduce((s, t) => s + t.amount, 0)

  const remaining_buffer = total_income - total_expenses - total_savings - total_invested
  const savings_rate = total_income > 0
    ? Math.round(((total_savings + total_invested) / total_income) * 100)
    : 0

  return {
    month: targetMonth,
    total_income,
    total_expenses,
    total_savings,
    total_invested,
    remaining_buffer,
    savings_rate,
    transactions,
  }
}

// ── Investments ───────────────────────────────────────────────

export async function getInvestments(userId: string): Promise<Investment[]> {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('started_at')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function upsertInvestment(
  userId: string,
  investment: Omit<Investment, 'id' | 'user_id' | 'created_at'>
): Promise<Investment> {
  const { data, error } = await supabase
    .from('investments')
    .upsert({ ...investment, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateTransaction(id: string, updates: any): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ── Financial Goals ───────────────────────────────────────────

export async function getFinancialGoals(
  userId: string
): Promise<FinancialGoal[]> {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('user_id', userId)
    .order('target_date', { nullsFirst: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateGoalProgress(
  goalId: string,
  currentAmount: number
): Promise<FinancialGoal> {
  const { data: goal } = await supabase
    .from('financial_goals')
    .select('target_amount')
    .eq('id', goalId)
    .single()

  const is_completed = goal ? currentAmount >= goal.target_amount : false

  const { data, error } = await supabase
    .from('financial_goals')
    .update({ current_amount: currentAmount, is_completed })
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteFinancialGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('financial_goals').delete().eq('id', goalId)
  if (error) throw new Error(error.message)
}

export async function updateFinancialGoal(
  goalId: string,
  updates: Partial<FinancialGoal>
): Promise<FinancialGoal> {
  const { data, error } = await supabase
    .from('financial_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── Compounding Calculator ────────────────────────────────────

export function calculateCompoundingProjection(
  monthlyAmount: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12 / 100
  const months = years * 12
  if (monthlyRate === 0) return monthlyAmount * months
  return monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
}

// ── 12-Month Savings Track ────────────────────────────────────

export async function getYearlySavingsTrack(
  userId: string,
  year: number
): Promise<{ month: string; saved: boolean; amount: number }[]> {
  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(year, i, 1), 'yyyy-MM')
  )

  const results = await Promise.all(
    months.map(async (month) => {
      const summary = await getMonthlyBudgetSummary(userId, month)
      return {
        month,
        saved: summary.total_savings > 0 || summary.total_invested > 0,
        amount: summary.total_savings + summary.total_invested,
      }
    })
  )

  return results
}
