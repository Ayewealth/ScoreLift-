import { describe, it, expect } from 'vitest'
import { calculateScore, getScoreBand, getScoreBandLabel, getScoreBandRange } from './scoringEngine'
import type { CreditProfileInput } from './scoringEngine'

const healthyProfile: CreditProfileInput = {
  scoreBand: 'good',
  missedPaymentCount: 0,
  missedPaymentRecency: 'none',
  overallUtilisation: 15,
  oldestAccountAge: '7_plus_years',
  totalAccounts: 8,
  hardInquiries12m: 1,
  derogatoryMarks: [],
  creditMix: ['credit_cards', 'auto_loan', 'mortgage'],
}

const poorProfile: CreditProfileInput = {
  scoreBand: 'poor',
  missedPaymentCount: 4,
  missedPaymentRecency: 'within_6_months',
  overallUtilisation: 85,
  oldestAccountAge: 'under_1_year',
  totalAccounts: 2,
  hardInquiries12m: 6,
  derogatoryMarks: ['collections', 'bankruptcy'],
  creditMix: ['credit_cards'],
}

describe('calculateScore', () => {
  it('returns a score between 300 and 850', () => {
    const result = calculateScore(healthyProfile)
    expect(result.estimatedScore).toBeGreaterThanOrEqual(300)
    expect(result.estimatedScore).toBeLessThanOrEqual(850)
  })

  it('returns a higher score for a healthy profile', () => {
    const result = calculateScore(healthyProfile)
    expect(result.estimatedScore).toBeGreaterThan(700)
  })

  it('returns a lower score for a poor profile', () => {
    const result = calculateScore(poorProfile)
    expect(result.estimatedScore).toBeLessThan(600)
  })

  it('returns exactly 5 factor health results', () => {
    const result = calculateScore(healthyProfile)
    expect(result.factorHealth).toHaveLength(5)
  })

  it('returns all expected factor names', () => {
    const result = calculateScore(healthyProfile)
    const factors = result.factorHealth.map(f => f.factor).sort()
    expect(factors).toEqual(['account_age', 'credit_mix', 'credit_utilisation', 'new_inquiries', 'payment_history'])
  })

  it('each factor has a valid health status', () => {
    const result = calculateScore(healthyProfile)
    for (const factor of result.factorHealth) {
      expect(['excellent', 'good', 'needs_work', 'critical']).toContain(factor.status)
    }
  })

  it('returns roadmap actions sorted by impact descending', () => {
    const result = calculateScore(poorProfile)
    expect(result.roadmapActions.length).toBeGreaterThan(0)
    for (let i = 1; i < result.roadmapActions.length; i++) {
      expect(result.roadmapActions[i].estimatedImpactMax)
        .toBeLessThanOrEqual(result.roadmapActions[i - 1].estimatedImpactMax)
    }
  })

  it('a profile with maxed utilisation gets utilisation actions', () => {
    const result = calculateScore(poorProfile)
    const utilActions = result.roadmapActions.filter(a => a.factor === 'credit_utilisation')
    expect(utilActions.length).toBeGreaterThan(0)
    expect(utilActions[0].actionTitle.toLowerCase()).toContain('reduce')
  })

  it('a profile with 0 missed payments gets no payment history penalty actions', () => {
    const result = calculateScore(healthyProfile)
    const paymentActions = result.roadmapActions.filter(a => a.factor === 'payment_history')
    expect(paymentActions.length).toBeGreaterThan(0)
    expect(paymentActions[0].actionTitle.toLowerCase()).toContain('maintain')
  })

  it('a profile with derogatory marks gets collection/bankruptcy actions', () => {
    const result = calculateScore(poorProfile)
    const paymentActions = result.roadmapActions.filter(a => a.factor === 'payment_history')
    const hasDerogatoryAction = paymentActions.some(a =>
      a.actionTitle.toLowerCase().includes('collection') || a.actionTitle.toLowerCase().includes('bankruptcy')
    )
    expect(hasDerogatoryAction).toBe(true)
  })

  it('a profile with under 1 year age gets account age action', () => {
    const result = calculateScore(poorProfile)
    const ageActions = result.roadmapActions.filter(a => a.factor === 'account_age')
    expect(ageActions.length).toBeGreaterThan(0)
  })

  it('a profile with 5+ inquiries gets inquiry action', () => {
    const result = calculateScore(poorProfile)
    const inquiryActions = result.roadmapActions.filter(a => a.factor === 'new_inquiries')
    expect(inquiryActions.length).toBeGreaterThan(0)
  })
})

describe('getScoreBand', () => {
  it('returns poor for scores under 580', () => {
    expect(getScoreBand(300)).toBe('poor')
    expect(getScoreBand(579)).toBe('poor')
  })

  it('returns fair for scores 580-669', () => {
    expect(getScoreBand(580)).toBe('fair')
    expect(getScoreBand(620)).toBe('fair')
    expect(getScoreBand(669)).toBe('fair')
  })

  it('returns good for scores 670-739', () => {
    expect(getScoreBand(670)).toBe('good')
    expect(getScoreBand(700)).toBe('good')
    expect(getScoreBand(739)).toBe('good')
  })

  it('returns very_good for scores 740-799', () => {
    expect(getScoreBand(740)).toBe('very_good')
    expect(getScoreBand(770)).toBe('very_good')
    expect(getScoreBand(799)).toBe('very_good')
  })

  it('returns exceptional for 800+', () => {
    expect(getScoreBand(800)).toBe('exceptional')
    expect(getScoreBand(850)).toBe('exceptional')
  })
})

describe('getScoreBandLabel', () => {
  it('returns readable labels', () => {
    expect(getScoreBandLabel('fair')).toBe('Fair (580–669)')
    expect(getScoreBandLabel('exceptional')).toBe('Exceptional (800+)')
  })
})

describe('getScoreBandRange', () => {
  it('returns correct ranges', () => {
    expect(getScoreBandRange('poor')).toBe('300 – 579')
    expect(getScoreBandRange('good')).toBe('670 – 739')
  })
})

describe('edge cases', () => {
  it('handles zero total accounts gracefully', () => {
    const result = calculateScore({
      ...healthyProfile,
      totalAccounts: 0,
      creditMix: [],
    })
    expect(result.estimatedScore).toBeGreaterThanOrEqual(300)
    expect(result.estimatedScore).toBeLessThanOrEqual(850)
  })

  it('handles maximum derogatory marks', () => {
    const result = calculateScore({
      scoreBand: 'poor',
      missedPaymentCount: 3,
      missedPaymentRecency: 'within_6_months',
      overallUtilisation: 75,
      oldestAccountAge: 'under_1_year',
      totalAccounts: 2,
      hardInquiries12m: 5,
      derogatoryMarks: ['collections', 'bankruptcy', 'foreclosure'],
      creditMix: ['credit_cards'],
    })
    expect(result.estimatedScore).toBeLessThan(550)
  })

  it('handles perfect profile (exceptional score band)', () => {
    const result = calculateScore({
      ...healthyProfile,
      scoreBand: 'exceptional',
      overallUtilisation: 5,
      hardInquiries12m: 0,
    })
    expect(result.estimatedScore).toBeGreaterThan(750)
  })

  it('handles a very new credit profile', () => {
    const result = calculateScore({
      scoreBand: 'fair',
      missedPaymentCount: 0,
      missedPaymentRecency: 'none',
      overallUtilisation: 0,
      oldestAccountAge: 'under_1_year',
      totalAccounts: 1,
      hardInquiries12m: 0,
      derogatoryMarks: [],
      creditMix: ['credit_cards'],
    })
    expect(result.estimatedScore).toBeGreaterThanOrEqual(300)
    expect(result.factorHealth).toHaveLength(5)
    expect(result.roadmapActions.length).toBeGreaterThan(0)
  })

  it('handles a profile with 100% utilisation', () => {
    const result = calculateScore({
      ...healthyProfile,
      overallUtilisation: 100,
    })
    const utilActions = result.roadmapActions.filter(a => a.factor === 'credit_utilisation')
    expect(utilActions.length).toBeGreaterThan(0)
    expect(utilActions[0].estimatedImpactMax).toBeGreaterThanOrEqual(60)
  })
})