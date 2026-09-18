import { Router, type Request, type Response } from 'express'
import { requireOnboarding } from '../middleware/auth'
import { db } from '../db/client'
import { user } from '@shared/schema'
import { eq, lt } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'
import { stripe, env } from '../env'
import { sendAccountDeletionEmail } from '../lib/email'

const router = Router()

router.post('/api/account/delete', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const existing = await db.select({
    stripeCustomerId: user.stripeCustomerId,
    subscriptionStatus: user.subscriptionStatus,
    banned: user.banned,
    email: user.email,
  }).from(user).where(eq(user.id, userId)).limit(1)

  if (!existing[0]) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'User not found' })
    return
  }

  if (existing[0].banned) {
    res.status(400).json({ code: 'ALREADY_DELETED', message: 'Account deletion is already in progress' })
    return
  }

  if (existing[0].subscriptionStatus === 'active' && existing[0].stripeCustomerId) {
    try {
      const subscriptions = await stripe!.subscriptions.list({ customer: existing[0].stripeCustomerId, status: 'active', limit: 1 })
      for (const sub of subscriptions.data) {
        await stripe!.subscriptions.cancel(sub.id)
      }
    } catch (err) {
      console.error('[Account] Failed to cancel Stripe subscription:', err)
    }
  }

  const banExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await db.update(user).set({
    banned: true,
    banReason: 'User requested account deletion',
    banExpires,
  }).where(eq(user.id, userId))

  if (existing[0].email) {
    const restoreUrl = `${env.APP_URL}/settings`
    sendAccountDeletionEmail(existing[0].email, restoreUrl)
  }

  res.json({ success: true, banExpires: banExpires.toISOString(), message: 'Account scheduled for deletion. You have 30 days to cancel.' })
})

router.post('/api/account/restore', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const existing = await db.select({ banned: user.banned, banExpires: user.banExpires }).from(user).where(eq(user.id, userId)).limit(1)

  if (!existing[0]) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'User not found' })
    return
  }

  if (!existing[0].banned) {
    res.status(400).json({ code: 'NOT_DELETED', message: 'Account deletion has not been initiated' })
    return
  }

  await db.update(user).set({
    banned: false,
    banReason: null,
    banExpires: null,
  }).where(eq(user.id, userId))

  res.json({ success: true, message: 'Account has been restored.' })
})

export default router