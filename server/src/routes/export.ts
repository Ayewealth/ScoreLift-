import { Router, type Request, type Response } from 'express'
import { requireOnboarding } from '../middleware/auth'
import { db } from '../db/client'
import { creditProfiles, creditCards, roadmapItems, checkins, goals, milestones, simulatorScenarios, disputeLetters, documents, lessonCompletions } from '@shared/schema'
import { eq } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

router.get('/api/export/data', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const [profile] = await db.select().from(creditProfiles).where(eq(creditProfiles.userId, userId)).limit(1)
  const cards = await db.select().from(creditCards).where(eq(creditCards.userId, userId))
  const roadmap = await db.select().from(roadmapItems).where(eq(roadmapItems.userId, userId))
  const checkinHistory = await db.select().from(checkins).where(eq(checkins.userId, userId)).orderBy(checkins.completedAt)
  const userGoals = await db.select().from(goals).where(eq(goals.userId, userId))
  const userMilestones = await db.select().from(milestones).where(eq(milestones.userId, userId))
  const scenarios = await db.select().from(simulatorScenarios).where(eq(simulatorScenarios.userId, userId))
  const letters = await db.select().from(disputeLetters).where(eq(disputeLetters.userId, userId))
  const userDocuments = await db.select({ id: documents.id, filename: documents.filename, fileSize: documents.fileSize, fileType: documents.fileType, category: documents.category, notes: documents.notes, createdAt: documents.createdAt }).from(documents).where(eq(documents.userId, userId))
  const completions = await db.select().from(lessonCompletions).where(eq(lessonCompletions.userId, userId))

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: profile ?? null,
    cards,
    roadmap,
    checkins: checkinHistory,
    goals: userGoals,
    milestones: userMilestones,
    simulatorScenarios: scenarios,
    disputeLetters: letters,
    documents: userDocuments,
    lessonCompletions: completions,
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="scorelift-export-${userId}.json"`)
  res.json(exportData)
})

export default router