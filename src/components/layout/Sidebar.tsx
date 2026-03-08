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
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-50 flex flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300',
          sidebarOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full lg:translate-x-0 lg:w-16',
          sidebarOpen && 'lg:w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-zinc-800 shrink-0">
          <span className="text-xl font-bold text-blue-500 shrink-0">⚡</span>
          {sidebarOpen && (
            <span className="ml-2 font-bold text-white tracking-tight whitespace-nowrap">Life Tracker</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-none">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false)
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent'
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", active && "text-blue-400")} />
                {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="px-2 pb-6 space-y-1 border-t border-zinc-800 pt-4 mt-auto">
          {sidebarOpen && user && (
            <div className="px-3 py-3 mb-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
              <p className="text-xs font-bold text-white truncate mb-0.5">
                {user.full_name || 'User'}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle (Desktop only) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 bg-zinc-800 border border-zinc-700 rounded-full p-1 text-zinc-400 hover:text-white transition-colors z-50 shadow-lg"
        >
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </>
  )
}
