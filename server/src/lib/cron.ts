import cron from 'node-cron'
import { db } from '../db/client'
import { user, checkins, creditProfiles, creditCards, roadmapItems, goals, milestones, simulatorScenarios, disputeLetters, documents, lessonCompletions } from '@shared/schema'
import { eq, desc, and, gte, lt } from 'drizzle-orm'
import { sendCheckinReminderEmail } from './email'

export function startCron() {
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running check-in reminder check...')
    try {
      const now = new Date()

      const allUsers = await db.select({
        id: user.id,
        email: user.email,
      }).from(user)

      for (const u of allUsers) {
        if (!u.email) continue

        const recentCheckin = await db
          .select()
          .from(checkins)
          .where(and(
            eq(checkins.userId, u.id),
            gte(checkins.completedAt, new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)),
          ))
          .limit(1)

        if (recentCheckin.length > 0) continue

        const allTime = await db
          .select()
          .from(checkins)
          .where(eq(checkins.userId, u.id))
          .orderBy(desc(checkins.completedAt))
          .limit(1)

        const daysSince = allTime[0]
          ? Math.floor((now.getTime() - new Date(allTime[0].completedAt).getTime()) / (1000 * 60 * 60 * 24))
          : 999

        if (daysSince >= 30) {
          const streak = calculateStreak(
            (await db.select().from(checkins).where(eq(checkins.userId, u.id)).orderBy(desc(checkins.completedAt)))
              .map((c) => c.completedAt)
          )
          await sendCheckinReminderEmail(u.email, streak)
        }
      }
    } catch (err) {
      console.error('[Cron] Check-in reminder error:', err)
    }
  })

  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running account cleanup check...')
    try {
      const expiredUsers = await db
        .select({ id: user.id })
        .from(user)
        .where(and(
          eq(user.banned, true),
          lt(user.banExpires, new Date()),
        ))

      for (const u of expiredUsers) {
        await db.delete(user).where(eq(user.id, u.id))
        console.log(`[Cron] Cleaned up expired account: ${u.id}`)
      }

      if (expiredUsers.length > 0) {
        console.log(`[Cron] Cleaned up ${expiredUsers.length} expired accounts`)
      }
    } catch (err) {
      console.error('[Cron] Account cleanup error:', err)
    }
  })

  console.log('[Cron] Started — hourly check-in reminder + daily account cleanup')
}

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