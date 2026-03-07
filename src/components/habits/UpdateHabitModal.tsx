'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { updateHabit } from '@/lib/habits'
import { toast } from 'react-hot-toast'
import { Habit } from '@/types'

interface UpdateHabitModalProps {
  isOpen: boolean
  onClose: () => void
  habit: Habit | null
  onSuccess: () => void
}

export function UpdateHabitModal({ isOpen, onClose, habit, onSuccess }: UpdateHabitModalProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setEmoji(habit.emoji)
    }
  }, [habit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!habit) return
    if (!name || !emoji) return toast.error('Please fill in all fields')
    
    setLoading(true)
    try {
      await updateHabit(habit.id, {
        name,
        emoji,
      })
      toast.success('Habit updated!')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Habit">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="u-h-name">Habit Name</Label>
          <Input 
            id="u-h-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="bg-zinc-950 border-zinc-800 focus:border-blue-500" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="u-h-emoji">Emoji</Label>
          <Input 
            id="u-h-emoji" 
            value={emoji} 
            onChange={(e) => setEmoji(e.target.value)} 
            placeholder="🔥"
            className="bg-zinc-950 border-zinc-800 focus:border-blue-500" 
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Updating...' : 'Update Habit'}
        </Button>
      </form>
    </Modal>
  )
}
