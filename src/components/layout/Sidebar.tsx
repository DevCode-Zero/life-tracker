'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Flame, Wallet, Utensils, Dumbbell, Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits',     label: 'Habits',     icon: Flame },
  { href: '/budget',     label: 'Budget',     icon: Wallet },
  { href: '/nutrition',  label: 'Nutrition',  icon: Utensils },
  { href: '/workout',    label: 'Workout',    icon: Dumbbell },
  { href: '/settings',   label: 'Settings',   icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, sidebarOpen, setSidebarOpen } = useStore()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    toast.success('Signed out')
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-30 flex flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300',
        sidebarOpen ? 'w-56' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-zinc-800">
        <span className="text-xl font-bold text-blue-500 shrink-0">⚡</span>
        {sidebarOpen && (
          <span className="ml-2 font-bold text-white tracking-tight whitespace-nowrap">Life Tracker</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-2 pb-4 space-y-1 border-t border-zinc-800 pt-2">
        {sidebarOpen && user && (
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-white truncate">
              {user.full_name || 'User'}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {sidebarOpen && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 bg-zinc-800 border border-zinc-700 rounded-full p-0.5 text-zinc-400 hover:text-white transition-colors"
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </aside>
  )
}
