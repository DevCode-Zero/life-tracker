'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess: () => void
}

export function AddGoalModal({ isOpen, onClose, userId, onSuccess }: AddGoalModalProps) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !targetAmount) return toast.error('Please fill in all fields')
    
    setLoading(true)
    try {
      // Duplication check
      const { data: existing } = await supabase
        .from('financial_goals')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', name)
        .maybeSingle()

      if (existing) {
        toast.error(`A goal named "${name}" already exists`)
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('financial_goals')
        .insert({
          user_id: userId,
          name,
          target_amount: parseFloat(targetAmount),
          current_amount: parseFloat(currentAmount || '0'),
          category: 'other',
          is_completed: false,
        })
      
      if (error) throw error
      toast.success('Goal created!')
      onSuccess()
      onClose()
      setName('')
      setTargetAmount('')
      setCurrentAmount('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Financial Goal">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="g-name">Goal Name</Label>
          <Input id="g-name" placeholder="e.g. New Car Fund" value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="g-target">Target Amount (₹)</Label>
                <Input id="g-target" type="number" placeholder="50000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="g-current">Initial Savings (₹)</Label>
                <Input id="g-current" type="number" placeholder="0" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" />
            </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add Goal'}
        </Button>
      </form>
    </Modal>
  )
}
