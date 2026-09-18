import { Router, type Request, type Response } from 'express'
import { requireVerified } from '../middleware/auth'
import { db } from '../db/client'
import { creditProfiles, roadmapItems, checkins, goals, milestones } from '@shared/schema'
import { eq, desc } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'
import { MILESTONE_DEFINITIONS } from '../lib/milestones'

const router = Router()

router.get('/api/dashboard', requireVerified, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const profile = await db.select().from(creditProfiles).where(eq(creditProfiles.userId, userId)).limit(1)

  const allItems = await db.select().from(roadmapItems).where(eq(roadmapItems.userId, userId)).orderBy(roadmapItems.sortOrder)
  const totalActions = allItems.length
  const completedActions = allItems.filter(i => i.status === 'done').length

  const allCheckins = await db.select().from(checkins).where(eq(checkins.userId, userId)).orderBy(desc(checkins.completedAt))
  const streak = calculateStreak(allCheckins.map(c => c.completedAt))
  const lastCheckin = allCheckins[0] ?? null

  const unlockedMilestones = await db.select().from(milestones).where(eq(milestones.userId, userId))
  const recentMilestones = unlockedMilestones.slice(-3).reverse()

  const activeGoal = await db.select().from(goals).where(eq(goals.userId, userId)).limit(1)

  res.json({
    profile: profile[0] ?? null,
    scoreEstimate: profile[0]?.estimatedScore ?? null,
    scoreBand: profile[0]?.scoreBand ?? null,
    scoreDelta: allCheckins.length > 0 ? allCheckins[0].deltaFromPrevious : null,
    topActions: allItems.filter(i => i.status !== 'done').slice(0, 3),
    progress: {
      total: totalActions,
      completed: completedActions,
      percent: totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0,
    },
    checkin: {
      streak,
      lastCheckin,
      totalCheckins: allCheckins.length,
    },
    milestones: recentMilestones.map((m) => {
      const def = MILESTONE_DEFINITIONS.find(d => d.type === m.milestoneType)
      return {
        type: m.milestoneType,
        name: def?.name ?? m.milestoneType,
        icon: def?.icon ?? 'award',
        unlockedAt: m.unlockedAt,
      }
    }),
    activeGoal: activeGoal[0] ?? null,
    scoreTimeline: allCheckins.map(c => ({
      date: c.completedAt,
      score: c.scoreEstimate,
      delta: c.deltaFromPrevious,
    })).reverse(),
  })
})

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0
  const sorted = dates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime())
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.round((sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 35) streak++
    else break
  }
  return streak
}

export default router