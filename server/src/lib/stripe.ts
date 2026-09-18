import { stripe, env } from '../env'

export function createCheckoutSession(customerId: string | null, priceId: string, userId: string) {
  if (!stripe) return null
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId ?? undefined,
    client_reference_id: userId,
    metadata: { userId },
    success_url: `${env.APP_URL}/settings/billing?checkout=success`,
    cancel_url: `${env.APP_URL}/pricing`,
  })
}

export async function verifyCheckoutSession(sessionId: string, userId: string) {
  if (!stripe) return null
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.metadata?.userId !== userId) return null
  return session
}

export function createPortalSession(customerId: string) {
  if (!stripe) return null
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.APP_URL}/settings/billing`,
  })
}

export async function getSubscriptionStatus(customerId: string) {
  if (!stripe) return null
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: 'all',
  })
  if (subscriptions.data.length === 0) return null
  const sub = subscriptions.data[0]
  return {
    status: sub.status,
    plan: sub.items.data[0]?.price.id ?? null,
    currentPeriodEnd: (sub as unknown as { current_period_end: number }).current_period_end,
  }
}