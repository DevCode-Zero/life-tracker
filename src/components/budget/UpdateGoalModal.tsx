'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { updateFinancialGoal } from '@/lib/budget'
import { toast } from 'react-hot-toast'

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
}

interface UpdateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal | null
  onSuccess: () => void
}

export function UpdateGoalModal({ isOpen, onClose, goal, onSuccess }: UpdateGoalModalProps) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (goal) {
      setName(goal.name)
      setTargetAmount(goal.target_amount.toString())
      setCurrentAmount(goal.current_amount.toString())
    }
  }, [goal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal) return
    if (!name || !targetAmount) return toast.error('Please fill in all fields')
    
    setLoading(true)
    try {
      await updateFinancialGoal(goal.id, {
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount || '0'),
      })
      
      toast.success('Goal updated!')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Goal">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="u-g-name">Goal Name</Label>
          <Input id="u-g-name" value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="u-g-target">Target Amount (₹)</Label>
                <Input id="u-g-target" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="u-g-current">Current Savings (₹)</Label>
                <Input id="u-g-current" type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" />
            </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Updating...' : 'Update Goal'}
        </Button>
      </form>
    </Modal>
  )
}
