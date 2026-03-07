import { calculateCompoundingProjection } from '@/lib/budget'

describe('calculateCompoundingProjection', () => {
  it('calculates SIP projection correctly for 10 years', () => {
    // ₹5,000/month at 12% for 10 years ≈ ₹11.5L
    const result = calculateCompoundingProjection(5000, 12, 10)
    expect(result).toBeGreaterThan(1_000_000)
    expect(result).toBeLessThan(1_300_000)
  })

  it('calculates SIP projection for 20 years', () => {
    // ₹5,000/month at 12% for 20 years ≈ ₹49L
    const result = calculateCompoundingProjection(5000, 12, 20)
    expect(result).toBeGreaterThan(4_500_000)
    expect(result).toBeLessThan(5_500_000)
  })

  it('calculates SIP projection for 30 years', () => {
    // ₹5,000/month at 12% for 30 years ≈ ₹1.76Cr
    const result = calculateCompoundingProjection(5000, 12, 30)
    expect(result).toBeGreaterThan(15_000_000)
  })

  it('returns simple multiplication for 0% interest rate', () => {
    const result = calculateCompoundingProjection(1000, 0, 5)
    expect(result).toBe(60000) // 1000 * 60 months
  })

  it('scales linearly with monthly amount', () => {
    const base = calculateCompoundingProjection(1000, 12, 10)
    const double = calculateCompoundingProjection(2000, 12, 10)
    expect(double).toBeCloseTo(base * 2, 0)
  })

  it('is always positive', () => {
    expect(calculateCompoundingProjection(3000, 12, 1)).toBeGreaterThan(0)
    expect(calculateCompoundingProjection(0, 12, 10)).toBe(0)
  })

  it('longer time always yields more', () => {
    const short = calculateCompoundingProjection(3000, 12, 5)
    const long = calculateCompoundingProjection(3000, 12, 10)
    expect(long).toBeGreaterThan(short)
  })

  it('higher rate always yields more', () => {
    const lowRate = calculateCompoundingProjection(3000, 8, 10)
    const highRate = calculateCompoundingProjection(3000, 15, 10)
    expect(highRate).toBeGreaterThan(lowRate)
  })
})
