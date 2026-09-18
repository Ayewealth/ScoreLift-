# SCORELIFT — PROJECT_CONTEXT.md

> Single source of truth for any AI agent or developer working on this project. Read this file in full before writing any code. Do not deviate from these rules.
>
> **This file is aligned with the ScoreLift Development Plan (v1.0).** Where this file adds conventions beyond that plan (TanStack Query, the detailed Stripe status-refresh behavior, the public-site-first phase ordering, the mandatory email-verification gate), it says so explicitly.

---

## 0. What This Is

**ScoreLift** is a subscription-based SaaS platform that helps US consumers understand, track, and systematically improve their credit score. The platform consists of a public-facing marketing and content site at `scorelift.credit` and a fully-featured private application at `scorelift.credit/dashboard`, reached after authentication. **Everything lives on a single domain — no subdomain split, no second deployment.** Both experiences are served by the same Express + Vite process, differentiated by route and auth state.

**Target audience:** US adults with fair-to-good credit who want a clear, prioritized, self-serve plan to improve their score — without connecting a bank account or credit bureau.

**Core value proposition — the product is built around five user needs:**

1. Understanding what is currently hurting their score.
2. Getting a clear, prioritized action plan (the Roadmap).
3. Simulating the impact of changes before making them (the Simulator).
4. Tracking improvement month over month (Monthly Check-In).
5. Having tools to take direct action — dispute letters, document vault, goal planning — without leaving the platform.

**Revenue model:** Stripe subscriptions, three tiers — Free, Pro, Annual Pro (Section 5).

**Trust differentiator (do not compromise on this):** ScoreLift never connects to a bank account or credit bureau. **All credit data is self-reported by the user.** This is a deliberate, load-bearing product decision — not a v1 limitation to "fix" later. It should be stated explicitly on `/security` and in the FAQ, and never quietly contradicted by adding a Plaid-style integration.

**Goals for this build:**

1. A polished, trustworthy public site that converts visitors into free-tier sign-ups, with strong on-page SEO for high-intent credit-repair search terms.
2. A private app that feels data-dense but immediately scannable — every key metric visible above the fold, no wasted setup steps between login and value.
3. Stripe-powered subscription billing across three tiers with clean self-serve upgrade/downgrade/cancel via the Customer Portal.
4. A codebase that is clean, documented, and easy for a single developer to maintain and extend after handover.

**Explicitly out of scope — permanent product constraints, not v1 gaps:**

- **No AI APIs.** No calls to OpenAI, Anthropic, or any LLM provider, anywhere in the product. All intelligence — score estimation, roadmap generation, dispute letter drafting — is deterministic, rule-based logic that lives in the server codebase.
- **No third-party financial data providers.** No Plaid, no credit bureau APIs, no bank connections of any kind. All credit data is self-reported.
- **No additional paid third-party services** beyond the approved stack in Section 1.

Do not scaffold placeholder UI for bank sync, bureau integration, or AI features "for later" — these are not on the roadmap at all.

---

## 1. Technology Stack (Fixed — Do Not Deviate)

The stack below is the only approved technology for this project. No additional services beyond those listed are permitted.

| Layer                        | Technology                       | Notes                                                                                                                                                                               |
| ---------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                     | Vite + React + TypeScript        | In `client/src/`                                                                                                                                                                    |
| Server state / data fetching | **TanStack Query (react-query)** | _Added convention, not in the source plan._ All client-side server-state — API calls, caching, invalidation, background refetch — goes through it. No ad-hoc `useEffect` + `fetch`. |
| Backend                      | Express + TypeScript             | In `server/src/`, API routes under `/api`                                                                                                                                           |
| Shared types / validation    | Drizzle ORM + drizzle-zod        | `shared/schema.ts` — single source of truth for both server validation and client types                                                                                             |
| Database                     | PostgreSQL                       | Railway-provisioned Postgres service                                                                                                                                                |
| Auth                         | Better Auth (email/password)     | Mounted at `/api/auth/*`; no OAuth providers required                                                                                                                               |
| Email                        | Resend                           | Transactional + digest emails                                                                                                                                                       |
| Object Storage               | Cloudflare R2                    | Generated dispute letter PDFs + user-uploaded documents                                                                                                                             |
| Payments                     | Stripe                           | Subscriptions, webhooks, Customer Portal                                                                                                                                            |
| Styling                      | Tailwind CSS + shadcn/ui (Radix) | Import components as needed, don't install the whole library                                                                                                                        |
| Icons                        | Lucide React                     |                                                                                                                                                                                     |
| Charts                       | SVG line chart, hand-rolled      | Used for the Simulator's impact timeline (Section 9.5) — **no charting library dependency**                                                                                         |
| Local dev infra              | Docker Compose                   | Postgres only — no app container. The server always runs on the host via `pnpm dev`                                                                                                 |
| Package manager              | **pnpm**                         | Single lockfile at repo root                                                                                                                                                        |
| Deploy                       | **Railway (Nixpacks)**           | Root build + start scripts; **no Dockerfile**                                                                                                                                       |

### Architecture pattern

Single-repo, single Express process. In development, Vite runs as Express middleware (`middlewareMode: true`) — no separate port, no proxy, HMR works. In production, Express serves the built client from `dist/client/` with a SPA fallback. All API routes live under `/api`; auth routes live at `/api/auth/*`.

- `server/src/index.ts` branches on `NODE_ENV`: production calls `serveStatic(app)`, development dynamically imports `./vite` and calls `setupVite(httpServer, app)`.
- `server/src/vite.ts` exports `setupVite(httpServer, app)` — creates the Vite dev server in middleware mode, mounts `vite.middlewares`, and adds a catch-all that transforms and serves `index.html`.
- `server/src/static.ts` exports `serveStatic(app)` — `express.static` on `dist/client/` plus a catch-all for `index.html`.
- One `tsconfig.json` at the root covers `client/src/`, `server/src/`, and `shared/`, with the path alias `@shared/* → ./shared/*`.
- `vite.config.ts` at the root uses `@vitejs/plugin-react`, the `@shared` alias, and `outDir: dist/client`. No proxy config.
- Root build script runs `vite build` only. The start script runs `tsx server/src/index.ts` — there is no separate server build step.

---

## 2. Repository Conventions (Non-Negotiable)

This is a **single repo, not a monorepo**. Strictly follow this layout:

```
scorelift/
├── client/
│   └── src/
│       ├── main.tsx                    # Vite entry point
│       ├── App.tsx                     # Router, auth provider
│       ├── components/                 # Shared UI components
│       ├── pages/
│       │   ├── public/                 # Marketing site pages
│       │   └── app/                    # Private app pages (auth-gated)
│       ├── hooks/                      # Custom React hooks (TanStack Query)
│       └── lib/                        # Auth client, Stripe helpers, utils
├── server/
│   └── src/
│       ├── index.ts                    # Entry point; branches dev/prod, creates httpServer
│       ├── vite.ts                     # Dev: Vite middleware setup
│       ├── static.ts                   # Prod: static file serving + SPA fallback
│       ├── auth.ts                     # Better Auth config
│       ├── env.ts                      # Typed env with required()/optional() helpers
│       ├── db/
│       │   └── client.ts               # Drizzle client (postgres-js)
│       ├── lib/
│       │   └── scoringEngine.ts        # The core scoring/roadmap engine (Section 11) — pure function
│       └── routes/
│           ├── auth.ts
│           ├── profile.ts
│           ├── roadmap.ts
│           ├── checkin.ts
│           ├── simulator.ts
│           ├── goals.ts
│           ├── disputes.ts
│           ├── documents.ts
│           ├── education.ts
│           ├── milestones.ts
│           └── stripe.ts               # checkout, portal, webhook
├── shared/
│   └── schema.ts                       # Drizzle tables + Zod insert schemas + inferred types
├── index.html                          # Vite entry (script src → /client/src/main.tsx)
├── vite.config.ts
├── tsconfig.json                       # Single config covering client/src, server/src, shared
├── drizzle.config.ts                   # Points at shared/schema.ts
├── docker-compose.yml                  # Local dev only — Postgres on localhost:5432
├── .env.example                        # ALL env vars documented here
└── package.json                        # build: vite build | start: tsx server/src/index.ts
```

### Routing convention

- **Public routes** (no auth required): `/`, `/how-it-works`, `/features`, `/pricing`, `/calculators`, `/calculators/:slug`, `/blog`, `/blog/:slug`, `/about`, `/contact`, `/privacy`, `/terms`, `/login`, `/signup`, `/forgot-password`, `/reset-password`.
- **Auth-required, pre-onboarding route** (session required, but rendered outside both `PublicLayout` and the app shell — its own standalone layout): `/verify-email`.
- **Auth-required, onboarding-gated route** (session required and email verified, rendered in its own standalone layout — **not** the app shell): `/onboarding`.
- **App routes** (session required, email verified, **and** onboarding complete, rendered inside the app shell with persistent left-side nav on desktop / bottom tab bar on mobile): `/dashboard`, `/roadmap`, `/simulator`, `/goals`, `/checkin`, `/disputes`, `/documents`, `/education`, `/milestones`, `/settings`, `/settings/billing`.
- A single top-level layout component checks the Better Auth session and the user's `emailVerified` / `onboardingComplete` state on every route change, and enforces the following redirect chain in order — **the same process every time, no exceptions:**
  1. No session → redirect to `/login?redirect=...` for any `/onboarding`, `/verify-email`, or app route.
  2. Session exists but `emailVerified` is `false` → redirect to `/verify-email` for any `/onboarding` or app route. **A user can never reach `/onboarding` or `/dashboard` straight after signing up — verification is mandatory and comes first, every time.**
  3. Session exists, email verified, but `onboardingComplete` is `false` → redirect to `/onboarding` for any app route. A user who hasn't finished the Credit Profile Builder must never be able to reach `/dashboard` — enforced both client-side (route guard) and server-side (API middleware), so a direct API call or a stale client can't bypass it either.
  4. Session exists and both flags are `true`, but the user hits `/login`, `/signup`, `/verify-email`, or `/onboarding` → redirect straight to `/dashboard`.
- All app-route and `/onboarding` API endpoints verify the session **and** these two flags server-side as well — unauthenticated or gate-incomplete API calls return `401`/`403`. Never expose user data without a valid, fully-gated session check.
- Express serves `index.html` for all non-`/api` routes (SPA fallback), so all routes are deep-linkable.

---

## 3. Code Standards (Strict)

### TypeScript

- **NEVER use `any`.**
- **NEVER use `undefined` as a type** — model absence explicitly (`null`, optional fields, discriminated unions).
- **Always define an explicit `type` or `interface`** for function inputs/outputs, component props, and API responses.
- Strict mode on in `tsconfig.json`.

### Validation & shared types

- Define every database table in `shared/schema.ts` using Drizzle.
- For every table, generate the Zod insert schema with `createInsertSchema(table)` from `drizzle-zod`, and export both the Zod schema and the inferred TypeScript types (`z.infer<...>` for inserts, `$inferSelect` for rows).
- Server validates every request body with the Zod schema. Client imports the TypeScript types only.
- Run `pnpm db:push` to sync schema changes to the Railway Postgres instance after any schema change.

### The scoring engine (`server/src/lib/scoringEngine.ts`)

This is the heart of the product and is built **once**, as a pure, well-tested TypeScript module — no database calls, no external API calls, no AI calls of any kind. It is imported directly into the roadmap, simulator, and check-in route handlers, and its logic is what the free public calculators reimplement client-side for instant results (Section 8) — the two must never drift out of sync on the underlying scoring rules.

- **Inputs:** a user's credit profile — score band, per-card utilisation, total accounts, oldest account age, hard inquiries (12 months), derogatory marks, credit mix, missed payment count, missed payment recency.
- **Outputs:** (1) an estimated score, (2) a ranked list of roadmap actions with `estimated_impact_min` / `estimated_impact_max`, and (3) a factor-level health assessment for all five FICO-weighted factors.
- **Baseline & weighting:** starts from a baseline score of 680 and applies weighted adjustments per factor — Payment History (35%), Credit Utilisation (30%), Account Age (15%), Credit Mix (10%), New Inquiries (10%). See Section 11 for the full adjustment table.
- **Roadmap generation:** after scoring, the engine evaluates each factor and generates action items only where the profile is sub-optimal, sized by the delta between current and optimal state, sorted by `estimated_impact_max` descending.
- **Required unit tests:** a range of sample profiles covering each factor's boundary conditions (e.g. a profile with a recent missed payment, a profile with 75%+ utilisation, a profile with only one account type), verifying both the score output and the generated roadmap actions.

### Data fetching (TanStack Query — added convention)

- Every GET-style read of server state goes through a `useQuery` hook. Every create/update/delete goes through a `useMutation` hook.
- Domain-specific hooks live near the feature (e.g. `client/src/hooks/useRoadmap.ts`, `useCheckins.ts`, `useDocuments.ts`) and wrap the raw fetch call + Zod-typed response — components never call `fetch` directly.
- Query keys are structured arrays (e.g. `['roadmap', userId]`, `['checkins', userId]`), never ad-hoc strings.
- Mutations invalidate the relevant query keys on success rather than manually patching cache.

### Styling & accessibility

- **Tailwind CSS** for all styling; no custom CSS unless absolutely necessary.
- **shadcn/ui** components as the base, imported as needed rather than installing the entire library.
- **Never use native browser dialogs:** no `window.alert`, `window.confirm`, `window.prompt`.
- WCAG 2.1 AA minimum: color contrast ≥ 4.5:1 for body text, all interactive elements keyboard accessible, all form inputs have associated `<label>` elements, error messages announced via `aria-live` regions.
- No hardcoded colors in components — theme values are expressed as CSS custom properties / Tailwind theme tokens so a real brand palette can be dropped in later without touching component code. **A brand color palette has not been chosen yet** — build with theme tokens, not a specific hardcoded color scheme, for now.
- Mobile-first layout. All pages must render correctly at 375px, 768px, and 1280px viewport widths.

### Per-phase quality gate (do every phase, in order)

After completing each phase from Section 15:

1. **Write tests** for the new behavior (unit + integration where relevant).
2. **Run tests** — all must pass.
3. **Run lint fix** (`pnpm lint --fix` or equivalent).
4. **Run typecheck** (`pnpm tsc --noEmit` or equivalent) — must be clean.

A phase is not complete until all four steps pass.

---

## 4. Visual Design & UX

Visual design, layout, and component-level UI decisions are intentionally **not fully specified in this document** beyond the principles below — Sections 8 and 9 describe what each page is for and what it needs to contain, not how it should be arranged or styled.

- The public site must follow current high-conversion SaaS design standards: hero sections that answer "what does this do for me" in one headline, social proof placed directly below the hero (not buried in the footer), exactly one primary CTA per page, and no heavy third-party scripts or unnecessary tracking pixels.
- The private app must be **data-dense but immediately scannable** — every key metric on the dashboard visible above the fold without scrolling. Retention is won or lost here: reduce stimuli per screen, establish a strong visual hierarchy so the user's current score status is always the first thing they see, and make the next best action obvious.
- **A brand color palette has not been chosen yet** — build with theme tokens rather than hardcoded values so a real palette can be dropped in later without touching component code.

---

## 5. Pricing & Plans

| Plan       | Price    | Billing | Key Features                                                                                                                                                                             |
| ---------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Free       | $0/mo    | —       | Credit profile, basic factor dashboard, 1 simulator scenario, all public calculators, 5 document uploads                                                                                 |
| Pro        | $9.99/mo | Monthly | Full roadmap, unlimited simulator scenarios, monthly check-ins, goal tracker, dispute letter generator, unlimited documents, education centre, milestone emails, weekly digest           |
| Annual Pro | $89/yr   | Annual  | Everything in Pro + annual savings vs. monthly ($29.88 saved), displayed as **$7.42/mo equivalent** on the pricing page; a second/secondary credit goal is Annual-Pro-only (Section 9.7) |

- Exactly three plans. No feature is gated behind a fourth tier.
- No credit card required on the Free tier.
- Wire pricing through Stripe Price IDs (not hardcoded numbers) so they can change without a deploy.
- The pricing page must feature a visual "most popular" highlight on the Pro plan.

---

## 6. Stripe Billing — Required Behavior

Build Stripe subscriptions with normal webhook support, but also add an on-demand Stripe status check as a failsafe when webhooks are not set up. Webhooks should update the local subscription state when configured, but the app must still treat Stripe as the source of truth and refresh the user's subscription status directly from Stripe on app load/login, after checkout success, when opening billing/settings, and after returning from the Customer Portal. Cache direct Stripe checks locally for no longer than 15 minutes, and do not call Stripe on every request. Never mark a user as paid just because they reached the success page; verify the Checkout Session server-side and ensure it belongs to the logged-in user before storing customer/subscription IDs. Access should generally only be granted for active or trialing subscriptions, with Stripe API failures handled safely: fail closed unless there is a fresh valid cached status.

### Products & prices to create in the Stripe dashboard

| Product                 | Price    | Env var                       |
| ----------------------- | -------- | ----------------------------- |
| ScoreLift Pro (Monthly) | $9.99/mo | `STRIPE_PRO_MONTHLY_PRICE_ID` |
| ScoreLift Pro (Annual)  | $89/yr   | `STRIPE_PRO_ANNUAL_PRICE_ID`  |

### Checkout flow

- Use Stripe Checkout for the initial subscription purchase (`POST /api/stripe/checkout` creates a Checkout Session, returns the URL) rather than a custom card form — this minimizes PCI scope and development time.
- Client redirects to the Stripe-hosted checkout page.
- On return, the client-side subscription-status query (e.g. a TanStack Query key such as `['stripe', 'status', userId]`) is invalidated/refetched — the success query param alone never grants access; the server-side Checkout Session verification described above is what actually confirms the subscription.

### Webhook handler (`POST /api/stripe/webhook`)

- Raw body parsing required — do **not** use `express.json()` on this route.
- Always verify the `Stripe-Signature` header with `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent()` before processing any event.
- Events to handle:
  - `checkout.session.completed` → verify the session belongs to the logged-in user, then activate Pro (or Annual Pro, based on the price ID), storing `stripe_customer_id` and `subscription_status` on the user record.
  - `customer.subscription.deleted` → downgrade the user to Free.
  - `invoice.payment_failed` → send a warning email via Resend and set the appropriate `subscription_status`.

### Customer Portal

- `GET /api/stripe/portal` creates a Stripe Billing Portal session for the authenticated user and returns the URL. Linked from `/settings/billing`.
- Handles cancellation, plan changes, payment method updates, and invoice history — all inside Stripe's hosted portal.

### Access gating

- Feature gating is enforced on the **API route level** — all Pro-only features check `subscription_status === 'active'` (or a fresh valid cached direct-Stripe check, per the failsafe behavior above) server-side, never trusting a client-side check alone. Return an appropriate error with an upgrade prompt if the tier is insufficient.
- The client also gates UI elements for a cleaner experience, but this is never the only line of defense.

---

## 7. Auth & Onboarding

The full first-time flow is **always the same, no exceptions: sign up → verify email → onboarding → dashboard.** There is no path from signup straight into a signed-in dashboard session — every new account passes through `/verify-email` first. Each gate is enforced both client-side (route guards, Section 2) and server-side (API middleware) — a user cannot skip a step by manipulating the client or calling the API directly.

### Better Auth configuration (`server/src/auth.ts`)

- `basePath: "/api/auth"`.
- Drizzle adapter pointing at `shared/schema.ts`. Better Auth creates its own tables automatically on first request — run `npx better-auth generate` and add the output to `shared/schema.ts` before `pnpm db:push`.
- Provider: email/password only for v1. No OAuth providers required.
- **Email verification required** — `emailVerification: { sendOnSignUp: true, autoSignInAfterVerification: false }` (or equivalent), with Resend wired as the sending mechanism via Better Auth's `sendVerificationEmail` hook.
- Session: cookie-based, stored in the database via the Drizzle adapter.
- Rate limiting on `/api/auth/*` (Better Auth built-in). Rate-limit the "resend verification link" and "forgot password" actions specifically to prevent email-bombing.
- Extend the Better Auth user model with one additional field: **`onboardingComplete: boolean`** (default `false`). This, together with Better Auth's own `emailVerified` column, is the pair of flags the route guards (Section 2) and API middleware check on every request to decide whether a user may reach `/dashboard`.

### 7.1 Sign-up (`/signup`)

- Single short form: **email, password only.** No credit card required on the Free tier. Ask nothing else up front — profile detail happens in onboarding, not on the signup page itself.
- On submit: creates the account via Better Auth (`emailVerified: false`, `onboardingComplete: false` by default) and triggers the verification email via Resend.
- Redirects to `/verify-email` after successful registration — **never** straight to onboarding or the dashboard, since the user isn't verified yet.

### 7.2 Email verification (`/verify-email`)

A standalone screen (its own layout, not the public layout or the app shell) shown to a signed-in-but-unverified user. It supports:

- **"I have verified" button** — re-checks the current session's `emailVerified` status server-side (`GET /api/auth/session` or equivalent refetch) rather than trusting client state. If verified, the screen automatically redirects to `/onboarding`. If not yet verified, shows an inline "not verified yet" message rather than a hard error, since clicking the emailed link and clicking this button are two independent, asynchronous actions.
- **"Resend verification link"** — calls Better Auth's resend-verification endpoint; rate-limited, with a short cooldown shown in the UI.
- **Automatic redirect on verification** — in addition to the manual button, poll the session status (a TanStack Query `useQuery` with a short `refetchInterval` while this screen is mounted, or listen for a `visibilitychange`/window-focus event and refetch then) so a user who clicks the verification link in another tab and returns to this one is redirected to `/onboarding` without needing to click anything.
- This screen never shows the email/password fields again — only the two actions above, plus a "wrong email? sign out and start over" link.

### 7.3 Login (`/login`)

- Collects: email, password.
- On success, the redirect target depends on account state, checked server-side: unverified → `/verify-email`; verified but `onboardingComplete: false` → `/onboarding`; both complete → `/dashboard` (or the `redirect` query param, as long as it doesn't skip an incomplete gate).
- On failure: a clear, friendly error — never reveals whether the email exists.

### 7.4 Forgot / reset password (`/forgot-password`, `/reset-password`)

- **`/forgot-password`** — collects an email address only. On submit, calls Better Auth's forgot-password flow, which sends a reset-link email via Resend. Always shows the same "if an account exists, we've sent a link" confirmation regardless of whether the email is registered, to avoid leaking account existence.
- The emailed link points to **`/reset-password?token=...`**.
- **`/reset-password`** — validates the token server-side, collects a new password (with confirmation), and on success calls Better Auth's reset-password endpoint. Expired or invalid tokens show a clear error with a link back to `/forgot-password` to request a new one.
- On successful reset, redirect to `/login` with a "password updated — please sign in" confirmation. The user then logs in normally and is routed per the login redirect rules in 7.3 — this does not bypass onboarding; a user who reset their password before finishing onboarding still lands on `/onboarding`, not `/dashboard`.

### 7.5 Onboarding (`/onboarding`)

**Onboarding — the Credit Profile Builder (Section 9, Module 2) — lives on its own standalone page, outside the app shell (no dashboard nav/sidebar/chrome) and outside the public layout.** It is its own layout entirely. A user who has not finished onboarding must never be able to see or reach any app route — enforced by the route guard (Section 2) and the server-side check, not by UI convention alone.

- The profile builder form (score band, per-card utilisation, total accounts, oldest account age, hard inquiries, derogatory marks, credit mix, missed payments — Section 9, Module 2) is completed here.
- On finishing, the client calls an API that sets `onboardingComplete: true` server-side. Only after this flag flips does the route guard allow access to `/dashboard` and the rest of the app.
- On landing on `/dashboard` for the first time post-onboarding, the scoring engine has already run against the newly-submitted profile, so the user sees a real, personalised score estimate immediately — not an empty state.
- If a user closes the tab mid-onboarding and returns later, they land back on `/onboarding` (not the dashboard) until it's complete.

### 7.6 Server-side enforcement

All app-route and onboarding API endpoints check the session, `emailVerified`, and (where relevant) `onboardingComplete` server-side; unauthenticated or gate-incomplete calls return `401`/`403` and the React client redirects accordingly. Never expose user data without a valid, fully-gated session check.

---

## 8. Public Marketing Website (`scorelift.credit`)

The public site is the primary acquisition channel and must be treated as a product in its own right — not a brochure. Every page either converts a visitor to a signup or ranks for a high-intent search term.

### 8.1 Page Map

| Path                 | Purpose                                       | Contents                                                                                                                                                                                                                                                                                                                  |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                  | Homepage, primary conversion entry point      | Hero with a benefit-led headline; a **live free credit estimator widget** (inputs: score band, missed payments, utilisation → outputs a health grade); feature highlights; social proof strip; pricing summary; prominent CTA to sign up free                                                                             |
| `/how-it-works`      | Pre-answer objections, reduce signup friction | Step-by-step visual breakdown of the workflow: profile setup → roadmap generation → monthly check-in → score improvement                                                                                                                                                                                                  |
| `/features`          | Full feature listing                          | Icon-led cards for each major app module, with short descriptions and screenshots/mockups                                                                                                                                                                                                                                 |
| `/pricing`           | Plan comparison                               | Three-column table (Free, Pro, Annual Pro), feature comparison grid, FAQ accordion, CTA on each plan. Pro visually emphasised as the recommended option, with a "most popular" highlight                                                                                                                                  |
| `/calculators`       | Lead-magnet hub                               | Hub page linking to all free calculator tools; drives SEO traffic                                                                                                                                                                                                                                                         |
| `/calculators/:slug` | Standalone lead-magnet tools                  | Individual calculators, each fully functional **with no account required**: Utilisation Ratio Calculator, Payment Impact Estimator, Score Band Estimator, FIRE Score Readiness Checker, Mortgage Readiness Estimator. Results section, 400–600 words of explanatory copy below, CTA to unlock the full roadmap in the app |
| `/blog`              | SEO content hub                               | Index with category filtering: Score Building & Credit, Debt, Mortgages, Credit Cards, Financial Habits                                                                                                                                                                                                                   |
| `/blog/:slug`        | Long-form content                             | 1,500–3,000 word posts, each ending with an in-content CTA widget linking to a relevant calculator or signup                                                                                                                                                                                                              |
| `/about`             | Trust page                                    | Brand story, mission, and an explicit statement that ScoreLift does not connect to any bank or bureau — a key trust differentiator                                                                                                                                                                                        |
| `/contact`           | Support                                       | Simple form (name, email, message), sends via Resend to a configured support inbox                                                                                                                                                                                                                                        |
| `/privacy`, `/terms` | Legal                                         | Required for Stripe and for user trust; complete and properly drafted                                                                                                                                                                                                                                                     |
| `/login`, `/signup`  | Auth                                          | Served by the public site; redirects to `/dashboard` post-authentication                                                                                                                                                                                                                                                  |

### 8.2 Public Site Design Principles (non-negotiable)

- Hero section answers "what does this do for me" in a single clear headline — not a company description.
- Social proof (testimonials, trust badges) is placed directly below the hero, not buried in the footer.
- Every page has exactly one primary CTA. Secondary links exist but are visually subordinate.
- **Free calculators are fully functional and require no account** — they must demonstrate product value standalone.
- Mobile-first layout, correct rendering at 375px.
- Page load performance is critical. No heavy third-party scripts, no unnecessary tracking pixels.

### 8.3 SEO Strategy

SEO is the primary long-term acquisition channel.

**Technical SEO requirements:**

- Unique, keyword-rich `<title>` and meta description (under 160 characters) on every page.
- Proper H1/H2/H3 hierarchy — only one H1 per page.
- Canonical URLs on all pages; no duplicate content between `/blog/:slug` and other paths.
- `sitemap.xml` generated and submitted to Google Search Console.
- `robots.txt` allows all public pages, blocks all `/dashboard/*` and `/api/*` paths.
- Open Graph and Twitter Card meta tags on all public pages.
- Schema.org `FAQPage` structured data on the pricing and calculator pages.
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, FID < 100ms. Avoid layout shift from async-loaded content.

**Priority blog topics (initial 10 posts):**

1. How to Improve Your Credit Score Fast — A Step-by-Step Guide
2. What Is Credit Utilisation and How Does It Affect Your Score?
3. How Long Does a Late Payment Stay on Your Credit Report?
4. Credit Score Ranges Explained: Poor, Fair, Good, Very Good, Exceptional
5. How to Write a Credit Dispute Letter (With Free Template)
6. Does Checking Your Own Credit Score Hurt It? (Hard vs. Soft Inquiries)
7. How to Build Credit from Scratch — 7 Proven Methods
8. What Credit Score Do You Need for a Mortgage?
9. Snowball vs. Avalanche: Which Debt Repayment Method Is Right for You?
10. (Round out the initial 10 with further posts from the Score Building & Credit / Debt / Mortgages / Credit Cards / Financial Habits categories.)

**Calculator SEO targets:**

- Utilisation Ratio Calculator → "credit utilisation calculator"
- Payment Impact Estimator → "how much will paying off debt raise my credit score"
- Score Band Estimator → "what credit score do I have" / "credit score estimator"
- Mortgage Readiness Estimator → "credit score needed for mortgage"

---

## 9. Private Application (`scorelift.credit/dashboard`)

All routes here require an authenticated session — unauthenticated users are redirected to `/login`. Persistent left-side navigation on desktop, bottom tab bar on mobile.

### 9.1 Navigation

`/dashboard` · `/roadmap` · `/simulator` · `/goals` · `/checkin` · `/disputes` · `/documents` · `/education` · `/milestones` · `/settings` · `/settings/billing`

### Module 1 — Dashboard (`/dashboard`)

The user's home screen. Data-dense but immediately scannable — every key metric visible above the fold without scrolling.

- **Score Estimate Card** — current estimated score band (e.g. Fair 580–669), last updated date, colour-coded band indicator bar.
- **Score Delta** — change since the previous month's check-in (e.g. "+18 pts this month").
- **Roadmap Progress Bar** — percentage of roadmap actions completed, with a count (e.g. "4 of 11 actions complete").
- **Top 3 Actions** — the three highest-impact roadmap items due this month.
- **Check-in Streak Counter** — consecutive monthly check-ins.
- **Goal Progress Widget** — active goal (e.g. "Reach 720 by March") with a progress ring and on-track/off-track status.
- **Recent Milestones** — last 2–3 badges earned, with dates.
- **Quick Links** — one-click navigation to the Simulator, Dispute Generator, and Document Vault.
- **Monthly Digest Preview** — last email digest summary shown inline for users who missed it.
- **Credit Factor Dashboard** (embedded here): a visual breakdown of all five FICO-weighted factors — Payment History (35%), Credit Utilisation (30%), Account Age (15%), Credit Mix (10%), New Inquiries (10%) — each with a health status indicator (Excellent / Good / Needs Work / Critical) and an expandable improvement panel explaining the factor's weight and 1–3 specific actions to improve it.

### Module 2 — Credit Profile Builder (`/onboarding`, revisited via `/settings/profile`)

Completed on `/onboarding` after signup and email verification, before a user can reach `/dashboard` at all (Section 7.5). Users can re-run or update it any time via Settings. All fields are self-reported — no bank or bureau connection.

| Field                      | Input                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| Current Score Band         | Dropdown: Poor (<580) / Fair (580–669) / Good (670–739) / Very Good (740–799) / Exceptional (800+) |
| Credit Utilisation         | Per-card entry (card name, credit limit, current balance) — app calculates overall utilisation %   |
| Total Accounts             | Number input                                                                                       |
| Oldest Account Age         | Dropdown: <1 year / 1–3 years / 3–7 years / 7+ years                                               |
| Hard Inquiries (12 months) | Number input                                                                                       |
| Derogatory Marks           | Checkbox list: Collections / Bankruptcy / Foreclosure / None                                       |
| Credit Mix                 | Checkbox list: Credit cards / Auto loan / Mortgage / Personal loan / Student loan                  |
| Missed Payments — Count    | Number input (last 24 months)                                                                      |
| Missed Payments — Recency  | Dropdown: None / Within last 6 months / 6–12 months ago / 1–2 years ago / 2+ years ago             |

### Module 3 — Personalised Score Roadmap (`/roadmap`)

The centrepiece of the product. Generated from the user's profile using the deterministic scoring engine (Section 11). No AI or external API is involved.

- Each action item shows: title, estimated score impact (e.g. "+18–25 pts"), effort level (Low/Medium/High), time horizon (Immediate / 1–3 months / 3–6 months / 6–12 months), and status (To Do / In Progress / Done).
- Ranked by estimated score impact descending by default; re-sortable by effort or time horizon.
- Expandable detail panel per action explaining why it impacts the score and step-by-step instructions.
- Marking actions "In Progress" / "Done" updates the dashboard progress bar.
- Auto-recalculates after each monthly check-in.
- Filterable by factor, effort level, or time horizon.
- Exportable as a formatted PDF (server-side HTML → PDF, or a print stylesheet).
- Example generated actions: "Reduce card utilisation to below 30% (+22 pts estimated)"; "Pay all outstanding late fees and bring accounts current (+30 pts)"; "Wait 6 months for most recent missed payment to age (+15 pts)"; "Request a credit limit increase without a hard pull (+12 pts)"; "Do not open any new credit accounts for 6 months (+8 pts)"; "Set up autopay on all accounts (+10 pts over time)".

### Module 4 — Score Simulator (`/simulator`)

Runs the same scoring engine as the roadmap but with user-adjusted inputs. Results update in real time (client-side calculation where possible).

- **Scenario Builder** — sliders/inputs for utilisation (per card or overall), missed payment count, hard inquiry count, account age, credit mix. Each change instantly recalculates the estimated impact.
- **Side-by-Side View** — current profile vs. simulated profile, score band indicator updates live, each changed factor highlighted with its individual contribution.
- **Preset Scenarios** — quick-pick buttons: "Pay off one card", "Pay off all cards", "Open a new credit card", "Miss a payment", "Get a credit limit increase", "Close an old account".
- **Save Scenarios** (Pro feature) — up to 5 named scenarios saved for future reference, shown in a panel below the simulator.
- **Impact Timeline** — a projected 6- and 12-month score trajectory chart per scenario, rendered as a **hand-rolled SVG line chart — no charting library dependency**.

### Module 5 — Monthly Check-In System (`/checkin`)

The core retention mechanic. Resend sends a reminder email on the 1st of each month to users who have not yet checked in.

- Short guided flow (4–6 screens): any new missed payments? Updated card balances? New accounts opened? New hard inquiries?
- After submission, the engine recalculates the score estimate and roadmap. Results screen shows: new estimated score, delta from last month, which factors improved/worsened, updated top 3 actions.
- Streak counter increments on successful check-in; a congratulations state shows at 3, 6, and 12 months.
- If a milestone is crossed (e.g. score band improves Fair → Good), a milestone event fires and a celebration email is sent via Resend.
- Check-in history is stored and viewable as a score timeline on the dashboard.

### Module 6 — Goal Tracker (`/goals`)

- Users set a primary credit goal: target score band, target date, optional purpose (mortgage application, car finance, credit card, personal loan).
- The app calculates whether the target is achievable by the target date given the current roadmap trajectory; if not, suggests extending the date or prioritising specific high-impact actions.
- Progress ring on the dashboard shows percentage completion toward the goal.
- **Product Readiness Checker** — for each goal purpose, shows the typical minimum score threshold (e.g. "Most mortgage lenders require 620+") and how far away the user is.
- A secondary goal is **Annual-Pro-only**.

### Module 7 — Dispute Letter Generator (`/disputes`)

Fully template-based — no AI involved. Letters are generated from user-provided form inputs merged into pre-written legal letter templates. Generated letters are stored in Cloudflare R2.

- **Template Library:** Incorrect late payment dispute · Account not mine / identity theft · Outdated negative item (past 7-year reporting window) · Incorrect account status · Duplicate account listing · Incorrect personal information · Fraudulent hard inquiry removal.
- **Letter Generation Flow:** user selects a template, fills a short form (creditor name, account number, dispute reason, desired resolution), server merges data into the template, renders as HTML, converts to a downloadable PDF stored in R2.
- **Letter History:** every generated letter saved with status tracking — Draft / Sent / Response Received / Resolved — plus notes.
- **Download & Print:** downloadable as PDF from R2; print-optimised stylesheet.
- **Bureau Address Directory:** built-in addresses for Equifax, Experian, and TransUnion, pre-populated in the letter.

### Module 8 — Document Vault (`/documents`)

Secure file storage backed by Cloudflare R2. Files stored under the user's ID prefix, never publicly accessible.

- Supported types: PDF, JPG, PNG, DOCX. Max 10MB per file.
- Categories: Dispute Evidence, Bank Statements, Identity Documents, Correspondence, Other.
- Each document has a notes field and an optional linked dispute letter.
- List view shows: filename, category tag, upload date, file size, download/delete actions.
- **Free tier: up to 5 documents. Pro tier: unlimited.**

### Module 9 — Credit Education Centre (`/education`)

Structured learning content stored as structured data in the database — not a CMS. A strong retention feature and differentiator.

- 5 tracks: Credit Score Fundamentals · Credit Cards & Utilisation · Debt & Collections · Building Credit from Scratch · Mortgage & Loan Readiness.
- Each track: 4–8 short lessons — title, estimated read time, body content (HTML), a 3-question quiz, completion state.
- Per-user lesson completion tracking; overall progress bar.
- Completing a track awards a "Credit IQ" badge on the dashboard and milestones page.
- Lessons cross-link to relevant roadmap actions and calculator tools.

### Module 10 — Milestones & Achievements (`/milestones`)

- Triggered by: first check-in completed, score band improvements, roadmap action completions, check-in streaks (3/6/12 months), education track completions, first dispute letter generated.
- Each milestone: name, description, icon, unlock date. Displayed as a badge grid.
- Locked milestones shown greyed-out with an unlock hint.
- Unlocking triggers a celebratory Resend email with a brief progress summary.

### Module 11 — Settings & Account Management (`/settings`, `/settings/billing`)

| Section        | Contents                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Profile        | Update name, email, password. Delete account with confirmation flow.                                                |
| Credit Profile | Re-run or update the onboarding profile questionnaire at any time.                                                  |
| Notifications  | Toggle: monthly check-in reminder, milestone emails, weekly digest, marketing emails.                               |
| Billing        | Current plan, next billing date, link to the Stripe Customer Portal.                                                |
| Data Export    | Export all personal data as JSON (CCPA/privacy compliance) — profile, roadmap history, check-in history, goal data. |
| Close Account  | Soft-delete with a 30-day grace period before hard deletion. Cancels the Stripe subscription on confirmation.       |

---

## 10. Database Schema (`shared/schema.ts`)

All tables defined with Drizzle ORM + PostgreSQL. `drizzle-zod`'s `createInsertSchema()` derives Zod validation schemas and TypeScript types from each table, exported for both server and client use. Better Auth generates its own tables (`users` base + `sessions`, managed automatically — do not manually create the sessions table) — run `npx better-auth generate` and add the output to `shared/schema.ts` before `pnpm db:push`. Every query is scoped to the authenticated `userId` — never trust a client-supplied user ID.

`users` extends the Better Auth base with: `onboardingComplete: boolean` (default `false`), `stripe_customer_id`, `subscription_status`, `subscription_plan`, `created_at`. `onboardingComplete`, together with Better Auth's own `emailVerified` column, is what the route guards (Section 2) and API middleware check on every request.

| Table                 | Key columns                                                                                                                                                                                        | Notes                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `credit_profiles`     | `id, user_id, score_band, missed_payment_count, missed_payment_recency, overall_utilisation, oldest_account_age, total_accounts, hard_inquiries_12m, derogatory_marks[], credit_mix[], updated_at` | One per user, updated each check-in           |
| `credit_cards`        | `id, user_id, card_name, credit_limit, current_balance, created_at`                                                                                                                                | Multiple per user, for per-card utilisation   |
| `roadmap_items`       | `id, user_id, factor, action_title, description, estimated_impact_min, estimated_impact_max, effort_level, time_horizon, status, sort_order, completed_at`                                         | Regenerated after each check-in               |
| `simulator_scenarios` | `id, user_id, name, input_overrides (jsonb), estimated_delta, created_at`                                                                                                                          | Saved scenarios (Pro only, max 5)             |
| `goals`               | `id, user_id, target_score_band, target_date, purpose, is_active, created_at`                                                                                                                      | One active goal per user (two for Annual Pro) |
| `checkins`            | `id, user_id, score_estimate, delta_from_previous, completed_at, notes`                                                                                                                            | One per monthly check-in                      |
| `dispute_letters`     | `id, user_id, template_id, form_data (jsonb), rendered_html, r2_key, status, bureau_name, created_at, updated_at`                                                                                  | One per generated letter                      |
| `documents`           | `id, user_id, filename, r2_key, file_size, file_type, category, notes, linked_dispute_id, created_at`                                                                                              | Files stored in R2                            |
| `education_lessons`   | `id, track_id, title, content_html, read_time_minutes, sort_order`                                                                                                                                 | Static content seeded on deploy               |
| `lesson_completions`  | `id, user_id, lesson_id, quiz_score, completed_at`                                                                                                                                                 | Per-user lesson progress                      |
| `milestones`          | `id, user_id, milestone_type, unlocked_at`                                                                                                                                                         | One row per earned milestone per user         |
| `sessions`            | Managed by Better Auth automatically                                                                                                                                                               | Do not manually create                        |

---

## 11. Scoring Engine

The scoring engine is a deterministic, rule-based TypeScript module (`server/src/lib/scoringEngine.ts`). It takes a user's credit profile as input and outputs: (1) an estimated score, (2) a ranked list of roadmap actions with estimated impact, and (3) a factor-level health assessment. **It must be a pure function** — no database calls, no external API calls, no AI/LLM calls.

### 11.1 Score Estimation Logic

Starts from a baseline score of **680** and applies weighted adjustments based on profile inputs. The values below are approximate and should be calibrated to produce realistic output within FICO score ranges.

| Factor             | Weight | Adjustment rules                                                                                                                                                                                                             |
| ------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payment History    | 35%    | No missed payments: +60 pts. 1 missed, 2+ years ago: −20 pts. 1 missed, 1–2 years ago: −40 pts. 1 missed, <12 months: −60 pts. 2+ missed, any recency: −80 to −120 pts. Derogatory marks: −50 to −150 pts depending on type. |
| Credit Utilisation | 30%    | Under 10%: +50 pts. 10–29%: +20 pts. 30–49%: 0 pts. 50–74%: −30 pts. 75%+: −60 pts. Per-card spikes penalise even if overall utilisation is low.                                                                             |
| Account Age        | 15%    | 7+ years oldest account: +30 pts. 3–7 years: +15 pts. 1–3 years: 0 pts. Under 1 year: −20 pts.                                                                                                                               |
| Credit Mix         | 10%    | 3+ types: +20 pts. 2 types: +10 pts. 1 type only: 0 pts.                                                                                                                                                                     |
| New Inquiries      | 10%    | 0 inquiries: +10 pts. 1–2 inquiries: 0 pts. 3–4 inquiries: −15 pts. 5+ inquiries: −30 pts.                                                                                                                                   |

### 11.2 Roadmap Generation Logic

After scoring, the engine evaluates each factor and generates action items only where the user's profile is sub-optimal. Each action item is assigned an `estimated_impact_min` and `estimated_impact_max` based on the delta between current and optimal state. Actions are sorted by `estimated_impact_max` descending and returned to the route handler, which stores them in the `roadmap_items` table.

---

## 12. Email — Resend

All transactional and engagement emails are sent via Resend, built as HTML strings in the server codebase — no third-party email template service. Set `RESEND_API_KEY` and `EMAIL_FROM` in the environment.

| Email                     | Trigger                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email Verification        | Sent immediately on signup, before the account can be used. Contains the verification link that redirects to `/onboarding` on click (Section 7.2). |
| Welcome Email             | Sent once onboarding is complete. Confirms account setup and explains first steps in the app.                                                      |
| Monthly Check-in Reminder | 1st of each month, to users who haven't yet checked in. Includes current streak count.                                                             |
| Check-in Results Digest   | After a completed check-in. New score estimate, delta, top 3 actions for the month.                                                                |
| Score Band Improvement    | Triggered when a check-in results in a score band crossing (e.g. Fair → Good). Celebratory.                                                        |
| Milestone Unlocked        | When a user earns a new badge. Badge name and progress summary.                                                                                    |
| Dispute Letter Ready      | When a dispute letter PDF has been generated and is ready for download.                                                                            |
| Subscription Activated    | On Pro/Annual Pro activation via Stripe webhook. Confirms billing details, links to the full feature set.                                          |
| Payment Failed            | On `invoice.payment_failed` webhook. Warns the user, links to the Stripe Customer Portal to update payment method.                                 |
| Password Reset            | Handled natively by Better Auth — ensure Resend is wired into the Better Auth email config.                                                        |
| Account Deletion Warning  | When a user initiates account deletion. Confirms the 30-day grace period and provides a cancellation link.                                         |

---

## 13. File Storage — Cloudflare R2

Used exclusively for: generated dispute letter PDFs and user-uploaded documents. Files are never publicly accessible — all access goes through authenticated server-side routes.

- **Key structure:** `disputes/{user_id}/{letter_id}.pdf` and `documents/{user_id}/{document_id}.{ext}`.
- **Upload flow:** client `POST`s file to `/api/documents/upload` → server validates auth and file type → server uploads to R2 → server stores the R2 key in the `documents` table.
- **Download flow:** client `GET`s `/api/documents/{id}/download` → server validates auth (user owns the document) → server generates a signed R2 URL valid for **60 seconds** → server redirects the client to the signed URL.
- **Dispute PDF flow:** generated server-side as HTML → converted to PDF (lightweight HTML-to-PDF approach or a print stylesheet) → uploaded to R2 → R2 key stored on the dispute record.

---

## 14. Environment Variables (`.env.example`)

All environment variables must be documented in `.env.example`. Use the `required()` helper in `server/src/env.ts` so the app fails fast at startup if any required variable is missing.

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/scorelift

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://scorelift.credit

# Resend
RESEND_API_KEY=re_...
EMAIL_FROM=ScoreLift

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=scorelift-files

# App
NODE_ENV=production
PORT=3000
APP_URL=https://scorelift.credit
```

---

## 15. Deployment — Railway

The application is deployed on Railway using Nixpacks. **No Dockerfile is required.** Railway detects `package.json` and runs the build and start scripts automatically.

1. Push the repo to GitHub, with all code committed. `main` is the production branch.
2. Create a Railway project → "Deploy from GitHub repo" → point it at the repository.
3. Add a PostgreSQL plugin in the Railway project. Copy the `DATABASE_URL` it provides into the environment variables panel.
4. Add every variable from `.env.example` to the Railway environment variables panel. Ensure `BETTER_AUTH_URL` and `APP_URL` are set to `https://scorelift.credit`.
5. Confirm `package.json` has: `"build": "vite build"` and `"start": "tsx server/src/index.ts"`. Nixpacks runs build then start automatically.
6. In Railway, go to Settings → Domains and add `scorelift.credit`. Copy the Railway-provided DNS record and add it to the domain registrar.
7. After first deploy, run `pnpm db:push` once via the Railway CLI (or trigger it in the build step). Better Auth tables are created automatically on first request.
8. In the Stripe Dashboard, add a webhook endpoint pointing to `https://scorelift.credit/api/stripe/webhook`. Select events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`.

---

## 16. NPM Scripts Reference

| Script           | Purpose                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`       | Start the full application in development mode. Single Express process; Vite runs as middleware. No second port. |
| `pnpm build`     | Run `vite build`. Outputs to `dist/client/`. Must complete successfully before deployment.                       |
| `pnpm start`     | Run the server in production mode: `tsx server/src/index.ts`. Used by Railway.                                   |
| `pnpm db:push`   | Push the Drizzle schema to the connected PostgreSQL database. Run after any schema change.                       |
| `pnpm db:studio` | Open Drizzle Studio — a web UI for inspecting and editing the database. Development only.                        |

---

## 17. Developer Ground Rules (Non-Negotiable)

- **No AI APIs.** No calls to OpenAI, Anthropic, or any LLM provider. All intelligence is rule-based logic in the scoring engine.
- **No third-party financial data providers.** No Plaid, no bureau APIs, no bank connections. All credit data is self-reported.
- No additional npm packages that require paid API keys or external service accounts beyond those in the approved stack.
- No separate subdomain for the app. `scorelift.credit/*` for everything — `/dashboard` is the app entry point.
- No Dockerfile. Railway deploys via Nixpacks using the root build and start scripts.
- No separate Vite dev server port. Vite runs as Express middleware in development.
- `shared/schema.ts` is the single source of truth for all data shapes. Server validates with Zod. Client uses TypeScript types.
- All private routes (`/dashboard/*`, `/api/*`) must verify authentication server-side. Never expose user data without a valid session check.
- R2 files are never publicly accessible. All file access goes through authenticated server routes that generate short-lived signed URLs.
- Stripe webhooks must verify the signature using `STRIPE_WEBHOOK_SECRET` before processing any event.
- Emails are sent via Resend only. No SMTP, no other email provider.
- The scoring engine is a pure function. It receives a profile object and returns results. No database calls inside the engine.
- Feature gating is enforced at the API route level, not only the client. The client may hide UI elements, but the server must also reject unauthorised calls.

---

## 18. Recommended Build Phases

> **Ordering note (added convention):** the public marketing site is built to completion, including SEO plumbing, before private app pages beyond the bare auth-gated shell are built. This gets the acquisition-facing surface fully shippable early and gives the private app development phases a stable, already-tested auth/Stripe foundation to build on. Each phase must be fully tested and deployable before moving to the next (Section 3 quality gate).

### Phase 1 — Foundation (Week 1–2)

- Repo setup from the template: Vite + React + Express + TypeScript + Drizzle + Better Auth wired.
- Docker Compose running locally. Railway project created with Postgres. `DATABASE_URL` connected.
- `shared/schema.ts`: `users` table with Better Auth extension.
- Better Auth email/password auth wired, with `emailVerification` required and the `onboardingComplete` field added to the user model. `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password` pages functional.
- Full auth redirect chain in place per Section 2/7: signup → `/verify-email` → (on verification) `/onboarding` → (on onboarding complete) `/dashboard`. Enforced client-side and server-side — no route can be reached out of order.
- Resend connected. Verification email sends on signup; welcome email sends on onboarding completion.
- Stripe products and prices created. Checkout and webhook routes wired. Subscription status stored on the user record. Customer Portal route wired.

### Phase 2 — Public Site & SEO (Week 3–5)

- Complete public site: `/`, `/how-it-works`, `/features`, `/pricing`, `/about`, `/contact`, `/privacy`, `/terms`.
- Live free credit estimator widget on the homepage (client-side reimplementation of the core scoring logic).
- Calculator hub: `/calculators` index and all 5 individual calculator pages, fully functional, no account required.
- Blog engine: `/blog` index with category filtering, `/blog/:slug` individual post pages. Seed the initial 10 blog posts.
- Technical SEO: meta tags, canonical URLs, `sitemap.xml`, `robots.txt`, Open Graph tags, Schema.org markup.
- Mobile responsive audit of the entire public site at 375px, 768px, 1280px.
- Pricing page fully wired to live Stripe Price IDs, with the Pro "most popular" highlight.

### Phase 3 — Core App Foundation (Week 6–7)

- `shared/schema.ts`: `credit_profiles` + `credit_cards` tables.
- `/onboarding` page: Credit Profile Builder multi-step form, saves to `credit_profiles` and `credit_cards`, sets `onboardingComplete: true` on completion.
- Scoring engine implemented in `server/src/lib/scoringEngine.ts`. Unit tested with sample profiles.
- Roadmap generation: `POST /api/roadmap/generate` calls the scoring engine, saves to `roadmap_items`.
- `/roadmap` page: full display with filtering, sorting, status updates, detail panels.
- Credit factor dashboard: 5-factor breakdown with health indicators and improvement panels.
- Dashboard page: score estimate card, factor summary, top 3 actions, progress bar.

### Phase 4 — Engagement Features (Week 8–9)

- Monthly check-in flow: `/checkin` page, recalculation logic, results screen, streak counter.
- Check-in history stored. Score timeline on the dashboard.
- Milestone system: milestone types defined, trigger logic in check-in and roadmap routes, `/milestones` page.
- Resend emails: check-in reminder (cron via Railway), check-in results digest, milestone emails.
- Goal tracker: `/goals` page, goal creation form, readiness checker, progress ring on dashboard.
- Monthly reminder cron job: Railway cron or a server-side interval checking for users due a check-in.

### Phase 5 — Tools (Week 10–11)

- Score simulator: `/simulator` page with real-time recalculation, preset scenarios, side-by-side view, SVG impact timeline.
- Saved scenarios (Pro feature): up to 5 saved scenarios per user.
- Dispute letter generator: template library, form flow, HTML → PDF generation, R2 upload, download.
- Document vault: `/documents` page, R2 upload/download/delete, category tagging, dispute linking.
- Education centre: lesson content seeded, `/education` page, lesson viewer, quiz, progress tracking.

### Phase 6 — Polish & Launch (Week 12)

- Settings pages: profile, notifications, billing (Stripe Customer Portal link), data export, account deletion.
- Full mobile responsive audit of the private app at 375px, 768px, 1280px.
- Error states: 404 page, 500 error handling, form validation errors, empty states for all app sections.
- Performance audit: Core Web Vitals checked, images optimised, no blocking scripts.
- End-to-end test: full user journey from signup → profile builder → roadmap → check-in → dispute letter → subscription.
