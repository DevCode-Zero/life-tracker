'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'

interface LifeScoreRingProps {
  score: number
  habitScore: number
}

export function LifeScoreRing({ score, habitScore }: LifeScoreRingProps) {
  const r = 54
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - score / 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Life Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* SVG Ring */}
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#27272a" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={r}
              fill="none"
              stroke={score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-white">{score}</span>
            <span className="text-xs text-zinc-400">/100</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Habits</span><span>{habitScore}%</span>
          </div>
          <Progress value={habitScore} indicatorClassName="bg-violet-500" />
        </div>
      </CardContent>
    </Card>
  )
}
