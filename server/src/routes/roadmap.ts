import { Router, type Request, type Response } from 'express'
import { requireOnboarding } from '../middleware/auth'
import { db } from '../db/client'
import { roadmapItems } from '@shared/schema'
import { eq, and } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

router.get('/api/roadmap', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const items = await db.select().from(roadmapItems).where(eq(roadmapItems.userId, userId)).orderBy(roadmapItems.sortOrder)

  res.json({ items })
})

router.post('/api/roadmap/generate', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const { actions } = req.body as { actions: Array<{
    factor: string
    actionTitle: string
    description: string
    estimatedImpactMin: number
    estimatedImpactMax: number
    effortLevel: string
    timeHorizon: string
  }> }

  if (!actions || !Array.isArray(actions)) {
    res.status(400).json({ code: 'INVALID_INPUT', message: 'actions array is required' })
    return
  }

  await db.delete(roadmapItems).where(eq(roadmapItems.userId, userId))

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
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

  const savedItems = await db.select().from(roadmapItems).where(eq(roadmapItems.userId, userId)).orderBy(roadmapItems.sortOrder)

  res.json({ items: savedItems })
})

router.put('/api/roadmap/:id/status', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const id = req.params.id as string
  const { status } = req.body as { status: string }

  if (!['todo', 'in_progress', 'done'].includes(status)) {
    res.status(400).json({ code: 'INVALID_STATUS', message: 'Status must be todo, in_progress, or done' })
    return
  }

  const existing = await db.select().from(roadmapItems).where(eq(roadmapItems.id, id)).limit(1)
  if (!existing[0] || existing[0].userId !== userId) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Roadmap item not found' })
    return
  }

  const updateData: Record<string, unknown> = { status }
  if (status === 'done') {
    updateData.completedAt = new Date()
  } else {
    updateData.completedAt = null
  }

  await db.update(roadmapItems).set(updateData).where(eq(roadmapItems.id, id))

  const updated = await db.select().from(roadmapItems).where(eq(roadmapItems.id, id)).limit(1)
  res.json({ item: updated[0] })
})

export default router
