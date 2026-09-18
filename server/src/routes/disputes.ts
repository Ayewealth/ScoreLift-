import { Router, type Request, type Response } from 'express'
import { requireOnboarding } from '../middleware/auth'
import { db } from '../db/client'
import { disputeLetters } from '@shared/schema'
import { eq, desc, sql } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth'
import { uploadFile, getFileUrl } from '../lib/r2'
import { generateDisputeLetterPdf } from '../lib/pdf'
import { DISPUTE_TEMPLATES, getBureauAddress } from '../lib/dispute-templates'
import { Router as RouterType } from 'express'

const router = Router()

const checkPro = requireOnboarding

router.get('/api/disputes/templates', (_req: Request, res: Response) => {
  res.json({ templates: DISPUTE_TEMPLATES })
})

router.get('/api/disputes/bureau-addresses', (_req: Request, res: Response) => {
  res.json({
    bureaus: [
      { id: 'equifax', name: 'Equifax', address: getBureauAddress('equifax') },
      { id: 'experian', name: 'Experian', address: getBureauAddress('experian') },
      { id: 'transunion', name: 'TransUnion', address: getBureauAddress('transunion') },
    ],
  })
})

router.get('/api/disputes', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const letters = await db
    .select()
    .from(disputeLetters)
    .where(eq(disputeLetters.userId, userId))
    .orderBy(desc(disputeLetters.createdAt))

  res.json({ disputes: letters })
})

router.post('/api/disputes/generate', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const body = req.body as {
    templateId: string
    formData: Record<string, string>
    userName: string
    userAddress: string
    bureauId?: string
  }

  const template = DISPUTE_TEMPLATES.find(t => t.id === body.templateId)
  if (!template) {
    res.status(400).json({ code: 'INVALID_TEMPLATE', message: 'Invalid template ID' })
    return
  }

  const bureauName = body.bureauId
    ? ({ equifax: 'Equifax', experian: 'Experian', transunion: 'TransUnion' } as Record<string, string>)[body.bureauId] ?? 'Credit Bureau'
    : 'Credit Bureau'

  const bureauAddress = body.bureauId ? getBureauAddress(body.bureauId) : ''

  let renderedHtml = template.bodyTemplate
  for (const [key, value] of Object.entries(body.formData)) {
    renderedHtml = renderedHtml.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }

  const subject = `Dispute: ${template.title}`

  const pdfBuffer = await generateDisputeLetterPdf(
    body.userName,
    body.userAddress,
    bureauName,
    bureauAddress,
    subject,
    renderedHtml,
  )

  const disputeId = crypto.randomUUID()
  const r2Key = `disputes/${userId}/${disputeId}.pdf`

  const uploadResult = await uploadFile(pdfBuffer, r2Key, 'application/pdf')
  if (!uploadResult) {
    res.status(500).json({ code: 'PDF_UPLOAD_FAILED', message: 'Failed to upload generated PDF' })
    return
  }

  await db.insert(disputeLetters).values({
    id: disputeId,
    userId,
    templateId: body.templateId,
    formData: body.formData,
    renderedHtml,
    r2Key,
    status: 'draft',
    bureauName,
  })

  const letter = await db.select().from(disputeLetters).where(eq(disputeLetters.id, disputeId)).limit(1)

  res.json({ dispute: letter[0] })
})

router.get('/api/disputes/:id/download', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!

  const letter = await db
    .select()
    .from(disputeLetters)
    .where(sql`${disputeLetters.id} = ${req.params.id}`)
    .limit(1)

  if (!letter[0] || letter[0].userId !== userId) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Dispute letter not found' })
    return
  }

  if (!letter[0].r2Key) {
    res.status(400).json({ code: 'NO_FILE', message: 'No PDF file available for this letter' })
    return
  }

  const url = await getFileUrl(letter[0].r2Key)
  if (!url) {
    res.status(500).json({ code: 'URL_FAILED', message: 'Failed to generate download URL' })
    return
  }

  res.redirect(url)
})

router.put('/api/disputes/:id/status', requireOnboarding, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!
  const { status } = req.body

  const validStatuses = ['draft', 'sent', 'response_received', 'resolved']
  if (!validStatuses.includes(status)) {
    res.status(400).json({ code: 'INVALID_STATUS', message: 'Invalid status. Must be one of: draft, sent, response_received, resolved' })
    return
  }

  const existing = await db
    .select()
    .from(disputeLetters)
    .where(sql`${disputeLetters.id} = ${req.params.id}`)
    .limit(1)

  if (!existing[0] || existing[0].userId !== userId) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Dispute letter not found' })
    return
  }

  await db.update(disputeLetters).set({ status }).where(sql`${disputeLetters.id} = ${req.params.id}`)

  res.json({ success: true })
})

export default router
