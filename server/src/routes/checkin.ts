import { Router, type Request, type Response } from 'express'
import { requireOnboarding } from '../middleware/auth'
import { db } from '../db/client'
import { user, creditProfiles, creditCards, roadmapItems, checkins, milestones, disputeLetters, lessonCompletions, educationTracks, educationLessons } from '@shared/schema'
import { eq, desc, and, sql } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'
import { calculateScore, type ScoreBand } from '../lib/scoringEngine'
import { checkAndUnlockMilestones } from '../lib/milestones'
import { sendCheckinDigestEmail, sendMilestoneEmail } from '../lib/email'

const router = Router()

router.get('/api/checkin/history', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const history = await db
    .select()
    .from(checkins)
    .where(eq(checkins.userId, userId))
    .orderBy(desc(checkins.completedAt))

  res.json({ history })
})

router.get('/api/checkin/status', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const allCheckins = await db
    .select()
    .from(checkins)
    .where(eq(checkins.userId, userId))
    .orderBy(desc(checkins.completedAt))

  const streak = calculateStreak(allCheckins.map((c) => c.completedAt))
  const lastCheckin = allCheckins[0] ?? null
  const daysSinceLastCheckin = lastCheckin
    ? Math.floor((Date.now() - new Date(lastCheckin.completedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const dueForCheckin = daysSinceLastCheckin === null || daysSinceLastCheckin >= 30

  res.json({
    streak,
    lastCheckin,
    daysSinceLastCheckin,
    dueForCheckin,
    totalCheckins: allCheckins.length,
  })
})

router.post('/api/checkin/submit', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const body = req.body as {
    missedPaymentCount?: number
    missedPaymentRecency?: string
    cards?: { cardName: string; creditLimit: number; currentBalance: number }[]
    newAccounts?: number
    newInquiries?: number
  }

  const currentProfile = await db
    .select()
    .from(creditProfiles)
    .where(eq(creditProfiles.userId, userId))
    .limit(1)

  const profile = currentProfile[0]
  if (!profile) {
    res.status(400).json({ code: 'NO_PROFILE', message: 'Complete your credit profile first' })
    return
  }

  const updatedProfile = {
    scoreBand: profile.scoreBand,
    missedPaymentCount: body.missedPaymentCount ?? profile.missedPaymentCount,
    missedPaymentRecency: body.missedPaymentRecency ?? profile.missedPaymentRecency,
    overallUtilisation: profile.overallUtilisation,
    oldestAccountAge: profile.oldestAccountAge,
    totalAccounts: (profile.totalAccounts ?? 0) + (body.newAccounts ?? 0),
    hardInquiries12m: (profile.hardInquiries12m ?? 0) + (body.newInquiries ?? 0),
    derogatoryMarks: profile.derogatoryMarks as string[],
    creditMix: profile.creditMix as string[],
  }

  if (body.cards && body.cards.length > 0) {
    await db.delete(creditCards).where(eq(creditCards.userId, userId))
    for (const card of body.cards) {
      await db.insert(creditCards).values({
        id: crypto.randomUUID(),
        userId,
        cardName: card.cardName,
        creditLimit: String(card.creditLimit),
        currentBalance: String(card.currentBalance),
      })
    }
    const totalLimit = body.cards.reduce((s, c) => s + c.creditLimit, 0)
    const totalBalance = body.cards.reduce((s, c) => s + c.currentBalance, 0)
    updatedProfile.overallUtilisation = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0
  }

  const scoringInput = {
    scoreBand: updatedProfile.scoreBand as ScoreBand,
    missedPaymentCount: updatedProfile.missedPaymentCount,
    missedPaymentRecency: updatedProfile.missedPaymentRecency as any,
    overallUtilisation: updatedProfile.overallUtilisation,
    oldestAccountAge: updatedProfile.oldestAccountAge as any,
    totalAccounts: updatedProfile.totalAccounts,
    hardInquiries12m: updatedProfile.hardInquiries12m,
    derogatoryMarks: updatedProfile.derogatoryMarks as any,
    creditMix: updatedProfile.creditMix as any,
  }

  const scoringResult = calculateScore(scoringInput)
  const previousScore = profile.estimatedScore ?? 680
  const delta = scoringResult.estimatedScore - previousScore

  await db.update(creditProfiles).set({
    ...updatedProfile,
    estimatedScore: scoringResult.estimatedScore,
    updatedAt: new Date(),
  }).where(eq(creditProfiles.userId, userId))

  await db.insert(checkins).values({
    id: crypto.randomUUID(),
    userId,
    scoreEstimate: scoringResult.estimatedScore,
    deltaFromPrevious: delta,
    completedAt: new Date(),
    notes: null,
  })

  await db.delete(roadmapItems).where(eq(roadmapItems.userId, userId))
  for (let i = 0; i < scoringResult.roadmapActions.length; i++) {
    const action = scoringResult.roadmapActions[i]
    await db.insert(roadmapItems).values({
      id: crypto.randomUUID(),
      userId,
      factor: action.factor,
      actionTitle: action.actionTitle,
      description: action.description,
      estimatedImpactMin: action.estimatedImpactMin,
      estimatedImpactMax: action.estimatedImpactMax,
      effortLevel: action.effortLevel,
      timeHorizon: action.timeHorizon,
      status: 'todo',
      sortOrder: i,
    })
  }

  const allCheckins = await db
    .select()
    .from(checkins)
    .where(eq(checkins.userId, userId))
    .orderBy(desc(checkins.completedAt))

  const streak = calculateStreak(allCheckins.map((c) => c.completedAt))

  const completedRoadmapItems = await db
    .select()
    .from(roadmapItems)
    .where(and(eq(roadmapItems.userId, userId), eq(roadmapItems.status, 'done')))

  const previousCheckin = allCheckins[1]
  const previousBand = previousCheckin
    ? getScoreBandForScore(previousCheckin.scoreEstimate)
    : null
  const currentBand = getScoreBandForScore(scoringResult.estimatedScore)
  const scoreBandImproved = previousBand !== null && previousBand !== currentBand

  const disputeRecords = await db
    .select()
    .from(disputeLetters)
    .where(eq(disputeLetters.userId, userId))
  const disputeCount = disputeRecords.length

  const allCompletions = await db
    .select()
    .from(lessonCompletions)
    .where(eq(lessonCompletions.userId, userId))
  const completedLessonIds = new Set(allCompletions.map((c) => c.lessonId))

  const allTracks = await db.select().from(educationTracks)
  let educationTrackCompleted = false
  for (const track of allTracks) {
    const trackLessons = await db
      .select()
      .from(educationLessons)
      .where(eq(educationLessons.trackId, track.id))
    if (trackLessons.length > 0 && trackLessons.every((l) => completedLessonIds.has(l.id))) {
      educationTrackCompleted = true
      break
    }
  }

  const newlyUnlocked = await checkAndUnlockMilestones({
    userId,
    checkinCount: allCheckins.length,
    streak,
    scoreBandImproved,
    roadmapCompletedCount: completedRoadmapItems.length,
    educationTrackCompleted,
    disputeCount,
  })

  const userRecord = await db.select().from(user).where(eq(user.id, userId)).limit(1)

  if (userRecord[0]?.email) {
    sendCheckinDigestEmail(userRecord[0].email, scoringResult.estimatedScore, delta, streak)
    for (const type of newlyUnlocked) {
      const def = (await import('../lib/milestones')).MILESTONE_DEFINITIONS.find((d) => d.type === type)
      if (def) {
        sendMilestoneEmail(userRecord[0].email, def.name, def.description)
      }
    }
  }

  res.json({
    success: true,
    newScore: scoringResult.estimatedScore,
    delta,
    streak,
    factorHealth: scoringResult.factorHealth,
    topActions: scoringResult.roadmapActions.slice(0, 3),
    newlyUnlocked,
  })
})

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0
  const sorted = dates.map((d) => new Date(d)).sort((a, b) => b.getTime() - a.getTime())
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.round((sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 35) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function getScoreBandForScore(score: number): string {
  if (score < 580) return 'poor'
  if (score < 670) return 'fair'
  if (score < 740) return 'good'
  if (score < 800) return 'very_good'
  return 'exceptional'
}

export default router
