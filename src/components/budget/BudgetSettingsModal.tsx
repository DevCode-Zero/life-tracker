'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { getBudgetItems, upsertBudgetItem } from '@/lib/budget'
import { toast } from 'react-hot-toast'
import { BudgetItem, BudgetCategory } from '@/types'
import { format } from 'date-fns'

interface BudgetSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess: () => void
}

const CATEGORIES: { key: BudgetCategory; label: string; emoji: string }[] = [
  { key: 'rent', label: 'Rent', emoji: '🏠' },
  { key: 'food', label: 'Food', emoji: '🍛' },
  { key: 'transport', label: 'Transport', emoji: '🚌' },
  { key: 'personal', label: 'Personal', emoji: '👕' },
  { key: 'utilities', label: 'Utilities', emoji: '⚡' },
  { key: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { key: 'health', label: 'Health', emoji: '🏥' },
  { key: 'learning', label: 'Learning', emoji: '📚' },
]

export function BudgetSettingsModal({ isOpen, onClose, userId, onSuccess }: BudgetSettingsModalProps) {
  const [budgets, setBudgets] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const currentMonth = format(new Date(), 'yyyy-MM')

  useEffect(() => {
    if (isOpen && userId) {
      const load = async () => {
        try {
          const items = await getBudgetItems(userId, currentMonth)
          const map: Record<string, number> = {}
          items.forEach(item => {
            map[item.category] = item.budgeted_amount
          })
          setBudgets(map)
        } catch (err) {
          console.error(err)
        }
      }
      load()
    }
  }, [isOpen, userId, currentMonth])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await Promise.all(
        CATEGORIES.map(cat => 
          upsertBudgetItem(userId, {
            category: cat.key,
            name: cat.label,
            type: 'expense',
            budgeted_amount: budgets[cat.key] || 0,
            month: currentMonth,
            is_recurring: true
          })
        )
      )
      toast.success('Budget updated!')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Budget Settings">
      <form onSubmit={handleSave} className="space-y-4">
        <p className="text-xs text-muted-foreground mb-4">Set your monthly budget for March 2026</p>
        
        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="space-y-1.5">
              <Label htmlFor={`budget-${cat.key}`} className="text-[11px] flex items-center gap-1.5">
                <span>{cat.emoji}</span> {cat.label}
              </Label>
              <Input
                id={`budget-${cat.key}`}
                type="number"
                placeholder="0"
                value={budgets[cat.key] || ''}
                onChange={(e) => setBudgets({ ...budgets, [cat.key]: Number(e.target.value) })}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? 'Saving...' : 'Save Budget Changes'}
        </Button>
      </form>
    </Modal>
  )
}
