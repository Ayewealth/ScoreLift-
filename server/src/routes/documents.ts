import { Router, type Request, type Response } from 'express'
import { requireOnboarding } from '../middleware/auth'
import { db } from '../db/client'
import { documents } from '@shared/schema'
import { eq, and, sql, count } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'
import { uploadFile, getFileUrl, deleteFile } from '../lib/r2'
import multer from 'multer'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, JPG, PNG, DOCX'))
    }
  },
})

function getFileType(mime: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  }
  return map[mime] ?? 'unknown'
}

async function checkFreeLimit(userId: string): Promise<boolean> {
  const result = await db
    .select({ count: count() })
    .from(documents)
    .where(eq(documents.userId, userId))
  return result[0].count < 5
}

router.get('/api/documents', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const docs = await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(documents.createdAt)
  res.json({ documents: docs })
})

router.post('/api/documents/upload', requireOnboarding, upload.single('file'), async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const file = req.file as Express.Multer.File | undefined

  if (!file) {
    res.status(400).json({ code: 'NO_FILE', message: 'No file provided' })
    return
  }

  const canUpload = await checkFreeLimit(userId)
  if (!canUpload) {
    res.status(403).json({ code: 'FREE_LIMIT', message: 'Free plan limited to 5 documents. Upgrade to Pro for unlimited storage.' })
    return
  }

  const fileType = getFileType(file.mimetype)
  if (fileType === 'unknown') {
    res.status(400).json({ code: 'INVALID_TYPE', message: 'Invalid file type. Allowed: PDF, JPG, PNG, DOCX' })
    return
  }

  const docId = crypto.randomUUID()
  const ext = file.originalname.split('.').pop() ?? fileType
  const r2Key = `documents/${userId}/${docId}.${ext}`

  const r2Result = await uploadFile(file.buffer, r2Key, file.mimetype)
  if (!r2Result) {
    res.status(500).json({ code: 'UPLOAD_FAILED', message: 'Failed to upload file' })
    return
  }

  const { category, notes } = req.body

  await db.insert(documents).values({
    id: docId,
    userId,
    filename: file.originalname,
    r2Key,
    fileSize: file.size,
    fileType: ext,
    category: category ?? 'other',
    notes: notes ?? null,
    linkedDisputeId: null,
  })

  const doc = await db.select().from(documents).where(sql`${documents.id} = ${docId}`).limit(1)
  res.json({ document: doc[0] })
})

router.get('/api/documents/:id/download', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const doc = await db.select().from(documents).where(sql`${documents.id} = ${req.params.id}`).limit(1)

  if (!doc[0] || doc[0].userId !== userId) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Document not found' })
    return
  }

  const url = await getFileUrl(doc[0].r2Key)
  if (!url) {
    res.status(500).json({ code: 'URL_FAILED', message: 'Failed to generate download URL' })
    return
  }

  res.redirect(url)
})

router.put('/api/documents/:id', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const { category, notes, linkedDisputeId } = req.body

  const existing = await db.select().from(documents).where(sql`${documents.id} = ${req.params.id}`).limit(1)
  if (!existing[0] || existing[0].userId !== userId) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Document not found' })
    return
  }

  const updates: Record<string, unknown> = {}
  if (category !== undefined) updates.category = category
  if (notes !== undefined) updates.notes = notes
  if (linkedDisputeId !== undefined) updates.linkedDisputeId = linkedDisputeId

  if (Object.keys(updates).length > 0) {
    await db.update(documents).set(updates).where(sql`${documents.id} = ${req.params.id}`)
  }

  res.json({ success: true })
})

router.delete('/api/documents/:id', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const doc = await db.select().from(documents).where(sql`${documents.id} = ${req.params.id}`).limit(1)

  if (!doc[0] || doc[0].userId !== userId) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Document not found' })
    return
  }

  await deleteFile(doc[0].r2Key)
  await db.delete(documents).where(sql`${documents.id} = ${req.params.id}`)

  res.json({ success: true })
})

export default router
