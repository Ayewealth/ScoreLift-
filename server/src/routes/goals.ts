import { Router, type Request, type Response } from 'express'
import { requireOnboarding,  } from '../middleware/auth'
import { db } from '../db/client'
import { user, goals, creditProfiles } from '@shared/schema'
import { eq, and, sql } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

const SCORE_BAND_VALUES: Record<string, number> = {
  poor: 500,
  fair: 620,
  good: 700,
  very_good: 770,
  exceptional: 825,
}

const PURCHASE_READINESS: Record<string, { label: string; minScore: number }> = {
  mortgage: { label: 'Mortgage', minScore: 620 },
  car_finance: { label: 'Car Finance', minScore: 600 },
  credit_card: { label: 'Credit Card', minScore: 580 },
  personal_loan: { label: 'Personal Loan', minScore: 600 },
}

router.get('/api/goals', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const all = await db.select().from(goals).where(eq(goals.userId, userId))
  res.json({ goals: all })
})

router.post('/api/goals', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const body = req.body as {
    targetScoreBand: string
    targetDate: string
    purpose?: string
  }

  if (!body.targetScoreBand || !body.targetDate) {
    res.status(400).json({ code: 'VALIDATION_ERROR', message: 'targetScoreBand and targetDate are required' })
    return
  }

  const existing = await db.select().from(goals).where(and(eq(goals.userId, userId), eq(goals.isActive, true)))
  const userRecord = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  const sub = userRecord[0]?.subscriptionPlan

  if (existing.length >= 1) {
    if (existing.length >= 2 || (existing.length === 1 && sub !== 'annual_pro')) {
      res.status(403).json({ code: 'LIMIT_REACHED', message: 'Annual Pro subscribers can have up to 2 active goals. Upgrade to add another.' })
      return
    }
  }

  const activeGoal = await db.insert(goals).values({
    id: crypto.randomUUID(),
    userId,
    targetScoreBand: body.targetScoreBand,
    targetDate: new Date(body.targetDate),
    purpose: body.purpose ?? null,
    isActive: true,
    createdAt: new Date(),
  }).returning()

  res.json({ goal: activeGoal[0] })
})

router.put('/api/goals/:id', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const goalId = req.params.id

  const existing = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), sql`${goals.id} = ${goalId}`))
    .limit(1)

  if (!existing[0]) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Goal not found' })
    return
  }

  const body = req.body as Partial<{
    targetScoreBand: string
    targetDate: string
    purpose: string
    isActive: boolean
  }>

  const updates: Record<string, unknown> = {}
  if (body.targetScoreBand) updates.targetScoreBand = body.targetScoreBand
  if (body.targetDate) updates.targetDate = new Date(body.targetDate)
  if (body.purpose !== undefined) updates.purpose = body.purpose
  if (body.isActive !== undefined) updates.isActive = body.isActive

  if (Object.keys(updates).length > 0) {
    await db.update(goals).set(updates).where(and(eq(goals.userId, userId), sql`${goals.id} = ${goalId}`))
  }

  const updated = await db.select().from(goals).where(and(eq(goals.userId, userId), sql`${goals.id} = ${goalId}`)).limit(1)
  res.json({ goal: updated[0] })
})

router.delete('/api/goals/:id', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  await db.delete(goals).where(and(eq(goals.userId, userId), sql`${goals.id} = ${req.params.id}`))

  res.json({ success: true })
})

router.get('/api/goals/readiness', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const profile = await db.select().from(creditProfiles).where(eq(creditProfiles.userId, userId)).limit(1)
  const currentScore = profile[0]?.estimatedScore ?? 680
  const currentBand = profile[0]?.scoreBand ?? 'fair'

  const readiness = Object.entries(PURCHASE_READINESS).map(([key, info]) => ({
    purpose: key,
    label: info.label,
    minScore: info.minScore,
    currentScore,
    ready: currentScore >= info.minScore,
    gap: Math.max(0, info.minScore - currentScore),
  }))

  res.json({ readiness })
})

router.get('/api/goals/progress', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const profile = await db.select().from(creditProfiles).where(eq(creditProfiles.userId, userId)).limit(1)
  const currentScore = profile[0]?.estimatedScore ?? 680

  const active = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.isActive, true)))
    .limit(1)

  if (!active[0]) {
    res.json({ goal: null, progress: 0, onTrack: false, message: 'No active goal. Create one to track your progress.' })
    return
  }

  const g = active[0]
  const targetValue = SCORE_BAND_VALUES[g.targetScoreBand] ?? 700
  const startScore = 300
  const totalRange = targetValue - startScore
  const currentProgress = Math.max(0, currentScore - startScore)
  const percent = Math.min(100, Math.round((currentProgress / totalRange) * 100))

  const now = new Date()
  const targetDate = new Date(g.targetDate)
  const monthsRemaining = Math.max(1, (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))
  const neededGain = targetValue - currentScore
  const neededPerMonth = neededGain / monthsRemaining
  const onTrack = neededPerMonth <= 15

  res.json({
    goal: g,
    currentScore,
    targetScore: targetValue,
    progress: percent,
    onTrack,
    neededPerMonth: Math.round(neededPerMonth * 10) / 10,
    monthsRemaining: Math.round(monthsRemaining),
  })
})

export default router
