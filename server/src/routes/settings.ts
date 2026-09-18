import { Router, type Request, type Response } from 'express'
import { requireOnboarding } from '../middleware/auth'
import { db } from '../db/client'
import { user } from '@shared/schema'
import { eq } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'
import { auth } from '../auth'
import { uploadFile, getFileUrl } from '../lib/r2'
import multer from 'multer'

const router = Router()
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

router.get('/api/settings/notifications', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const existing = await db.select({ notificationPreferences: user.notificationPreferences }).from(user).where(eq(user.id, userId)).limit(1)
  const prefs = existing[0]?.notificationPreferences ? JSON.parse(existing[0].notificationPreferences) : {}

  res.json({
    checkinReminder: prefs.checkinReminder ?? true,
    milestoneEmails: prefs.milestoneEmails ?? true,
    weeklyDigest: prefs.weeklyDigest ?? false,
    marketingEmails: prefs.marketingEmails ?? false,
  })
})

router.put('/api/settings/notifications', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const body = req.body as {
    checkinReminder?: boolean
    milestoneEmails?: boolean
    weeklyDigest?: boolean
    marketingEmails?: boolean
  }

  const existing = await db.select({ notificationPreferences: user.notificationPreferences }).from(user).where(eq(user.id, userId)).limit(1)
  const current = existing[0]?.notificationPreferences ? JSON.parse(existing[0].notificationPreferences) : {}

  const merged = {
    ...current,
    ...(body.checkinReminder !== undefined ? { checkinReminder: body.checkinReminder } : {}),
    ...(body.milestoneEmails !== undefined ? { milestoneEmails: body.milestoneEmails } : {}),
    ...(body.weeklyDigest !== undefined ? { weeklyDigest: body.weeklyDigest } : {}),
    ...(body.marketingEmails !== undefined ? { marketingEmails: body.marketingEmails } : {}),
  }

  await db.update(user).set({ notificationPreferences: JSON.stringify(merged) }).where(eq(user.id, userId))

  res.json({ success: true, ...merged })
})

router.put('/api/settings/profile', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const { name } = req.body as { name?: string }

  if (!name || name.trim().length === 0) {
    res.status(400).json({ code: 'INVALID_INPUT', message: 'Name is required' })
    return
  }

  await db.update(user).set({ name: name.trim() }).where(eq(user.id, userId))

  res.json({ success: true })
})

router.put('/api/settings/password', requireOnboarding, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string }

  if (!currentPassword || !newPassword) {
    res.status(400).json({ code: 'INVALID_INPUT', message: 'Current and new password are required' })
    return
  }

  if (newPassword.length < 8) {
    res.status(400).json({ code: 'INVALID_INPUT', message: 'New password must be at least 8 characters' })
    return
  }

  try {
    const result = await auth.api.changePassword({
      body: { currentPassword, newPassword },
      headers: req.headers as Record<string, string>,
    })
    res.json({ success: true })
  } catch (err: any) {
    const message = err?.message ?? err?.body?.message ?? 'Failed to change password'
    res.status(400).json({ code: 'PASSWORD_ERROR', message })
  }
})

router.get('/api/user/avatar', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const existing = await db.select({ image: user.image }).from(user).where(eq(user.id, userId)).limit(1)
  const imageKey = existing[0]?.image

  if (!imageKey) {
    res.json({ url: null })
    return
  }

  const url = await getFileUrl(imageKey, 3600)
  res.json({ url })
})

router.put('/api/user/avatar', requireOnboarding, avatarUpload.single('avatar'), async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const file = req.file as Express.Multer.File | undefined

  if (!file) {
    res.status(400).json({ code: 'NO_FILE', message: 'No image file provided' })
    return
  }

  const ext = file.mimetype === 'image/png' ? 'png' : 'jpg'
  const key = `avatars/${userId}.${ext}`
  const uploadResult = await uploadFile(file.buffer, key, file.mimetype)

  if (!uploadResult) {
    res.status(500).json({ code: 'UPLOAD_FAILED', message: 'Failed to upload avatar' })
    return
  }

  await db.update(user).set({ image: key }).where(eq(user.id, userId))

  const url = await getFileUrl(key, 3600)
  res.json({ url })
})

export default router