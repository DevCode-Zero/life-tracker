import { useStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const { user, setUser } = useStore()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user?.full_name) {
      setName(user.full_name)
    }
  }, [user])

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
      
      // Update global store
      setUser({ ...user, full_name: name })
      
      // Also update auth metadata for good measure
      await supabase.auth.updateUser({
        data: { full_name: name }
      })

      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight">Settings ⚙️</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your profile and application preferences.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading || name === user?.full_name}
          className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500/50 focus:ring-blue-500/20" 
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user?.email || ''} readOnly className="bg-zinc-950/20 border-zinc-900 text-zinc-600 cursor-not-allowed" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-zinc-950/30 rounded-lg border border-zinc-800/50">
                <span className="text-sm font-medium text-zinc-400">Currency</span>
                <span className="text-sm text-white font-mono">{user?.currency || 'INR'}</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-zinc-950/30 rounded-lg border border-zinc-800/50">
                <span className="text-sm font-medium text-zinc-400">Timezone</span>
                <span className="text-sm text-white font-mono">{user?.timezone || 'Asia/Kolkata'}</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
