import { Router, type Request, type Response } from 'express'
import { requireVerified } from '../middleware/auth'
import { db } from '../db/client'
import { user } from '@shared/schema'
import { eq } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'
import { sendWelcomeEmail } from '../lib/email'

const router = Router()

router.post('/api/onboarding/complete', requireVerified, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  await db.update(user).set({ onboardingComplete: true }).where(eq(user.id, userId))

  const updated = await db.select().from(user).where(eq(user.id, userId)).limit(1)

  if (updated[0]?.email) {
    sendWelcomeEmail(updated[0].email)
  }

  res.json({ success: true, onboardingComplete: updated[0]?.onboardingComplete ?? true })
})

export default router