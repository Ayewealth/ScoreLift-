# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript + Express + Drizzle ORM + PostgreSQL + Better Auth + Resend + Cloudflare R2 + Stripe + Tailwind CSS + shadcn/ui (Radix) + Lucide React + TanStack Query. Package manager: pnpm. Local dev: Docker Compose (Postgres only). Deploy: Railway (Nixpacks, no Dockerfile).

## Users

US adults with fair-to-good credit who want to understand, track, and systematically improve their credit score — without connecting a bank account or credit bureau.

## Product Purpose

ScoreLift is a subscription-based SaaS platform that helps users build better credit through a self-reported profile, a deterministic scoring engine, a personalised roadmap, a score simulator, monthly check-ins, dispute letter generation, and goal tracking — no AI, no financial data providers.

## Positioning

The only credit-improvement platform where all credit data is self-reported by the user. No bank connections, no bureau API integrations, no Plaid — deliberate and permanent. The scoring engine is deterministic, rule-based TypeScript; every action a user takes is grounded in transparent, explainable logic.

## Operating Context

Single-domain deployment at `scorelift.credit`. Public marketing site and private dashboard live under the same Express + Vite process, differentiated by route and auth state. Users sign up with email/password only, verify email, complete a credit profile builder during onboarding, then access the app dashboard. Stripe subscriptions (Free / Pro $9.99/mo / Annual Pro $89/yr) gate Pro-only features at the API level. All file storage backed by Cloudflare R2 with short-lived signed URLs. Emails sent via Resend.

## Capabilities and Constraints

**Confirmed:**
- Free credit calculators (no account required): Utilisation Ratio, Payment Impact Estimator, Score Band Estimator, FIRE Readiness Checker, Mortgage Readiness Estimator
- Credit profile builder (score band, per-card utilisation, accounts, age, inquiries, derogatory marks, credit mix, missed payments)
- Deterministic scoring engine (baseline 680, 5 FICO-weighted factors, pure function)
- Personalised roadmap with estimated score impacts, effort levels, time horizons
- Score simulator with real-time recalculation, preset scenarios, side-by-side view, SVG impact timeline
- Monthly check-in system with streak counter and score history timeline
- Goal tracker with progress ring and product readiness checker (secondary goal Annual-Pro-only)
- Dispute letter generator (template-based, no AI) with R2 PDF storage
- Document vault (R2-backed, free: 5 docs, Pro: unlimited)
- Education centre (5 tracks, lesson quizzes, badges)
- Milestones/achievements with celebratory emails
- Settings: profile, billing (Stripe Customer Portal), notifications, data export, account deletion (30-day grace)

**Permanent constraints:**
- No AI/LLM calls of any kind — all intelligence is deterministic, rule-based
- No third-party financial data providers — no Plaid, no credit bureau APIs, no bank connections
- All credit data is self-reported by the user
- No additional paid third-party services beyond the approved stack
- No subdomain split — everything on `scorelift.credit/*`
- Brand colour palette not yet chosen — build with CSS-variable-based theme tokens

## Brand Commitments

Name: ScoreLift. Tagline: "Build Better Credit". No visual identity, logo, or colour palette chosen yet — all styling uses theme tokens, not hardcoded brand colours.

## Evidence on Hand

None — greenfield project. No testimonials, case studies, press, or existing assets to preserve.

## Product Principles

1. **Self-reported data is a feature, not a limitation.** The product replaces opaque bureau math with transparent, explainable, deterministic scoring. Never compromise this by adding Plaid, bank sync, or bureau integrations.
2. **Acquisition before retention.** The public marketing site (calculators, blog, SEO) is built and shippable before private-app features beyond the auth gate are built.
3. **Server is the source of truth.** Auth gating, feature gating, and data access are enforced server-side first; client-side UI gating is a UX courtesy, never the only defence.
4. **TanStack Query for all server state.** No ad-hoc `useEffect` + `fetch`. Every read is a query, every write is a mutation, and structured query keys drive cache invalidation.
5. **Theme-token-based styling.** No hardcoded colours in components; brand palette drops in later via CSS custom properties without touching component code.

## Accessibility & Inclusion

WCAG 2.1 AA minimum: colour contrast >= 4.5:1 for body text, keyboard-accessible interactions, labelled form inputs, `aria-live` error regions. Mobile-first layout at 375px, 768px, 1280px.