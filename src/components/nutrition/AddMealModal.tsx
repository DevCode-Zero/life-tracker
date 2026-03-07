'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { createMealPlan } from '@/lib/nutrition'
import { toast } from 'react-hot-toast'

interface AddMealModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess: () => void
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

export function AddMealModal({ isOpen, onClose, userId, onSuccess }: AddMealModalProps) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [type, setType] = useState('lunch')
  const [day, setDay] = useState(new Date().getDay())
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !calories) return toast.error('Please fill in all fields')
    
    setLoading(true)
    try {
      await createMealPlan(userId, name, day, type, parseFloat(calories), parseFloat(protein || '0'))
      toast.success('Meal added!')
      onSuccess()
      onClose()
      setName('')
      setCalories('')
      setProtein('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Meal">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="m-name">Meal Name</Label>
          <Input id="m-name" placeholder="e.g. Chicken Quinoa Salad" value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-950" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="m-cal">Calories</Label>
                <Input id="m-cal" type="number" placeholder="500" value={calories} onChange={(e) => setCalories(e.target.value)} className="bg-zinc-950" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="m-pro">Protein (g)</Label>
                <Input id="m-pro" type="number" placeholder="30" value={protein} onChange={(e) => setProtein(e.target.value)} className="bg-zinc-950" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Meal Type</Label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white">
                    {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <Label>Day</Label>
                <select value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white">
                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
            </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-blue-600">
          {loading ? 'Adding...' : 'Add Meal'}
        </Button>
      </form>
    </Modal>
  )
}
