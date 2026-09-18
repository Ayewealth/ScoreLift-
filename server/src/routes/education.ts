import { Router, type Request, type Response } from 'express'
import { requireOnboarding } from '../middleware/auth'
import { db } from '../db/client'
import { educationTracks, educationLessons, lessonCompletions } from '@shared/schema'
import { eq, and, inArray, sql } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

router.get('/api/education/tracks', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const tracks = await db.select().from(educationTracks).orderBy(educationTracks.sortOrder)

  const result = await Promise.all(tracks.map(async (track) => {
    const lessons = await db
      .select()
      .from(educationLessons)
      .where(eq(educationLessons.trackId, track.id))
      .orderBy(educationLessons.sortOrder)

    const completed = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessonCompletions)
      .where(and(eq(lessonCompletions.userId, userId), inArray(lessonCompletions.lessonId, lessons.map(l => l.id))))

    const completedCount = Number(completed[0]?.count ?? 0)

    return {
      ...track,
      lessonCount: lessons.length,
      completedCount,
      progress: lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0,
    }
  }))

  res.json({ tracks: result })
})

router.get('/api/education/tracks/:id', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const track = await db.select().from(educationTracks).where(sql`${educationTracks.id} = ${req.params.id}`).limit(1)
  if (!track[0]) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Track not found' })
    return
  }

  const lessons = await db
    .select()
    .from(educationLessons)
    .where(eq(educationLessons.trackId, track[0].id))
    .orderBy(educationLessons.sortOrder)

  const completions = await db
    .select()
    .from(lessonCompletions)
    .where(eq(lessonCompletions.userId, userId))

  const completedLessonIds = new Set(completions.map(c => c.lessonId))

  const lessonsWithProgress = lessons.map((lesson, i) => ({
    ...lesson,
    completed: completedLessonIds.has(lesson.id),
    sortOrder: i,
  }))

  res.json({
    track: track[0],
    lessons: lessonsWithProgress,
    progress: lessons.length > 0 ? Math.round((lessonsWithProgress.filter(l => l.completed).length / lessons.length) * 100) : 0,
  })
})

router.get('/api/education/lessons/:id', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const lesson = await db.select().from(educationLessons).where(sql`${educationLessons.id} = ${req.params.id}`).limit(1)
  if (!lesson[0]) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Lesson not found' })
    return
  }

  const track = await db.select().from(educationTracks).where(eq(educationTracks.id, lesson[0].trackId)).limit(1)

  const completion = await db
    .select()
    .from(lessonCompletions)
    .where(and(eq(lessonCompletions.lessonId, lesson[0].id), eq(lessonCompletions.userId, userId)))
    .limit(1)

  res.json({
    lesson: lesson[0],
    track: track[0] ?? null,
    completed: completion.length > 0,
    quizScore: completion[0]?.quizScore ?? null,
  })
})

router.post('/api/education/lessons/:id/complete', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const { quizScore } = req.body

  const lesson = await db.select().from(educationLessons).where(sql`${educationLessons.id} = ${req.params.id}`).limit(1)
  if (!lesson[0]) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Lesson not found' })
    return
  }

  const existing = await db
    .select()
    .from(lessonCompletions)
    .where(and(eq(lessonCompletions.lessonId, lesson[0].id), eq(lessonCompletions.userId, userId)))
    .limit(1)

  if (existing[0]) {
    res.json({ success: true, message: 'Already completed' })
    return
  }

  await db.insert(lessonCompletions).values({
    id: crypto.randomUUID(),
    userId,
    lessonId: lesson[0].id,
    quizScore: quizScore ?? null,
  })

  const allLessons = await db
    .select()
    .from(educationLessons)
    .where(eq(educationLessons.trackId, lesson[0].trackId))
    .orderBy(educationLessons.sortOrder)

  const completed = await db
    .select()
    .from(lessonCompletions)
    .where(eq(lessonCompletions.userId, userId))

  const completedLessonIds = new Set(completed.map(c => c.lessonId))
  const allCompleted = allLessons.every(l => completedLessonIds.has(l.id))

  res.json({ success: true, trackComplete: allCompleted })
})

export default router
