'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { createHabit } from '@/lib/habits'
import { toast } from 'react-hot-toast'

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess: () => void
}

const CATEGORIES = ['health', 'fitness', 'finance', 'learning', 'nutrition']
const EMOJIS = ['⚡', '🥗', '💪', '📚', '💰', '🧘', '🚶', '💧', '🍎']

export function AddHabitModal({ isOpen, onClose, userId, onSuccess }: AddHabitModalProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('⚡')
  const [category, setCategory] = useState('health')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return toast.error('Please enter a habit name')
    
    setLoading(true)
    try {
      await createHabit(userId, {
        name,
        emoji,
        category: category as any,
        frequency: 'daily',
        target_days: [1, 2, 3, 4, 5, 6, 7],
      })
      toast.success('Habit created!')
      onSuccess()
      onClose()
      setName('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Habit">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="habit-name">Habit Name</Label>
          <Input
            id="habit-name"
            placeholder="e.g. Morning Meditation"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-950 border-zinc-800"
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                  category === cat
                    ? 'bg-blue-600/20 border-blue-600 text-blue-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Emoji</Label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl border transition-all ${
                  emoji === e
                    ? 'bg-blue-600/20 border-blue-600'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? 'Creating...' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
