import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Calculator,
  Route,
  BarChart3,
  Calendar,
  Target,
  FileText,
  FolderOpen,
  BookOpen,
  Award,
  Quote,
} from 'lucide-react'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Button } from '../../components/ui/button'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const features = [
  {
    icon: Calculator,
    title: 'Scoring Engine',
    description:
      'A deterministic, rule-based engine that scores your self-reported profile using five FICO-weighted factors.',
  },
  {
    icon: Route,
    title: 'Personalised Roadmap',
    description:
      'Prioritised action plan with estimated score impacts, effort levels, and time horizons tailored to your profile.',
  },
  {
    icon: BarChart3,
    title: 'Score Simulator',
    description:
      'See how any action changes your score before you take it. Compare scenarios side by side with real-time recalculation.',
  },
  {
    icon: Calendar,
    title: 'Monthly Check-ins',
    description:
      'Update your profile monthly, track your streak, and watch your score history grow on a timeline.',
  },
  {
    icon: Target,
    title: 'Goal Tracker',
    description:
      'Set credit targets and track progress with a visual progress ring. Know exactly how close you are to your goal.',
  },
  {
    icon: FileText,
    title: 'Dispute Letters',
    description:
      'Generate professional dispute letters from templates. Download as PDFs via secure Cloudflare R2 storage.',
  },
  {
    icon: FolderOpen,
    title: 'Document Vault',
    description:
      'Securely store credit reports, dispute responses, and related documents. Free plan includes 5 documents; Pro is unlimited.',
  },
  {
    icon: BookOpen,
    title: 'Education Centre',
    description:
      'Five learning tracks with lessons, quizzes, and badges. Build your credit knowledge from the ground up.',
  },
  {
    icon: Award,
    title: 'Milestones',
    description:
      'Earn achievements as you progress. Celebratory emails mark each milestone on your credit journey.',
  },
]

const comparisonRows = [
  {
    label: 'Data Source',
    traditional: 'Credit bureau files & bank data scraping',
    ours: 'Fully self-reported by you',
  },
  {
    label: 'Scoring Method',
    traditional: 'Proprietary AI / black-box models',
    ours: 'Deterministic, explainable TypeScript engine',
  },
  {
    label: 'Transparency',
    traditional: 'Hidden formulas — no visibility into your score',
    ours: 'Every rule documented and auditable',
  },
  {
    label: 'Cost',
    traditional: 'Often $20–$40/month for basic monitoring',
    ours: 'Free plan available; Pro at $9.99/month',
  },
]

const testimonials = [
  {
    quote: 'I finally understand how credit scoring actually works. ScoreLift showed me exactly what to do and why.',
    name: 'Alex M.',
    title: 'Improved estimated score by 45 points in 3 months',
  },
  {
    quote: 'After years of opaque bureau scores, having a transparent engine that explains every rule is a game-changer.',
    name: 'Jordan T.',
    title: 'ScoreLift Pro user since 2025',
  },
  {
    quote: 'The monthly check-ins keep me accountable. My roadmap adapts as I make progress — it feels personal.',
    name: 'Sam K.',
    title: 'Reached goal score in 5 months',
  },
]

const faqs = [
  {
    value: 'item-1',
    question: 'How is this different from Credit Karma?',
    answer: 'Credit Karma shows you bureau scores but doesn\'t help you improve them transparently. ScoreLift gives you a deterministic engine where every rule is visible, plus a personalised roadmap with estimated score impacts for each action.',
  },
  {
    value: 'item-2',
    question: 'Can I really improve my credit without connecting a bank?',
    answer: 'Yes. Our scoring engine processes what you self-report — no bank or bureau connections needed. Your personalised roadmap adapts based on the data you provide, giving you clear, actionable steps.',
  },
  {
    value: 'item-3',
    question: 'What happens to my data when I delete my account?',
    answer: 'You retain full control. When you delete your account, all self-reported data is permanently removed from our systems. No data is shared, sold, or retained after deletion.',
  },
]

export default function FeaturesPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const screenshotsRef = useRef<HTMLDivElement>(null)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    updateMeta({
      title: 'Features — ScoreLift',
      description: 'Everything you need to understand, track, and improve your credit — without connecting a bank or credit bureau. Scoring engine, roadmap, simulator, and more.',
      canonical: '/features',
    })
  }, [])

  useGSAP(() => {
    const h1 = heroRef.current?.querySelector('h1')
    const p = heroRef.current?.querySelector('p')
    if (h1) gsap.from(h1, { autoAlpha: 0, y: 30, duration: 0.7, ease: 'power2.out' })
    if (p) gsap.from(p, { autoAlpha: 0, y: 20, duration: 0.5, delay: 0.2, ease: 'power2.out' })
  }, { scope: heroRef })

  useScrollReveal(featuresRef)
  useStaggerReveal(featuresRef, '.feature-card', { stagger: 0.1 })
  useScrollReveal(screenshotsRef)
  useScrollReveal(comparisonRef)
  useScrollReveal(testimonialsRef)
  useStaggerReveal(testimonialsRef, '.testimonial-card', { stagger: 0.12 })
  useScrollReveal(faqRef)
  useScrollReveal(ctaRef)

  return (
    <div>
      <section ref={heroRef} className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl text-foreground md:text-5xl">
              Features
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Everything you need to understand, track, and improve your credit
              &mdash; without connecting a bank or credit bureau.
            </p>
          </div>

          <div ref={featuresRef} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="feature-card rounded-xl bg-card border border-border p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
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

      <section ref={screenshotsRef} className="border-t border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              See it in action
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Real screenshots from ScoreLift with demo data. Every module is fully functional.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
              <div className="flex items-center gap-1.5 border-b border-border bg-[#faf8f2] px-4 py-2">
                <div className="size-2.5 rounded-full bg-[#e8d5b0]" />
                <div className="size-2.5 rounded-full bg-[#c4b89a]" />
                <div className="size-2.5 rounded-full bg-[#a8c4a0]" />
                <span className="ml-2 text-xs text-muted-foreground">/dashboard</span>
              </div>
              <img src="/screenshot-dashboard.png" alt="Dashboard" className="w-full" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
              <div className="flex items-center gap-1.5 border-b border-border bg-[#faf8f2] px-4 py-2">
                <div className="size-2.5 rounded-full bg-[#e8d5b0]" />
                <div className="size-2.5 rounded-full bg-[#c4b89a]" />
                <div className="size-2.5 rounded-full bg-[#a8c4a0]" />
                <span className="ml-2 text-xs text-muted-foreground">/roadmap</span>
              </div>
              <img src="/screenshot-roadmap.png" alt="Roadmap" className="w-full" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
              <div className="flex items-center gap-1.5 border-b border-border bg-[#faf8f2] px-4 py-2">
                <div className="size-2.5 rounded-full bg-[#e8d5b0]" />
                <div className="size-2.5 rounded-full bg-[#c4b89a]" />
                <div className="size-2.5 rounded-full bg-[#a8c4a0]" />
                <span className="ml-2 text-xs text-muted-foreground">/simulator</span>
              </div>
              <img src="/screenshot-simulator.png" alt="Simulator" className="w-full" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
              <div className="flex items-center gap-1.5 border-b border-border bg-[#faf8f2] px-4 py-2">
                <div className="size-2.5 rounded-full bg-[#e8d5b0]" />
                <div className="size-2.5 rounded-full bg-[#c4b89a]" />
                <div className="size-2.5 rounded-full bg-[#a8c4a0]" />
                <span className="ml-2 text-xs text-muted-foreground">/goals</span>
              </div>
              <img src="/screenshot-goals.png" alt="Goals" className="w-full" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
              <div className="flex items-center gap-1.5 border-b border-border bg-[#faf8f2] px-4 py-2">
                <div className="size-2.5 rounded-full bg-[#e8d5b0]" />
                <div className="size-2.5 rounded-full bg-[#c4b89a]" />
                <div className="size-2.5 rounded-full bg-[#a8c4a0]" />
                <span className="ml-2 text-xs text-muted-foreground">/milestones</span>
              </div>
              <img src="/screenshot-milestones.png" alt="Milestones" className="w-full" loading="lazy" />
            </div>
          </div>

          <div className="mt-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-primary shadow-sm border border-border">
              All screenshots shown with demo data &middot; No real credit data exposed
            </span>
          </div>
        </div>
      </section>

      <section ref={comparisonRef} className="border-t border-border bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              What sets us apart
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Traditional credit monitoring vs. ScoreLift &mdash; the differences are stark.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-xl border border-border shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-moss">
                  <th className="px-6 py-4 font-heading text-sm text-foreground">Dimension</th>
                  <th className="px-6 py-4 font-heading text-sm text-destructive">Traditional Monitoring</th>
                  <th className="px-6 py-4 font-heading text-sm text-primary">ScoreLift</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.label} className={i < comparisonRows.length - 1 ? 'border-b border-border' : ''}>
                    <td className="px-6 py-4 font-heading text-sm text-foreground">{row.label}</td>
                    <td className="px-6 py-4 font-body text-sm text-muted-foreground">{row.traditional}</td>
                    <td className="px-6 py-4 font-body text-sm text-primary">{row.ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section ref={testimonialsRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              What users are saying
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Real stories from people building better credit, transparently.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="testimonial-card rounded-xl bg-card border border-border p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <Quote className="h-6 w-6 text-primary/40" />
                <p className="mt-4 font-body text-base text-foreground italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="font-heading text-sm text-foreground">{t.name}</p>
                  <p className="font-body text-xs text-muted-foreground">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={faqRef} className="border-t border-border bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              Frequently asked questions
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Quick answers to the most common questions about ScoreLift.
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

      <section ref={ctaRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl text-foreground">
            Ready to take control?
          </h2>
          <p className="mt-4 font-body text-base text-muted-foreground">
            Join the platform that puts transparency first.
          </p>
          <div className="mt-6">
            <Button size="lg" render={<Link to="/signup" />}>
              Start building better credit
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}