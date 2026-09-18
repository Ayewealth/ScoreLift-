import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Shield, Eye, Leaf, Heart, Lightbulb, Sparkles } from 'lucide-react'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Button } from '../../components/ui/button'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const values = [
  {
    icon: Eye,
    title: 'Transparency',
    description:
      'Every rule in our scoring engine is visible and explainable. No hidden formulas, no black-box algorithms.',
  },
  {
    icon: Leaf,
    title: 'Steady Growth',
    description:
      'Credit improvement is a garden, not a quick fix. We reward consistency, patience, and sustainable habits.',
  },
  {
    icon: Heart,
    title: 'User-First',
    description:
      'You own your data. We never share, sell, or expose your financial information to third parties.',
  },
]

const missionHighlights = [
  {
    icon: Lightbulb,
    title: 'The Insight',
    description:
      'The traditional credit system is a black box. Billions rely on scores they can neither see nor explain. We set out to change that by building a transparent alternative from scratch.',
  },
  {
    icon: Sparkles,
    title: 'The Approach',
    description:
      'We built a deterministic scoring engine in TypeScript — not AI, not machine learning, not a black box. Every rule is documented, every calculation is auditable, and every score is explainable in plain language.',
  },
  {
    icon: Shield,
    title: 'The Promise',
    description:
      'No bank connections. No bureau APIs. No data scraping. Your credit data comes from you, stays under your control, and is never shared with third parties. That is a permanent design constraint, not a feature toggle.',
  },
]

const whyFaqs = [
  {
    value: 'item-1',
    question: 'Why self-report instead of connecting to banks or bureaus?',
    answer: 'Because your financial data should belong to you, not to third-party aggregators. Traditional platforms connect to banks via Plaid or Finicity and pull bureau data from Equifax, Experian, or TransUnion — creating privacy risks and opaque data chains. Self-reporting eliminates all of that. You are the sole source of truth about your own credit.',
  },
  {
    value: 'item-2',
    question: 'Is self-reported data reliable for credit improvement?',
    answer: 'Absolutely. The purpose of ScoreLift is to help you understand and improve your credit habits — not to generate a bureau-verified score. Our deterministic engine gives you an honest estimate based on what you report, and your personalised roadmap adapts to your real progress over time.',
  },
  {
    value: 'item-3',
    question: 'How is this different from Credit Karma or other monitoring services?',
    answer: 'Those services show you bureau scores but do little to help you improve them transparently. ScoreLift gives you a personalised roadmap, a deterministic engine where every rule is visible, and monthly check-ins that track your progress — all without connecting to a single bank or bureau.',
  },
  {
    value: 'item-4',
    question: 'What happens if I report inaccurate information?',
    answer: 'Your roadmap is only as accurate as the data you provide. We encourage honesty because it leads to the most useful recommendations. You can update your profile at any time, and your roadmap will recalibrate based on the new information. There is no penalty for correcting your data.',
  },
]

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const missionRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)
  const whyRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    updateMeta({
      title: 'About ScoreLift',
      description: 'ScoreLift was built on a simple belief: understanding your credit shouldn\'t require a black box. Learn about our mission and transparent approach to credit improvement.',
      canonical: '/about',
    })
  }, [])

  useGSAP(() => {
    const h1 = heroRef.current?.querySelector('h1')
    const paragraphs = heroRef.current?.querySelectorAll('p')
    if (h1) gsap.from(h1, { autoAlpha: 0, y: 30, duration: 0.7, ease: 'power2.out' })
    if (paragraphs) gsap.from(paragraphs, { autoAlpha: 0, y: 20, duration: 0.5, delay: 0.2, ease: 'power2.out', stagger: 0.08 })
  }, { scope: heroRef })

  useScrollReveal(missionRef)
  useStaggerReveal(missionRef, '.mission-card', { stagger: 0.12 })
  useScrollReveal(trustRef)
  useScrollReveal(valuesRef)
  useStaggerReveal(valuesRef, '.value-card', { stagger: 0.12 })
  useScrollReveal(whyRef)
  useScrollReveal(ctaRef)

  return (
    <div>
      <section ref={heroRef} className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl text-foreground md:text-5xl">
            About ScoreLift
          </h1>

          <div className="mt-10 space-y-6 font-body text-base text-muted-foreground leading-relaxed">
            <p>
              ScoreLift was built on a simple belief: understanding your credit
              shouldn&apos;t require a black box. The traditional credit system
              relies on opaque bureau math, third-party data aggregators, and
              formulas you&apos;re never allowed to see. We think that&apos;s
              wrong.
            </p>
            <p>
              So we built something different. ScoreLift is a credit-improvement
              platform where every rule is transparent, every score is
              explainable, and every piece of data is self-reported. There are no
              bank connections, no Plaid integrations, no credit bureau
              APIs&mdash;by design and permanent choice.
            </p>
            <p>
              Our scoring engine is deterministic TypeScript, not AI. When we
              tell you an action will improve your score by a certain number of
              points, we can show you the exact math behind it. That&apos;s the
              kind of transparency we believe everyone deserves.
            </p>
          </div>
        </div>
      </section>

      <section ref={missionRef} className="border-t border-border bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              Our Mission
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              How ScoreLift started and the problem we set out to solve.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {missionHighlights.map((m) => (
              <div
                key={m.title}
                className="mission-card rounded-xl bg-card border border-border p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-moss">
                  <m.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-xl text-foreground">
                  {m.title}
                </h3>
                <p className="mt-2 font-body text-base text-muted-foreground">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={trustRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="mt-4 font-heading text-2xl text-foreground">
              Our Trust Commitment
            </h2>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              <strong className="text-foreground">
                We never connect to banks or credit bureaus.
              </strong>{' '}
              Not now, not ever. ScoreLift is designed around self-reported data
              because we believe you should be the sole source of truth about
              your own credit. No API calls to Equifax, Experian, or TransUnion.
              No Plaid or Finicity integrations. Your financial privacy is not
              for sale.
            </p>
          </div>
        </div>
      </section>

      <section ref={valuesRef} className="border-t border-border bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl text-foreground">
            Our Values
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="value-card text-center rounded-xl bg-card border border-border p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-moss">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-xl text-foreground">
                  {v.title}
                </h3>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={whyRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              Why self-reporting?
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Our philosophy on credit data ownership, explained.
            </p>
          </div>

          <div className="mt-10">
            <Accordion>
              {whyFaqs.map((faq) => (
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
          <h2 className="font-heading text-3xl text-foreground">
            Ready to grow your credit?
          </h2>
          <p className="mt-4 font-body text-base text-muted-foreground">
            Join the people who are building better credit, transparently.
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