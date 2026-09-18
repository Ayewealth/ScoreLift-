import { Router, type Request, type Response } from 'express'
import { requireOnboarding } from '../middleware/auth'
import { db } from '../db/client'
import { milestones, type MilestoneType } from '@shared/schema'
import { eq } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'
import { MILESTONE_DEFINITIONS } from '../lib/milestones'

const router = Router()

router.get('/api/milestones', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const unlocked = await db.select().from(milestones).where(eq(milestones.userId, userId))

  const unlockedTypes = new Set(unlocked.map((m) => m.milestoneType))
  const allMilestones = MILESTONE_DEFINITIONS.map((def) => ({
    type: def.type,
    name: def.name,
    description: def.description,
    icon: def.icon,
    unlocked: unlockedTypes.has(def.type),
    unlockedAt: unlocked.find((m) => m.milestoneType === def.type)?.unlockedAt ?? null,
  }))

  res.json({ milestones: allMilestones })
})

export default router
