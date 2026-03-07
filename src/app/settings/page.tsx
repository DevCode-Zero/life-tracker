'use client'

import { useStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const { user, setUser } = useStore()
  const [name, setName] = useState(user?.full_name || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: name })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setUser({ ...user, full_name: name })
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight">Settings ⚙️</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your profile and application preferences.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading || name === user?.full_name}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-zinc-950 border-zinc-800" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user?.email || ''} readOnly className="bg-zinc-900 border-zinc-800 text-zinc-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Currency</span>
                <span className="text-sm text-zinc-400">{user?.currency || 'INR'}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Timezone</span>
                <span className="text-sm text-zinc-400">{user?.timezone || 'Asia/Kolkata'}</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
