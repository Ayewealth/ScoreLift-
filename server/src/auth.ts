import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin as adminPlugin } from 'better-auth/plugins/admin'
import { db } from './db/client'
import { env } from './env'
import { user, session, account, verification } from '@shared/schema'
import { resend } from './env'
import { renderEmail } from './emails/render-email'
import { VerificationEmail } from './emails/VerificationEmail'
import { PasswordResetEmail } from './emails/PasswordResetEmail'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  basePath: '/api/auth',
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: 'pg', schema: { user, session, account, verification } }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPasswordEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      if (!resend) {
        console.log(`[Auth] Password reset: SKIPPED — resend not configured for ${user.email}`)
        return
      }
      console.log(`[Auth] Password reset: SENDING to ${user.email}`)
      try {
        const html = await renderEmail(PasswordResetEmail, { resetUrl: url })
        const result = await resend.emails.send({
          from: env.EMAIL_FROM,
          to: user.email,
          subject: 'Reset your ScoreLift password',
          html,
        })
        console.log(`[Auth] Password reset: SENT to ${user.email} (id: ${result.data?.id ?? 'unknown'})`)
      } catch (err) {
        console.log(`[Auth] Password reset: FAILED for ${user.email} —`, err)
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      if (!resend) {
        console.log(`[Auth] Verification email: SKIPPED — resend not configured for ${user.email}`)
        return
      }
      console.log(`[Auth] Verification email: SENDING to ${user.email}`)
      try {
        const html = await renderEmail(VerificationEmail, { verificationUrl: url })
        const result = await resend.emails.send({
          from: env.EMAIL_FROM,
          to: user.email,
          subject: 'Verify your ScoreLift account',
          html,
        })
        console.log(`[Auth] Verification email: SENT to ${user.email} (id: ${result.data?.id ?? 'unknown'})`)
      } catch (err) {
        console.log(`[Auth] Verification email: FAILED for ${user.email} —`, err)
      }
    },
  },
  user: {
    additionalFields: {
      onboardingComplete: {
        type: 'boolean',
        required: true,
        defaultValue: false,
        input: false,
      },
      stripeCustomerId: {
        type: 'string',
        required: false,
      },
      subscriptionStatus: {
        type: 'string',
        required: true,
        defaultValue: 'free',
        input: false,
      },
      subscriptionPlan: {
        type: 'string',
        required: false,
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
    customRules: {
      '/api/auth/forgot-password': { window: 300, max: 3 },
      '/api/auth/resend-verification-email': { window: 120, max: 5 },
    },
  },
  plugins: [
    adminPlugin({
      defaultRole: 'user',
      defaultPermissions: [],
    }),
  ],
})