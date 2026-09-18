import { describe, it, expect, vi } from 'vitest'

vi.mock('../env', () => ({
  env: {
    DATABASE_URL: 'postgres://localhost:5432/test',
    BETTER_AUTH_SECRET: 'test-secret',
    BETTER_AUTH_URL: 'http://localhost:3000',
    RESEND_API_KEY: 're_placeholder',
    EMAIL_FROM: 'test@test.com',
    STRIPE_SECRET_KEY: 'sk_live_placeholder',
    STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
    STRIPE_PRO_MONTHLY_PRICE_ID: 'price_monthly',
    STRIPE_PRO_ANNUAL_PRICE_ID: 'price_annual',
    STRIPE_PUBLISHABLE_KEY: 'pk_live_placeholder',
    NODE_ENV: 'test',
    PORT: 3000,
    APP_URL: 'http://localhost:3000',
    resend: null,
    stripe: null,
  },
}))

vi.mock('../db/client', () => ({
  db: {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) })),
  },
}))

vi.mock('../auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}))

describe('Server middleware', () => {
  it('imports without error', async () => {
    const mod = await import('./middleware/auth')
    expect(mod.requireAuth).toBeDefined()
    expect(mod.requireVerified).toBeDefined()
    expect(mod.requireOnboarding).toBeDefined()
  })
})

describe('Stripe routes', () => {
  it('imports without error', async () => {
    const mod = await import('./routes/stripe')
    expect(mod.default).toBeDefined()
  })
})

describe('Email lib', () => {
  it('imports without error', async () => {
    const mod = await import('./lib/email')
    expect(mod.sendWelcomeEmail).toBeDefined()
    expect(mod.sendPaymentFailedEmail).toBeDefined()
  })
})