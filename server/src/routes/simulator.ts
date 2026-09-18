import { Router, type Request, type Response } from 'express'
import { requireOnboarding, requirePro, requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { user, simulatorScenarios } from '@shared/schema'
import { eq, desc, sql } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'
import { calculateScore } from '../lib/scoringEngine'

const router = Router()

router.post('/api/simulator/calculate', requireOnboarding, async (req: Request, res: Response) => {
  const body = req.body

  const input = {
    scoreBand: body.scoreBand ?? 'fair',
    missedPaymentCount: body.missedPaymentCount ?? 0,
    missedPaymentRecency: body.missedPaymentRecency ?? 'none',
    overallUtilisation: body.overallUtilisation ?? 0,
    oldestAccountAge: body.oldestAccountAge ?? '1_3_years',
    totalAccounts: body.totalAccounts ?? 1,
    hardInquiries12m: body.hardInquiries12m ?? 0,
    derogatoryMarks: body.derogatoryMarks ?? [],
    creditMix: body.creditMix ?? ['credit_cards'],
  }

  const result = calculateScore(input)
  res.json(result)
})

router.get('/api/simulator/scenarios', requirePro, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const scenarios = await db
    .select()
    .from(simulatorScenarios)
    .where(eq(simulatorScenarios.userId, userId))
    .orderBy(desc(simulatorScenarios.createdAt))

  res.json({ scenarios })
})

router.post('/api/simulator/scenarios', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const { name, inputOverrides, estimatedDelta } = req.body

  const userRecord = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  const isPro = userRecord[0]?.subscriptionStatus === 'active' || userRecord[0]?.subscriptionStatus === 'trialing'

  const existing = await db
    .select()
    .from(simulatorScenarios)
    .where(eq(simulatorScenarios.userId, userId))

  const freeLimit = 1
  const maxLimit = isPro ? 999 : freeLimit

  if (existing.length >= maxLimit) {
    const msg = isPro
      ? 'Maximum of 5 saved scenarios. Delete one to save another.'
      : 'Free plan limited to 1 saved scenario. Upgrade to Pro for more.'
    res.status(403).json({ code: 'LIMIT_REACHED', message: msg })
    return
  }

  await db.insert(simulatorScenarios).values({
    id: crypto.randomUUID(),
    userId,
    name,
    inputOverrides,
    estimatedDelta: estimatedDelta ?? null,
  })

  const updated = await db
    .select()
    .from(simulatorScenarios)
    .where(eq(simulatorScenarios.userId, userId))
    .orderBy(desc(simulatorScenarios.createdAt))

  res.json({ scenarios: updated })
})

router.delete('/api/simulator/scenarios/:id', requirePro, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  await db.delete(simulatorScenarios).where(sql`${simulatorScenarios.id} = ${req.params.id}`)

  res.json({ success: true })
})

export default router