import type { CreditProfileInput } from './scoringEngine'
import { db } from '../db/client'
import { milestones, type MilestoneType } from '@shared/schema'
import { eq, and } from 'drizzle-orm'

export const MILESTONE_DEFINITIONS: {
  type: MilestoneType
  name: string
  description: string
  icon: string
  check: (context: MilestoneContext) => boolean
}[] = [
  {
    type: 'first_checkin',
    name: 'First Check-In',
    description: 'Completed your very first monthly check-in',
    icon: 'calendar-check',
    check: (ctx) => ctx.checkinCount === 1,
  },
  {
    type: 'streak_3',
    name: '3-Month Streak',
    description: 'Completed 3 consecutive monthly check-ins',
    icon: 'flame',
    check: (ctx) => ctx.streak >= 3,
  },
  {
    type: 'streak_6',
    name: '6-Month Streak',
    description: 'Completed 6 consecutive monthly check-ins',
    icon: 'flame',
    check: (ctx) => ctx.streak >= 6,
  },
  {
    type: 'streak_12',
    name: '1-Year Streak',
    description: 'Completed 12 consecutive monthly check-ins',
    icon: 'award',
    check: (ctx) => ctx.streak >= 12,
  },
  {
    type: 'score_band_improvement',
    name: 'Score Climber',
    description: 'Moved up at least one credit score band',
    icon: 'trending-up',
    check: (ctx) => ctx.scoreBandImproved === true,
  },
  {
    type: 'roadmap_completions_5',
    name: 'Action Taker',
    description: 'Completed 5 roadmap actions',
    icon: 'check-circle',
    check: (ctx) => ctx.roadmapCompletedCount >= 5,
  },
  {
    type: 'education_track_complete',
    name: 'Credit IQ',
    description: 'Completed an entire education track',
    icon: 'graduation-cap',
    check: (ctx) => ctx.educationTrackCompleted === true,
  },
  {
    type: 'first_dispute',
    name: 'Defender',
    description: 'Generated your first dispute letter',
    icon: 'scroll-text',
    check: (ctx) => ctx.disputeCount >= 1,
  },
]

export interface MilestoneContext {
  userId: string
  checkinCount: number
  streak: number
  scoreBandImproved: boolean
  roadmapCompletedCount: number
  educationTrackCompleted: boolean
  disputeCount: number
}

export async function checkAndUnlockMilestones(ctx: MilestoneContext): Promise<string[]> {
  const newlyUnlocked: string[] = []
  const existing = await db.select().from(milestones).where(eq(milestones.userId, ctx.userId))
  const existingTypes = new Set(existing.map((m) => m.milestoneType))

  for (const def of MILESTONE_DEFINITIONS) {
    if (existingTypes.has(def.type)) continue
    if (def.check(ctx)) {
      await db.insert(milestones).values({
        id: crypto.randomUUID(),
        userId: ctx.userId,
        milestoneType: def.type,
        unlockedAt: new Date(),
      })
      newlyUnlocked.push(def.type)
    }
  }

  return newlyUnlocked
}