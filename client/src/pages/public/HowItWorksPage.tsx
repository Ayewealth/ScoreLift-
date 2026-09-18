import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { UserCheck, Map, Calendar, TrendingUp, Eye, Lock, BarChart3, Sparkles } from 'lucide-react'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Button } from '../../components/ui/button'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const steps = [
  {
    number: 1,
    icon: UserCheck,
    title: 'Profile Setup',
    description:
      'Tell us about your credit landscape — score band, accounts, utilization, payment history, and more. Everything you self-report stays private and under your control.',
  },
  {
    number: 2,
    icon: Map,
    title: 'Get Your Roadmap',
    description:
      'Our deterministic engine generates a personalised roadmap with prioritized actions. Each step shows the estimated score impact, effort level, and time horizon.',
  },
  {
    number: 3,
    icon: Calendar,
    title: 'Monthly Check-ins',
    description:
      'Update your profile each month to track what changed. Your roadmap adapts in real time as your credit profile evolves.',
  },
  {
    number: 4,
    icon: TrendingUp,
    title: 'Score Improvement',
    description:
      'Watch your estimated score rise as you complete roadmap items. Celebrate milestones, earn achievements, and build better credit — sustainably.',
  },
]

const comparisons = [
  {
    icon: Eye,
    title: 'Transparent Rules',
    traditional: 'Opaque formulas hidden behind bureau black boxes',
    ours: 'Every scoring rule documented, explainable, and visible',
  },
  {
    icon: Lock,
    title: 'Your Data, Your Control',
    traditional: 'Bank connections and data scraping via Plaid / Finicity',
    ours: 'Fully self-reported — no third-party data access, ever',
  },
  {
    icon: BarChart3,
    title: 'Deterministic Scoring',
    traditional: 'Black-box AI scores you cannot question or replicate',
    ours: 'Deterministic TypeScript engine — same inputs always yield same output',
  },
]

const faqs = [
  {
    value: 'item-1',
    question: 'How does self-reporting work?',
    answer: 'You tell us about your credit profile — score band, accounts, payment history, utilization, and more. Our deterministic engine processes what you provide and generates personalised recommendations. No bank connections, no bureau APIs, no data scraping.',
  },
  {
    value: 'item-2',
    question: 'Is my data secure?',
    answer: 'Absolutely. We never connect to banks, credit bureaus, or third-party data aggregators. Your self-reported data stays under your control and is encrypted at rest. You can delete your data at any time.',
  },
  {
    value: 'item-3',
    question: 'How accurate is the scoring engine?',
    answer: 'Our engine uses the same five FICO-weighted factors used by traditional scoring models. While your ScoreLift score estimates where you stand, we recommend checking your official credit reports annually at AnnualCreditReport.com for exact bureau scores.',
  },
  {
    value: 'item-4',
    question: 'How long does it take to see improvement?',
    answer: 'Most users see meaningful estimated score improvement within 2-3 months of following their personalised roadmap. The timeline depends on your starting profile, the actions you take, and your consistency with monthly check-ins.',
  },
]

export default function HowItWorksPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    updateMeta({
      title: 'How It Works — ScoreLift',
      description: 'Credit improvement is a garden you tend, not a quick fix. See how ScoreLift helps you grow your credit step by step — no bank connections needed.',
      canonical: '/how-it-works',
    })
  }, [])

  useGSAP(() => {
    const h1 = heroRef.current?.querySelector('h1')
    const p = heroRef.current?.querySelector('p')
    if (h1) gsap.from(h1, { autoAlpha: 0, y: 30, duration: 0.7, ease: 'power2.out' })
    if (p) gsap.from(p, { autoAlpha: 0, y: 20, duration: 0.5, delay: 0.2, ease: 'power2.out' })
  }, { scope: heroRef })

  useScrollReveal(stepsRef)
  useStaggerReveal(stepsRef, '.step-card', { stagger: 0.15 })
  useScrollReveal(comparisonRef)
  useStaggerReveal(comparisonRef, '.comparison-card', { stagger: 0.12 })
  useScrollReveal(faqRef)
  useScrollReveal(ctaRef)

  return (
    <div>
      <section ref={heroRef} className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl text-foreground md:text-5xl">
              How It Works
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Credit improvement is a garden you tend, not a quick fix. Here&apos;s
              how ScoreLift helps you grow, step by step.
            </p>
          </div>

          <div ref={stepsRef} className="relative mt-16">
            <div className="absolute left-8 top-0 hidden h-full w-px bg-border md:block" />

            {steps.map((step) => (
              <div key={step.number} className="step-card relative mb-16 last:mb-0 md:flex md:gap-12">
                <div className="hidden md:flex md:w-16 md:shrink-0 md:justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-card">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div className="rounded-xl bg-card border border-border p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary md:hidden">
                      <span className="font-heading text-lg text-primary-foreground">
                        {step.number}
                      </span>
                    </div>
                    <h2 className="font-heading text-2xl text-foreground">
                      {step.number}. {step.title}
                    </h2>
                  </div>
                  <p className="mt-4 font-body text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={comparisonRef} className="border-t border-border bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              What makes ScoreLift different
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Traditional credit monitoring leaves you in the dark. We shine a light on every detail.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {comparisons.map((c) => (
              <div
                key={c.title}
                className="comparison-card rounded-xl bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-moss">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-xl text-foreground">
                  {c.title}
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg bg-destructive/10 p-3">
                    <p className="font-body text-xs font-medium text-destructive">Traditional</p>
                    <p className="mt-1 font-body text-sm text-muted-foreground">{c.traditional}</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <p className="font-body text-xs font-medium text-primary">ScoreLift</p>
                    <p className="mt-1 font-body text-sm text-muted-foreground">{c.ours}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={faqRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              Common Questions
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Everything you need to know about self-reported credit improvement.
            </p>
          </div>

          <div className="mt-10">
            <Accordion>
              {faqs.map((faq) => (
                <AccordionItem key={faq.value} value={faq.value}>
                  <AccordionTrigger className="font-body text-base text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-base text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="border-t border-border bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="font-heading text-3xl text-primary">5 min</p>
              <p className="mt-1 font-body text-sm text-muted-foreground">Profile setup time</p>
            </div>
            <div>
              <p className="font-heading text-3xl text-primary">100%</p>
              <p className="mt-1 font-body text-sm text-muted-foreground">Transparent scoring</p>
            </div>
            <div>
              <p className="font-heading text-3xl text-primary">$0</p>
              <p className="mt-1 font-body text-sm text-muted-foreground">To get started</p>
            </div>
          </div>
          <h2 className="mt-12 font-heading text-3xl text-foreground">
            Ready to get started?
          </h2>
          <p className="mt-4 font-body text-base text-muted-foreground">
            Join thousands of users taking control of their credit future.
          </p>
          <div className="mt-6">
            <Button size="lg" render={<Link to="/signup" />}>
              Get started free
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}