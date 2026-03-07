'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { updateRoutine } from '@/lib/routine'
import { toast } from 'react-hot-toast'
import { DailyRoutine } from '@/types'

interface UpdateRoutineModalProps {
  isOpen: boolean
  onClose: () => void
  routine: DailyRoutine | null
  onSuccess: () => void
}

export function UpdateRoutineModal({ isOpen, onClose, routine, onSuccess }: UpdateRoutineModalProps) {
  const [label, setLabel] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (routine) {
      setLabel(routine.label)
      setTime(routine.time)
    }
  }, [routine])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!routine) return
    if (!label || !time) return toast.error('Please fill in all fields')
    
    setLoading(true)
    try {
      await updateRoutine(routine.id, {
        label,
        time,
      })
      toast.success('Routine updated!')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Routine Task">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="u-r-label">Task Name</Label>
          <Input 
            id="u-r-label" 
            value={label} 
            onChange={(e) => setLabel(e.target.value)} 
            className="bg-zinc-950 border-zinc-800 focus:border-blue-500" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="u-r-time">Time</Label>
          <Input 
            id="u-r-time" 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
            className="bg-zinc-950 border-zinc-800 focus:border-blue-500" 
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Updating...' : 'Update Task'}
        </Button>
      </form>
    </Modal>
  )
}
