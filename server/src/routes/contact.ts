import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { resend, env } from '../env'

const router = Router()

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
})

router.post('/api/contact', async (req: Request, res: Response) => {
  const parsed = contactSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 'VALIDATION_ERROR', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const { name, email, message } = parsed.data

  if (!resend) {
    console.log(`[Contact] SKIPPED — resend not configured. Message from ${name} <${email}>: ${message.slice(0, 200)}`)
    res.json({ success: true })
    return
  }

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: env.EMAIL_FROM,
      replyTo: email,
      subject: `Contact form: message from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
    })
    console.log(`[Contact] SENT — from ${name} <${email}>`)
    res.json({ success: true })
  } catch (err) {
    console.log(`[Contact] FAILED —`, err)
    res.status(500).json({ code: 'SEND_FAILED', message: 'Failed to send message. Please try again later.' })
  }
})

export default router