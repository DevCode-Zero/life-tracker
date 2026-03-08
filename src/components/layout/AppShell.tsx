'use client'

import { useStore } from '@/store'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useStore()

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="flex items-center">
          <span className="text-xl font-bold text-blue-500">⚡</span>
          <span className="ml-2 font-bold text-white tracking-tight">Life Tracker</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <Sidebar />
      
      <main
        className={cn(
          'flex-1 transition-all duration-300 min-h-screen',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
