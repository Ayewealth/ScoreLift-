import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Route,
  BarChart3,
  TrendingUp,
  Shield,
  CheckCircle2,
  Sparkles,
  Target,
  Star,
  Quote,
  Users,
  ArrowUp,
  Smile,
  Zap,
} from 'lucide-react'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, useStaggerReveal, useCountUp } from '../../hooks/useAnimations'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const scoreBands = ['Poor', 'Fair', 'Good', 'Very Good', 'Exceptional'] as const
const missedPayments = ['0', '1', '2', '3', '4', '5+'] as const
const utilisationBands = ['<10%', '10-29%', '30-49%', '50-74%', '75%+'] as const

type HealthGrade = 'Excellent' | 'Good' | 'Fair' | 'Poor'

function estimateGrade(
  band: string,
  missed: string,
  utilisation: string,
): { grade: HealthGrade; range: string } {
  let score = 680

  const bandScores: Record<string, number> = {
    'Exceptional': 80, 'Very Good': 60, 'Good': 30, 'Fair': 0, 'Poor': -40,
  }
  score += bandScores[band] ?? 0

  const missedDeductions: Record<string, number> = {
    '0': 0, '1': -15, '2': -35, '3': -55, '4': -75, '5+': -100,
  }
  score += missedDeductions[missed] ?? 0

  const utilisationDeductions: Record<string, number> = {
    '<10%': 20, '10-29%': 10, '30-49%': 0, '50-74%': -30, '75%+': -60,
  }
  score += utilisationDeductions[utilisation] ?? 0

  if (score >= 740) return { grade: 'Excellent', range: '740 – 850' }
  if (score >= 700) return { grade: 'Good', range: '700 – 739' }
  if (score >= 640) return { grade: 'Fair', range: '640 – 699' }
  return { grade: 'Poor', range: '300 – 639' }
}

const features = [
  {
    icon: Route,
    title: 'Personalised Roadmap',
    description:
      'Step-by-step guidance tailored to your unique credit profile. Know exactly what to do next.',
  },
  {
    icon: BarChart3,
    title: 'Score Simulator',
    description:
      'See how actions impact your score before you take them. No guesswork, no surprises.',
  },
  {
    icon: TrendingUp,
    title: 'Monthly Tracking',
    description:
      'Track your progress over time with monthly check-ins and a clear score history.',
  },
]

const trustItems = [
  { icon: Shield, text: 'No bank or bureau connections' },
  { icon: CheckCircle2, text: 'Your data, your control' },
  { icon: Sparkles, text: 'Deterministic & transparent' },
  { icon: Target, text: 'Free plan, no credit card' },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['Credit profile builder', 'Score simulator', '5 documents vault'],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    features: [
      'Personalised roadmap',
      'Monthly check-ins',
      'Goal tracker',
      'Unlimited documents vault',
      'Dispute letters',
      'Education centre',
    ],
    cta: 'Start Pro',
    highlighted: true,
  },
  {
    name: 'Annual Pro',
    price: '$89',
    period: '/year',
    features: [
      'Everything in Pro',
      '2 months free',
      'Priority support',
    ],
    cta: 'Go Annual',
    highlighted: false,
  },
]

const testimonials = [
  {
    quote: 'ScoreLift showed me exactly which late payments to tackle first. After three months my estimated score went from Fair to Very Good. I check my progress every week now.',
    name: 'Aisha M.',
    detail: 'Fair \u2192 Very Good in 3 months',
  },
  {
    quote: 'I had no idea my credit utilisation was dragging me down. The simulator let me test different payoff scenarios before I committed. Game changer.',
    name: 'James T.',
    detail: 'Raised score 48 points',
  },
  {
    quote: 'I love that my data never leaves my hands. No bank connections, no creepy data sharing \u2014 just honest tools that actually work. Finally a credit app I can trust.',
    name: 'Sofia R.',
    detail: 'Free plan user for 6 months',
  },
]

const stats = [
  { icon: Users, value: 10000, suffix: '+', label: 'Users', prefix: '' },
  { icon: ArrowUp, value: 50000, suffix: '+', label: 'Points improved', prefix: '' },
  { icon: Smile, value: 95, suffix: '%', label: 'Satisfaction rate', prefix: '' },
  { icon: Star, value: 49, suffix: '\u2605', label: 'Average rating', prefix: '4.' },
]

const faqs = [
  {
    q: 'How does ScoreLift get my credit information?',
    a: 'ScoreLift does not connect to banks or credit bureaus. You enter your information manually, and our scoring engine estimates your credit health based on the data you provide. This means your data stays yours and never leaves your control.',
  },
  {
    q: 'Is ScoreLift free?',
    a: 'Yes. The Free plan is available forever with no credit card required. It includes the credit profile builder, score simulator, and basic education. Upgrade to Pro anytime when you\u2019re ready for personalised guidance and advanced tools.',
  },
  {
    q: 'Can ScoreLift really help me improve my credit?',
    a: 'Yes. ScoreLift gives you a personalised roadmap with actionable steps based on your unique profile. By following the recommendations \u2014 like reducing utilisation or disputing errors \u2014 many users see meaningful improvement within 3\u20136 months.',
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. ScoreLift never connects to banks, credit bureaus, or third-party financial institutions. Your profile data is stored securely and you have full control. You can delete your data at any time.',
  },
  {
    q: 'What happens if I cancel my Pro subscription?',
    a: 'You\u2019ll keep access to Pro features until the end of your billing period, then your account reverts to Free. Your profile data is preserved, so you can upgrade again anytime without starting over.',
  },
]

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const estimatorRef = useRef<HTMLDivElement>(null)
  const testimonialRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const dashboardPreviewRef = useRef<HTMLDivElement>(null)

  const stat1Ref = useRef<HTMLSpanElement>(null)
  const stat2Ref = useRef<HTMLSpanElement>(null)
  const stat3Ref = useRef<HTMLSpanElement>(null)
  const stat4Ref = useRef<HTMLSpanElement>(null)

  useCountUp(stat1Ref, stats[0].value, { prefix: stats[0].prefix, suffix: stats[0].suffix })
  useCountUp(stat2Ref, stats[1].value, { prefix: stats[1].prefix, suffix: stats[1].suffix })
  useCountUp(stat3Ref, stats[2].value, { prefix: stats[2].prefix, suffix: stats[2].suffix })
  useCountUp(stat4Ref, stats[3].value, { prefix: stats[3].prefix, suffix: stats[3].suffix })

  useEffect(() => {
    updateMeta({
      title: 'Build Better Credit \u2014 ScoreLift',
      description: 'Grow your credit where it\'s planted. ScoreLift replaces opaque credit-bureau math with transparent, self-reported scoring. No bank connections needed.',
      canonical: '/',
    })
  }, [])

  useGSAP(() => {
    const h1 = heroRef.current?.querySelector('h1')
    const p = heroRef.current?.querySelector('p')
    const ctas = heroRef.current?.querySelectorAll('.hero-cta > a')
    if (h1) gsap.from(h1, { autoAlpha: 0, y: 30, duration: 0.7, ease: 'power2.out' })
    if (p) gsap.from(p, { autoAlpha: 0, y: 20, duration: 0.5, delay: 0.2, ease: 'power2.out' })
    if (ctas) gsap.from(ctas, { autoAlpha: 0, y: 15, duration: 0.4, delay: 0.4, ease: 'power2.out', stagger: 0.1 })
    if (estimatorRef.current) gsap.from(estimatorRef.current, { autoAlpha: 0, scale: 0.95, duration: 0.6, delay: 0.3, ease: 'power2.out' })
  }, { scope: heroRef })

  useScrollReveal(featuresRef)
  useStaggerReveal(featuresRef, '.feature-card', { stagger: 0.15 })
  useScrollReveal(trustRef)
  useStaggerReveal(trustRef, '.trust-item', { stagger: 0.1 })
  useScrollReveal(pricingRef)
  useStaggerReveal(pricingRef, '.plan-card', { stagger: 0.12 })
  useScrollReveal(testimonialRef)
  useStaggerReveal(testimonialRef, '.testimonial-card', { stagger: 0.12 })
  useScrollReveal(statsRef)
  useStaggerReveal(statsRef, '.stat-item', { stagger: 0.15 })
  useScrollReveal(faqRef)
  useScrollReveal(dashboardPreviewRef)

  const [band, setBand] = useState<string>('Fair')
  const [missed, setMissed] = useState<string>('0')
  const [utilisation, setUtilisation] = useState<string>('30-49%')

  const result = useMemo(
    () => estimateGrade(band, missed, utilisation),
    [band, missed, utilisation],
  )

  return (
    <div>
      <section ref={heroRef} className="relative overflow-hidden py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h1 className="font-heading text-4xl italic leading-tight md:text-5xl">
                Grow your credit{' '}
                <span className="text-primary">where it&apos;s planted</span>
              </h1>
              <p className="mt-4 font-body text-base text-muted-foreground md:text-lg">
                ScoreLift replaces opaque credit-bureau math with transparent,
                self-reported scoring. No bank connections, no hidden formulas
                &mdash; just clear, actionable steps to build better credit.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 hero-cta">
                  <Button render={<Link to="/signup" />}>
                    Get started free
                  </Button>
                  <Button variant="outline" render={<Link to="/how-it-works" />}>
                    How it works
                  </Button>
                </div>
            </div>

            <div ref={estimatorRef} className="rounded-xl bg-card p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)] md:p-8">
              <h3 className="font-heading text-xl text-foreground">
                Credit Health Estimator
              </h3>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                See where you stand &mdash; no personal data required.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="band" className="font-body text-xs font-medium">
                    Score Band
                  </Label>
                  <Select value={band} onValueChange={(val: string | null) => val && setBand(val)}>
                    <SelectTrigger className="mt-1 w-full" id="band">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scoreBands.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="missed" className="font-body text-xs font-medium">
                    Missed Payments
                  </Label>
                  <Select value={missed} onValueChange={(val: string | null) => val && setMissed(val)}>
                    <SelectTrigger className="mt-1 w-full" id="missed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {missedPayments.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="utilisation" className="font-body text-xs font-medium">
                    Utilisation
                  </Label>
                  <Select value={utilisation} onValueChange={(val: string | null) => val && setUtilisation(val)}>
                    <SelectTrigger className="mt-1 w-full" id="utilisation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {utilisationBands.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-moss p-4 text-center">
                <p className="font-body text-xs text-muted-foreground">
                  Estimated Health
                </p>
                <p className="font-heading text-4xl text-primary">
                  {result.grade}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  Score range: {result.range}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 right-0 select-none text-[80px] opacity-[0.08]"
          aria-hidden="true"
        >
          🌱
        </div>
      </section>

      <section className="border-t border-border bg-[#f5f3ed]/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              See your credit dashboard in action
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Track your score, roadmap, milestones, and more — all in one place.
            </p>
          </div>
          <div ref={dashboardPreviewRef} className="relative mx-auto mt-12 max-w-5xl">
            <div className="rounded-2xl border border-[#e8e6dd] bg-card shadow-[0_8px_48px_rgba(74,124,89,0.12)] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#e8e6dd] bg-[#faf8f2] px-5 py-3">
                <div className="size-3 rounded-full bg-[#e8d5b0]" />
                <div className="size-3 rounded-full bg-[#c4b89a]" />
                <div className="size-3 rounded-full bg-[#a8c4a0]" />
                <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1.5 text-xs text-muted-foreground text-center border border-[#e8e6dd]">
                  app.scorelift.credit/dashboard
                </div>
              </div>
              <div className="bg-white p-2">
                <img
                  src="/screenshot-hero.png"
                  alt="ScoreLift Dashboard Preview"
                  className="w-full rounded-lg border border-[#e8e6dd]"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf0e8] px-4 py-1.5 text-xs font-medium text-primary">
                Preview shown with demo data &middot; No real credit data exposed
              </span>
            </div>
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              Everything you need to grow
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Tools designed to make credit improvement simple, transparent, and
              rewarding.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="feature-card rounded-xl bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-moss">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-xl text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 font-body text-base text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={trustRef} className="bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              Trusted & Transparent
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              We never connect to banks or credit bureaus. Your data stays yours.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {trustItems.map((item) => (
              <div
                key={item.text}
                className="trust-item flex items-center gap-3 rounded-xl bg-card px-6 py-4 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <item.icon className="h-5 w-5 shrink-0 text-primary" />
                <span className="font-body text-sm text-foreground">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={pricingRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              Simple, transparent pricing
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Start free. Upgrade when you&apos;re ready to go further.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`plan-card relative rounded-xl bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)] ${
                  plan.highlighted ? 'ring-2 ring-primary' : 'border border-border'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 font-body text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading text-2xl text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-2">
                  <span className="font-heading text-4xl text-primary">
                    {plan.price}
                  </span>
                  <span className="ml-1 font-body text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 font-body text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`mt-8 flex w-full items-center justify-center rounded-md px-6 py-3 font-body text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-[#3d6b4d]'
                      : 'border border-border bg-card text-foreground hover:bg-moss'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={testimonialRef} className="border-t border-border bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              What our users say
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Real stories from people who took control of their credit.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="testimonial-card rounded-xl bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <Quote className="h-6 w-6 text-primary/40" />
                <p className="mt-4 font-body text-sm leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">
                      {t.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {t.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={statsRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              ScoreLift by the numbers
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              The numbers speak for themselves.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => {
              const refs = [stat1Ref, stat2Ref, stat3Ref, stat4Ref]
              const StatIcon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="stat-item rounded-xl bg-card p-8 text-center shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
                >
                  <StatIcon className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-4 font-heading text-4xl text-foreground">
                    <span ref={refs[i]}>{stat.prefix}0{stat.suffix}</span>
                  </p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section ref={faqRef} className="border-t border-border bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl text-foreground">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center font-body text-base text-muted-foreground">
            Everything you need to know about ScoreLift.
          </p>
          <div className="mt-10">
            <Accordion>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} className="rounded-xl border border-border bg-card mb-3 px-6">
                  <AccordionTrigger className="py-4 font-body text-base font-medium text-foreground">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="font-body text-sm text-muted-foreground">
                      {faq.a}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  )
}