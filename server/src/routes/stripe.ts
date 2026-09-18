import { Router, type Request, type Response } from 'express'
import { auth } from '../auth'
import { env, stripe } from '../env'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { user } from '@shared/schema'
import { eq } from 'drizzle-orm'
import { createCheckoutSession, createPortalSession, getSubscriptionStatus } from '../lib/stripe'
import { sendPaymentFailedEmail } from '../lib/email'

function headersToInit(headers: Request['headers']): HeadersInit {
  const init: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') init[key] = value
  }
  return init
}

const router = Router()

router.post('/api/stripe/checkout', requireAuth, async (req: Request, res: Response) => {
  const session = await auth.api.getSession({ headers: headersToInit(req.headers) })
  if (!session) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    return
  }

  const { priceId } = req.body
  if (!priceId) {
    res.status(400).json({ code: 'MISSING_PRICE_ID', message: 'priceId is required' })
    return
  }

  if (!stripe) {
    res.status(503).json({ code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe is not configured' })
    return
  }

  const userRecord = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!userRecord[0]) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'User not found' })
    return
  }

  const checkoutSession = await createCheckoutSession(
    userRecord[0].stripeCustomerId ?? null,
    priceId,
    session.user.id,
  )

  if (!checkoutSession) {
    res.status(500).json({ code: 'STRIPE_ERROR', message: 'Failed to create checkout session' })
    return
  }

  res.json({ url: checkoutSession.url })
})

router.post('/api/stripe/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string | undefined
  if (!sig || !stripe) {
    res.status(400).send('Missing stripe-signature header')
    return
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    res.status(400).send('Invalid signature')
    return
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const checkoutSession = event.data.object
      const userId = checkoutSession.metadata?.userId ?? checkoutSession.client_reference_id
      if (!userId) {
        res.json({ received: true })
        return
      }

      await db.update(user)
        .set({
          stripeCustomerId: checkoutSession.customer as string,
          subscriptionStatus: 'active',
          subscriptionPlan: checkoutSession.mode === 'subscription' ? 'pro_monthly' : null,
        })
        .where(eq(user.id, userId))

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer as string
      await db.update(user)
        .set({ subscriptionStatus: 'free', subscriptionPlan: null })
        .where(eq(user.stripeCustomerId, customerId))
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer as string
      const userRecord = await db.select().from(user).where(eq(user.stripeCustomerId, customerId)).limit(1)
      if (userRecord[0]) {
        await sendPaymentFailedEmail(userRecord[0].email, `${env.APP_URL}/settings/billing`)
        await db.update(user)
          .set({ subscriptionStatus: 'past_due' })
          .where(eq(user.stripeCustomerId, customerId))
      }
      break
    }
  }

  res.json({ received: true })
})

router.get('/api/stripe/portal', requireAuth, async (req: Request, res: Response) => {
  const session = await auth.api.getSession({ headers: headersToInit(req.headers) })
  if (!session) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    return
  }

  const userRecord = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!userRecord[0]?.stripeCustomerId || !stripe) {
    res.status(400).json({ code: 'NO_SUBSCRIPTION', message: 'No active subscription' })
    return
  }

  const portalSession = await createPortalSession(userRecord[0].stripeCustomerId)
  if (!portalSession) {
    res.status(500).json({ code: 'STRIPE_ERROR', message: 'Failed to create portal session' })
    return
  }

  res.json({ url: portalSession.url })
})

router.get('/api/stripe/prices', (_req: Request, res: Response) => {
  res.json({
    proMonthly: env.STRIPE_PRO_MONTHLY_PRICE_ID,
    proAnnual: env.STRIPE_PRO_ANNUAL_PRICE_ID,
  })
})

router.get('/api/stripe/status', requireAuth, async (req: Request, res: Response) => {
  const session = await auth.api.getSession({ headers: headersToInit(req.headers) })
  if (!session) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    return
  }

  const userRecord = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!userRecord[0]) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'User not found' })
    return
  }

  let directStatus = null
  if (userRecord[0].stripeCustomerId && stripe) {
    directStatus = await getSubscriptionStatus(userRecord[0].stripeCustomerId)
  }

  res.json({
    local: {
      status: userRecord[0].subscriptionStatus,
      plan: userRecord[0].subscriptionPlan,
    },
    direct: directStatus,
  })
})

router.get('/api/stripe/invoices', requireAuth, async (req: Request, res: Response) => {
  const session = await auth.api.getSession({ headers: headersToInit(req.headers) })
  if (!session) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    return
  }

  const userRecord = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!userRecord[0]?.stripeCustomerId || !stripe) {
    res.json([])
    return
  }

  const invoices = await stripe.invoices.list({
    customer: userRecord[0].stripeCustomerId,
    limit: 12,
  })

  res.json(invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
    status: inv.status,
    created: inv.created,
    pdfUrl: inv.invoice_pdf,
    paid: inv.paid,
  })))
})

export default router