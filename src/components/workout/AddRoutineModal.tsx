'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { createRoutine } from '@/lib/routine'
import { toast } from 'react-hot-toast'

interface AddRoutineModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess: () => void
}

export function AddRoutineModal({ isOpen, onClose, userId, onSuccess }: AddRoutineModalProps) {
  const [label, setLabel] = useState('')
  const [time, setTime] = useState('08:00')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label || !time) return toast.error('Please fill in all fields')
    
    setLoading(true)
    try {
      await createRoutine(userId, label, time)
      toast.success('Routine task added!')
      onSuccess()
      onClose()
      setLabel('')
      setTime('08:00')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Routine Task">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="r-label">Task Name</Label>
          <Input 
            id="r-label" 
            placeholder="e.g. Morning Meditation" 
            value={label} 
            onChange={(e) => setLabel(e.target.value)} 
            className="bg-zinc-950 border-zinc-800 focus:border-blue-500" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="r-time">Time</Label>
          <Input 
            id="r-time" 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
            className="bg-zinc-950 border-zinc-800 focus:border-blue-500" 
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add Task'}
        </Button>
      </form>
    </Modal>
  )
}
