import { Router, type Request, type Response } from 'express'
import { requireVerified } from '../middleware/auth'
import { db } from '../db/client'
import { creditProfiles, creditCards } from '@shared/schema'
import { eq } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'
import { calculateScore } from '../lib/scoringEngine'

interface ProfileCardInput {
  cardName: string
  creditLimit: string
  currentBalance: string
}

interface ProfileBody {
  scoreBand: string
  missedPaymentCount?: number
  missedPaymentRecency?: string
  overallUtilisation?: number
  oldestAccountAge: string
  totalAccounts?: number
  hardInquiries12m?: number
  derogatoryMarks?: string[]
  creditMix: string[]
  cards?: ProfileCardInput[]
}

const router = Router()

router.get('/api/profile', requireVerified, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const profile = await db.select().from(creditProfiles).where(eq(creditProfiles.userId, userId)).limit(1)
  const cards = await db.select().from(creditCards).where(eq(creditCards.userId, userId))

  res.json({ profile: profile[0] ?? null, cards })
})

router.post('/api/profile', requireVerified, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const body = req.body as ProfileBody

  if (!body.scoreBand || !body.creditMix || !body.oldestAccountAge) {
    res.status(400).json({ code: 'INVALID_INPUT', message: 'Missing required profile fields' })
    return
  }

  const existing = await db.select().from(creditProfiles).where(eq(creditProfiles.userId, userId)).limit(1)

  const scoringResult = calculateScore({
    scoreBand: body.scoreBand as never,
    missedPaymentCount: body.missedPaymentCount ?? 0,
    missedPaymentRecency: (body.missedPaymentRecency ?? 'none') as never,
    overallUtilisation: body.overallUtilisation ?? 0,
    oldestAccountAge: body.oldestAccountAge as never,
    totalAccounts: body.totalAccounts ?? 1,
    hardInquiries12m: body.hardInquiries12m ?? 0,
    derogatoryMarks: (body.derogatoryMarks ?? []) as never,
    creditMix: body.creditMix as never,
  })

  const profileData = {
    userId,
    scoreBand: body.scoreBand,
    missedPaymentCount: body.missedPaymentCount ?? 0,
    missedPaymentRecency: body.missedPaymentRecency ?? 'none',
    overallUtilisation: body.overallUtilisation ?? 0,
    oldestAccountAge: body.oldestAccountAge,
    totalAccounts: body.totalAccounts ?? 1,
    hardInquiries12m: body.hardInquiries12m ?? 0,
    derogatoryMarks: body.derogatoryMarks ?? [],
    creditMix: body.creditMix,
    estimatedScore: scoringResult.estimatedScore,
    updatedAt: new Date(),
  }

  if (existing[0]) {
    await db.update(creditProfiles).set(profileData).where(eq(creditProfiles.id, existing[0].id))
  } else {
    await db.insert(creditProfiles).values({ id: crypto.randomUUID(), ...profileData })
  }

  if (body.cards) {
    await db.delete(creditCards).where(eq(creditCards.userId, userId))

    for (const card of body.cards) {
      await db.insert(creditCards).values({
        id: crypto.randomUUID(),
        userId,
        cardName: card.cardName,
        creditLimit: card.creditLimit,
        currentBalance: card.currentBalance,
      })
    }
  }

  const updatedProfile = await db.select().from(creditProfiles).where(eq(creditProfiles.userId, userId)).limit(1)
  const updatedCards = await db.select().from(creditCards).where(eq(creditCards.userId, userId))

  res.json({ profile: updatedProfile[0], cards: updatedCards, scoringResult })
})

export default router