import type { Request, Response, NextFunction } from 'express'
import { auth } from '../auth'
import { db } from '../db/client'
import { user } from '@shared/schema'
import { eq } from 'drizzle-orm'

interface AuthenticatedRequest extends Request {
  userId?: string
}

function headersToInit(headers: Request['headers']): HeadersInit {
  const init: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') init[key] = value
  }
  return init
}

async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: headersToInit(req.headers) })
  if (!session) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    return
  }
  req.userId = session.user.id
  next()
}

async function requireVerified(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: headersToInit(req.headers) })
  if (!session) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    return
  }
  if (!session.user.emailVerified) {
    res.status(403).json({ code: 'EMAIL_NOT_VERIFIED', message: 'Email verification required' })
    return
  }
  req.userId = session.user.id
  next()
}

async function requireOnboarding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: headersToInit(req.headers) })
  if (!session) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    return
  }
  if (!session.user.emailVerified) {
    res.status(403).json({ code: 'EMAIL_NOT_VERIFIED', message: 'Email verification required' })
    return
  }
  const userWithCustomFields = session.user as unknown as { onboardingComplete: boolean }
  if (!userWithCustomFields.onboardingComplete) {
    res.status(403).json({ code: 'ONBOARDING_INCOMPLETE', message: 'Onboarding must be completed first' })
    return
  }
  req.userId = session.user.id
  next()
}

async function requirePro(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: headersToInit(req.headers) })
  if (!session) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    return
  }
  if (!session.user.emailVerified) {
    res.status(403).json({ code: 'EMAIL_NOT_VERIFIED', message: 'Email verification required' })
    return
  }
  const userRecord = await db.select({ subscriptionStatus: user.subscriptionStatus, onboardingComplete: user.onboardingComplete }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!userRecord[0]) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'User not found' })
    return
  }
  if (!userRecord[0].onboardingComplete) {
    res.status(403).json({ code: 'ONBOARDING_INCOMPLETE', message: 'Onboarding must be completed first' })
    return
  }
  const status = userRecord[0].subscriptionStatus
  if (status !== 'active' && status !== 'trialing') {
    res.status(403).json({ code: 'PRO_REQUIRED', message: 'A Pro subscription is required for this feature' })
    return
  }
  req.userId = session.user.id
  next()
}

async function requireAnnualPro(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: headersToInit(req.headers) })
  if (!session) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    return
  }
  if (!session.user.emailVerified) {
    res.status(403).json({ code: 'EMAIL_NOT_VERIFIED', message: 'Email verification required' })
    return
  }
  const userRecord = await db.select({ subscriptionStatus: user.subscriptionStatus, subscriptionPlan: user.subscriptionPlan, onboardingComplete: user.onboardingComplete }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!userRecord[0]) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'User not found' })
    return
  }
  if (!userRecord[0].onboardingComplete) {
    res.status(403).json({ code: 'ONBOARDING_INCOMPLETE', message: 'Onboarding must be completed first' })
    return
  }
  const status = userRecord[0].subscriptionStatus
  const plan = userRecord[0].subscriptionPlan
  if ((status !== 'active' && status !== 'trialing') || plan !== 'pro_annual') {
    res.status(403).json({ code: 'ANNUAL_PRO_REQUIRED', message: 'An Annual Pro subscription is required for this feature' })
    return
  }
  req.userId = session.user.id
  next()
}

export { requireAuth, requireVerified, requireOnboarding, requirePro, requireAnnualPro }
export type { AuthenticatedRequest }