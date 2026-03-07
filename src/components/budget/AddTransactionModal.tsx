'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { createTransaction } from '@/lib/budget'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess: () => void
}

const CATEGORIES = ['food', 'transport', 'personal', 'utilities', 'salary', 'other']
const TYPES = ['expense', 'income', 'saving', 'investment']

export function AddTransactionModal({ isOpen, onClose, userId, onSuccess }: AddTransactionModalProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [type, setType] = useState('expense')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount) return toast.error('Please fill in all fields')
    
    setLoading(true)
    try {
      await createTransaction(userId, {
        name,
        amount: parseFloat(amount),
        category: category as any,
        type: type as any,
        date: format(new Date(), 'yyyy-MM-dd'),
      })
      toast.success('Transaction added!')
      onSuccess()
      onClose()
      setName('')
      setAmount('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="tx-name">Description</Label>
          <Input
            id="tx-name"
            placeholder="e.g. Grocery shopping"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-950 border-zinc-800"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tx-amount">Amount (₹)</Label>
          <Input
            id="tx-amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-zinc-950 border-zinc-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Type</Label>
                <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                    {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <Label>Category</Label>
                <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
            </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
