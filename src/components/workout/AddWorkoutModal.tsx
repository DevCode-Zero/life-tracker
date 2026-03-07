'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { createWorkoutPlan } from '@/lib/workout'
import { toast } from 'react-hot-toast'

interface AddWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess: () => void
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function AddWorkoutModal({ isOpen, onClose, userId, onSuccess }: AddWorkoutModalProps) {
  const [name, setName] = useState('')
  const [focus, setFocus] = useState('')
  const [day, setDay] = useState(new Date().getDay())
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !focus) return toast.error('Please fill in all fields')
    
    setLoading(true)
    try {
      await createWorkoutPlan(userId, name, day, focus)
      toast.success('Workout scheduled!')
      onSuccess()
      onClose()
      setName('')
      setFocus('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Workout">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="w-name">Workout Name</Label>
          <Input id="w-name" placeholder="e.g. Upper Body Power" value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-950" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="w-focus">Focus (Muscle Groups)</Label>
          <Input id="w-focus" placeholder="e.g. Chest, Shoulders, Triceps" value={focus} onChange={(e) => setFocus(e.target.value)} className="bg-zinc-950" />
        </div>
        <div className="space-y-2">
          <Label>Day of the Week</Label>
          <select 
            value={day} 
            onChange={(e) => setDay(parseInt(e.target.value))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
          >
            {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-blue-600">
          {loading ? 'Adding...' : 'Add Workout'}
        </Button>
      </form>
    </Modal>
  )
}
