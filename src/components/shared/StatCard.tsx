'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string | number
  change: string
  icon: React.ReactNode
  color: 'purple' | 'green' | 'orange' | 'pink' | 'blue'
  loading?: boolean
}

const colorMap = {
  purple: {
    bar: 'from-violet-500 to-purple-600',
    badge: 'text-violet-400 bg-violet-500/10',
    icon: 'text-violet-400',
  },
  green: {
    bar: 'from-green-400 to-emerald-500',
    badge: 'text-green-400 bg-green-500/10',
    icon: 'text-green-400',
  },
  orange: {
    bar: 'from-orange-400 to-amber-500',
    badge: 'text-orange-400 bg-orange-500/10',
    icon: 'text-orange-400',
  },
  pink: {
    bar: 'from-pink-400 to-rose-500',
    badge: 'text-pink-400 bg-pink-500/10',
    icon: 'text-pink-400',
  },
  blue: {
    bar: 'from-blue-400 to-cyan-500',
    badge: 'text-blue-400 bg-blue-500/10',
    icon: 'text-blue-400',
  },
}

export function StatCard({ label, value, change, icon, color, loading }: StatCardProps) {
  const colors = colorMap[color]

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-3 w-16 bg-muted rounded mb-3" />
        <div className="h-8 w-24 bg-muted rounded mb-2" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative overflow-hidden hover:border-border-hover transition-colors group"
    >
      {/* Top accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r', colors.bar)} />

      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
        <span className={cn('p-1.5 rounded-md', colors.badge)}>
          {icon}
        </span>
      </div>

      <p className="font-display text-2xl font-extrabold tracking-tight mb-1.5">
        {value}
      </p>

      <p className={cn('text-xs font-medium', colors.badge.split(' ')[0])}>
        {change}
      </p>
    </motion.div>
  )
}
