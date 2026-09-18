import 'dotenv/config'
import { Resend } from 'resend'
import Stripe from 'stripe'
import { S3Client } from '@aws-sdk/client-s3'

function required(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: Number(optional('PORT', '3000')),
  APP_URL: optional('APP_URL', 'http://localhost:3000'),

  DATABASE_URL: required('DATABASE_URL'),

  BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
  BETTER_AUTH_URL: optional('BETTER_AUTH_URL', 'http://localhost:3000'),

  RESEND_API_KEY: optional('RESEND_API_KEY', 're_placeholder'),
  EMAIL_FROM: optional('EMAIL_FROM', 'ScoreLift <noreply@scorelift.credit>'),

  STRIPE_SECRET_KEY: optional('STRIPE_SECRET_KEY', 'sk_live_placeholder'),
  STRIPE_WEBHOOK_SECRET: optional('STRIPE_WEBHOOK_SECRET', 'whsec_placeholder'),
  STRIPE_PRO_MONTHLY_PRICE_ID: optional('STRIPE_PRO_MONTHLY_PRICE_ID', 'price_placeholder_monthly'),
  STRIPE_PRO_ANNUAL_PRICE_ID: optional('STRIPE_PRO_ANNUAL_PRICE_ID', 'price_placeholder_annual'),
  STRIPE_PUBLISHABLE_KEY: optional('STRIPE_PUBLISHABLE_KEY', 'pk_live_placeholder'),

  R2_ACCOUNT_ID: optional('R2_ACCOUNT_ID', ''),
  R2_ACCESS_KEY_ID: optional('R2_ACCESS_KEY_ID', ''),
  R2_SECRET_ACCESS_KEY: optional('R2_SECRET_ACCESS_KEY', ''),
  R2_BUCKET_NAME: optional('R2_BUCKET_NAME', 'scorelift-files'),
} as const

export let resend: Resend | null = null
if (env.RESEND_API_KEY !== 're_placeholder') {
  resend = new Resend(env.RESEND_API_KEY)
  console.log(`[Resend] Initialized — sending from ${env.EMAIL_FROM}`)
} else {
  console.log(`[Resend] DISABLED — RESEND_API_KEY is placeholder or missing`)
}

export let stripe: Stripe | null = null
if (env.STRIPE_SECRET_KEY !== 'sk_live_placeholder') {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' })
  console.log(`[Stripe] Initialized`)
} else {
  console.log(`[Stripe] DISABLED — STRIPE_SECRET_KEY is placeholder or missing`)
}

export let r2: S3Client | null = null
if (env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY) {
  r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  })
  console.log(`[R2] Initialized — bucket: ${env.R2_BUCKET_NAME}`)
} else {
  console.log(`[R2] DISABLED — R2 credentials are missing`)
}