import {
  formatCurrency,
  formatCompactCurrency,
  toPercent,
  calculateLifeScore,
  calculateProteinTarget,
  calculateCalorieTarget,
  getStreakEmoji,
  scoreColor,
  getWeekDates,
} from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats INR correctly', () => {
    expect(formatCurrency(33000)).toContain('33,000')
  })
  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toContain('0')
  })
  it('formats large amounts', () => {
    expect(formatCurrency(1000000)).toContain('10,00,000')
  })
})

describe('formatCompactCurrency', () => {
  it('shows K for thousands', () => {
    expect(formatCompactCurrency(10000)).toBe('₹10.0K')
  })
  it('shows L for lakhs', () => {
    expect(formatCompactCurrency(150000)).toBe('₹1.5L')
  })
  it('shows Cr for crores', () => {
    expect(formatCompactCurrency(17600000)).toBe('₹1.8Cr')
  })
  it('shows raw amount for small values', () => {
    expect(formatCompactCurrency(500)).toBe('₹500')
  })
})

describe('toPercent', () => {
  it('calculates percentage correctly', () => {
    expect(toPercent(3, 10)).toBe(30)
  })
  it('returns 0 when total is 0', () => {
    expect(toPercent(5, 0)).toBe(0)
  })
  it('caps at 100 when over', () => {
    expect(toPercent(15, 10)).toBe(100)
  })
  it('handles full completion', () => {
    expect(toPercent(7, 7)).toBe(100)
  })
})

describe('calculateLifeScore', () => {
  it('returns 100 for perfect inputs', () => {
    expect(calculateLifeScore({
      habitScore: 100,
      savingsRate: 100,
      workoutDaysThisWeek: 7,
    })).toBe(100)
  })

  it('returns 0 for zero inputs', () => {
    expect(calculateLifeScore({
      habitScore: 0,
      savingsRate: 0,
      workoutDaysThisWeek: 0,
    })).toBe(0)
  })

  it('weights habits at 40%', () => {
    const score = calculateLifeScore({
      habitScore: 100,
      savingsRate: 0,
      workoutDaysThisWeek: 0,
    })
    expect(score).toBe(40)
  })

  it('weights finance at 30%', () => {
    const score = calculateLifeScore({
      habitScore: 0,
      savingsRate: 100,
      workoutDaysThisWeek: 0,
    })
    expect(score).toBe(30)
  })

  it('weights workout at 30%', () => {
    const score = calculateLifeScore({
      habitScore: 0,
      savingsRate: 0,
      workoutDaysThisWeek: 7,
    })
    expect(score).toBe(30)
  })

  it('handles realistic inputs', () => {
    const score = calculateLifeScore({
      habitScore: 75,
      savingsRate: 30,
      workoutDaysThisWeek: 4,
    })
    // 75*0.4 + 30*0.3 + (4/7*100)*0.3 = 30+9+17.1 = 56
    expect(score).toBeGreaterThan(50)
    expect(score).toBeLessThan(70)
  })
})

describe('calculateProteinTarget', () => {
  it('calculates 2.2g per kg', () => {
    expect(calculateProteinTarget(59)).toBe(130)
  })
  it('calculates for 70kg', () => {
    expect(calculateProteinTarget(70)).toBe(154)
  })
})

describe('calculateCalorieTarget', () => {
  it('adds 300 for gain goal', () => {
    const maintain = calculateCalorieTarget(60, 'maintain')
    const gain = calculateCalorieTarget(60, 'gain')
    expect(gain).toBe(maintain + 300)
  })
  it('subtracts 300 for lose goal', () => {
    const maintain = calculateCalorieTarget(60, 'maintain')
    const lose = calculateCalorieTarget(60, 'lose')
    expect(lose).toBe(maintain - 300)
  })
  it('defaults to gain', () => {
    const gain = calculateCalorieTarget(60, 'gain')
    const def = calculateCalorieTarget(60)
    expect(gain).toBe(def)
  })
})

describe('getStreakEmoji', () => {
  it('returns sparkle for new streaks', () => {
    expect(getStreakEmoji(1)).toBe('✨')
    expect(getStreakEmoji(6)).toBe('✨')
  })
  it('returns fire for 7+ days', () => {
    expect(getStreakEmoji(7)).toBe('⚡')
    expect(getStreakEmoji(29)).toBe('⚡')
  })
  it('returns fire for 30+ days', () => {
    expect(getStreakEmoji(30)).toBe('🔥')
  })
  it('returns diamond for 90+ days', () => {
    expect(getStreakEmoji(90)).toBe('💎')
  })
  it('returns trophy for 365+ days', () => {
    expect(getStreakEmoji(365)).toBe('🏆')
  })
})

describe('scoreColor', () => {
  it('returns green for 80+', () => {
    expect(scoreColor(80)).toBe('text-green-400')
    expect(scoreColor(100)).toBe('text-green-400')
  })
  it('returns yellow for 60-79', () => {
    expect(scoreColor(60)).toBe('text-yellow-400')
    expect(scoreColor(79)).toBe('text-yellow-400')
  })
  it('returns orange for 40-59', () => {
    expect(scoreColor(40)).toBe('text-orange-400')
  })
  it('returns red for below 40', () => {
    expect(scoreColor(0)).toBe('text-red-400')
    expect(scoreColor(39)).toBe('text-red-400')
  })
})

describe('getWeekDates', () => {
  it('returns 7 dates', () => {
    expect(getWeekDates()).toHaveLength(7)
  })
  it('all dates are valid ISO strings', () => {
    const dates = getWeekDates()
    dates.forEach((d) => {
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
  it('starts on Monday', () => {
    const dates = getWeekDates()
    const monday = new Date(dates[0])
    expect(monday.getDay()).toBe(1) // 1 = Monday
  })
  it('ends on Sunday', () => {
    const dates = getWeekDates()
    const sunday = new Date(dates[6])
    expect(sunday.getDay()).toBe(0) // 0 = Sunday
  })
})
