import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ShieldCheck, Star, Quote } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Button } from '../../components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Credit profile builder',
      'Scoring engine (estimated score)',
      'Score simulator',
      '5 documents in vault',
      'Basic education centre',
    ],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    features: [
      'Everything in Free',
      'Personalised roadmap',
      'Monthly check-ins with streak',
      'Goal tracker with progress ring',
      'Unlimited document vault',
      'Dispute letter generator',
      'Full education centre with badges',
      'Milestones & celebrations',
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
      '2 months free (save $30.88/yr)',
      'Priority support',
    ],
    cta: 'Go Annual',
    highlighted: false,
  },
]

const featureRows = [
  { feature: 'Credit profile builder', Free: true, Pro: true, Annual: true },
  { feature: 'Score simulator', Free: true, Pro: true, Annual: true },
  { feature: 'Document vault', Free: '5 docs', Pro: 'Unlimited', Annual: 'Unlimited' },
  { feature: 'Personalised roadmap', Free: false, Pro: true, Annual: true },
  { feature: 'Monthly check-ins', Free: false, Pro: true, Annual: true },
  { feature: 'Goal tracker', Free: false, Pro: true, Annual: true },
  { feature: 'Dispute letter generator', Free: false, Pro: true, Annual: true },
  { feature: 'Education centre', Free: 'Basic', Pro: 'Full', Annual: 'Full' },
  { feature: 'Milestones & celebrations', Free: false, Pro: true, Annual: true },
  { feature: 'Priority support', Free: false, Pro: false, Annual: true },
  { feature: 'Data export', Free: false, Pro: true, Annual: true },
  { feature: 'Annual discount', Free: false, Pro: false, Annual: 'Save $30.88' },
  { feature: 'Community access', Free: true, Pro: true, Annual: true },
  { feature: 'Cancel anytime', Free: true, Pro: true, Annual: true },
]

const scenarios = [
  {
    title: 'Just getting started?',
    plan: 'Free',
    description: 'You\u2019re curious about your credit and want a clear picture. The Free plan gives you the scoring engine, simulator, and basic tools to understand where you stand \u2014 no card required.',
    cta: 'Get started free',
  },
  {
    title: 'Ready to level up?',
    plan: 'Pro',
    description: 'You\u2019re actively working on your credit and want personalised guidance, monthly check-ins, dispute letters, and unlimited storage. Pro is for people serious about making real progress.',
    cta: 'Start Pro',
  },
  {
    title: 'All-in, long term',
    plan: 'Annual Pro',
    description: 'You\u2019re committed to transforming your credit and want the best value. Annual Pro saves you $30.88 a year and includes priority support for when you need help fast.',
    cta: 'Go Annual',
  },
]

const testimonials = [
  {
    quote: 'I went from \u201cFair\u201d to \u201cVery Good\u201d in four months. The personalised roadmap showed me exactly what to tackle first \u2014 something no other tool gave me.',
    name: 'Marcus J.',
    plan: 'Pro',
    rating: 5,
  },
  {
    quote: 'I love that I can simulate actions before making them. The Free plan got me hooked, but upgrading to Pro for the dispute letters was a no-brainer.',
    name: 'Priya K.',
    plan: 'Pro \u2192 Annual',
    rating: 5,
  },
  {
    quote: 'The annual plan is a steal. Priority support helped me resolve a tricky collection issue in two days. My score jumped 62 points.',
    name: 'Darnell W.',
    plan: 'Annual Pro',
    rating: 5,
  },
]

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can downgrade to Free or cancel your subscription at any time from your billing settings. If you cancel, you keep access to Pro features until the end of your billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'The Free plan is available forever with no credit card required. You can upgrade to Pro anytime and there is no annual commitment on the monthly plan.',
  },
  {
    q: 'What happens to my data if I downgrade?',
    a: 'Your profile data is preserved. You lose access to Pro-only features like the personalised roadmap and unlimited document vault, but your data remains safe and you can upgrade again anytime.',
  },
  {
    q: 'Do you offer refunds?',
    a: "We don't offer refunds for partial billing periods, but you can cancel at any time. If you experience an issue, contact us and we'll make it right.",
  },
]

function CheckCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <td className="border border-border px-4 py-3 text-center">
        <CheckCircle2 className="mx-auto h-4 w-4 text-primary" />
      </td>
    )
  }
  if (value === false) {
    return (
      <td className="border border-border px-4 py-3 text-center">
        <span className="text-muted-foreground">&mdash;</span>
      </td>
    )
  }
  return (
    <td className="border border-border px-4 py-3 text-center font-body text-sm text-foreground">
      {value}
    </td>
  )
}

export default function PricingPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const planCardsRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const scenariosRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const guaranteeRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    updateMeta({
      title: 'Pricing \u2014 ScoreLift',
      description: 'Start free, upgrade when you\u2019re ready. Transparent pricing for credit improvement: Free, Pro ($9.99/mo), and Annual Pro ($89/yr).',
      canonical: '/pricing',
    })
  }, [])

  useGSAP(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current, { autoAlpha: 0, y: 20, duration: 0.5, ease: 'power2.out' })
    }
  }, { scope: pageRef })

  useScrollReveal(planCardsRef, { threshold: 80 })
  useStaggerReveal(planCardsRef, '.plan-card', { stagger: 0.12 })

  useScrollReveal(tableRef, { threshold: 80 })
  useStaggerReveal(tableRef, '.feature-row', { stagger: 0.06 })

  useScrollReveal(scenariosRef)
  useStaggerReveal(scenariosRef, '.scenario-card', { stagger: 0.12 })

  useScrollReveal(testimonialsRef)
  useStaggerReveal(testimonialsRef, '.testimonial-card', { stagger: 0.12 })

  useScrollReveal(guaranteeRef)
  useScrollReveal(faqRef)

  return (
    <div ref={pageRef}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
          }),
        }}
      />
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl text-foreground md:text-5xl">
              Pricing
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Start free. Upgrade when you&apos;re ready to unlock the full
              ScoreLift experience.
            </p>
          </div>

          <div ref={planCardsRef} className="mt-16 grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`plan-card relative rounded-xl bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)] ${
                  plan.highlighted
                    ? 'ring-2 ring-primary'
                    : 'border border-border'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 font-body text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <h2 className="font-heading text-2xl text-foreground">
                  {plan.name}
                </h2>
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
                    <li
                      key={f}
                      className="flex items-start gap-2 font-body text-sm text-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  render={<Link to="/signup" />}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  className="mt-8 w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={tableRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl text-foreground">
            Feature comparison
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center font-body text-base text-muted-foreground">
            See exactly what you get at every tier. No hidden limits, no surprises.
          </p>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="feature-row">
                  <th className="border border-border bg-moss px-4 py-3 text-left font-heading text-sm font-medium text-foreground">
                    Feature
                  </th>
                  <th className="border border-border bg-moss px-4 py-3 text-center font-heading text-sm font-medium text-foreground">
                    Free
                  </th>
                  <th className="border border-border bg-moss px-4 py-3 text-center font-heading text-sm font-medium text-foreground">
                    Pro
                  </th>
                  <th className="border border-border bg-moss px-4 py-3 text-center font-heading text-sm font-medium text-foreground">
                    Annual Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map((row) => (
                  <tr key={row.feature} className="feature-row">
                    <td className="border border-border px-4 py-3 font-body text-sm text-foreground">
                      {row.feature}
                    </td>
                    <CheckCell value={row.Free} />
                    <CheckCell value={row.Pro} />
                    <CheckCell value={row.Annual} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section ref={scenariosRef} className="border-t border-border bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl text-foreground">
            Which plan is right for you?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center font-body text-base text-muted-foreground">
            Not sure where to start? Pick the scenario that sounds like you.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {scenarios.map((s) => (
              <div
                key={s.title}
                className="scenario-card rounded-xl bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <span className="inline-block rounded-full bg-moss px-3 py-1 font-body text-xs font-medium text-primary">
                  {s.plan}
                </span>
                <h3 className="mt-4 font-heading text-xl text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  {s.description}
                </p>
                <Button
                  render={<Link to="/signup" />}
                  variant="outline"
                  className="mt-6 w-full"
                >
                  {s.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={testimonialsRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl text-foreground">
            Loved by users like you
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center font-body text-base text-muted-foreground">
            Real people, real results \u2014 across every plan.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="testimonial-card">
                <CardHeader>
                  <Quote className="h-6 w-6 text-primary/40" />
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 fill-primary text-primary"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t.plan}
                    </span>
                  </div>
                  <p className="mt-1 font-body text-sm font-medium text-foreground">
                    &mdash; {t.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section ref={guaranteeRef} className="border-t border-border bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 font-heading text-3xl text-foreground">
            Your satisfaction is guaranteed
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-base text-muted-foreground">
            We&apos;re confident ScoreLift will help you take control of your
            credit. If you&apos;re not satisfied within the first 30 days of any
            paid plan, we&apos;ll refund your full payment &mdash; no questions
            asked. Your data stays yours, even if you leave.
          </p>
          <Button
            render={<Link to="/signup" />}
            variant="default"
            className="mt-8"
          >
            Start your risk-free trial
          </Button>
        </div>
      </section>

      <section ref={faqRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl text-foreground">
            Frequently asked questions
          </h2>
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