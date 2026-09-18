import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Percent,
  TrendingUp,
  BarChart3,
  Flame,
  Home,
  Search,
  Sliders,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, useStaggerReveal, usePageEnter } from '../../hooks/useAnimations'

const calculators = [
  {
    icon: Percent,
    title: 'Credit Utilisation Ratio',
    description:
      'See how your credit card balances compare to your limits and get a clear health rating.',
    link: '/calculators/utilisation-ratio',
  },
  {
    icon: TrendingUp,
    title: 'Payment Impact Estimator',
    description:
      'Estimate how your utilisation and missed payments affect your credit score.',
    link: '/calculators/payment-impact',
  },
  {
    icon: BarChart3,
    title: 'Score Band Estimator',
    description:
      'Get an estimated score band based on your credit profile inputs.',
    link: '/calculators/score-band',
  },
  {
    icon: Flame,
    title: 'FIRE Readiness Checker',
    description:
      'Check if your credit profile is ready to support your financial independence goals.',
    link: '/calculators/fire-readiness',
  },
  {
    icon: Home,
    title: 'Mortgage Readiness Estimator',
    description:
      'Find out if you are on track for a mortgage and what terms you might expect.',
    link: '/calculators/mortgage-readiness',
  },
]

const steps = [
  {
    icon: Search,
    title: 'Choose a calculator',
    description: 'Select the tool that matches your current financial goal — from utilisation to mortgage readiness.',
  },
  {
    icon: Sliders,
    title: 'Adjust your inputs',
    description: 'Enter your self-reported data. No sign-up, no bank connections, no personal information required.',
  },
  {
    icon: CheckCircle2,
    title: 'Get your results',
    description: 'Receive an instant, transparent estimate with actionable advice to guide your next steps.',
  },
]

const testimonials = [
  {
    quote: 'The utilisation calculator showed me exactly why my score was stuck. Paid down my balances and saw improvement in a month.',
    author: 'Alex R.',
    role: 'ScoreLift Free user',
  },
  {
    quote: 'I used the FIRE checker to see if my credit profile was ready for early retirement. It gave me a clear target to work toward.',
    author: 'Sam T.',
    role: 'ScoreLift Pro user',
  },
]

export default function CalculatorsHubPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    updateMeta({
      title: 'Free Credit Calculators — ScoreLift',
      description: 'Use our free credit calculators to estimate your utilisation ratio, score band, payment impact, FIRE readiness, and mortgage readiness.',
      canonical: '/calculators',
    })
  }, [])

  usePageEnter(pageRef)
  useScrollReveal(stepsRef)
  useStaggerReveal(stepsRef, '.step-card', { stagger: 0.15 })
  useScrollReveal(testimonialsRef)
  useStaggerReveal(testimonialsRef, '.testimonial-card', { stagger: 0.12 })

  return (
    <div ref={pageRef}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is credit utilisation ratio?',
                acceptedAnswer: { '@type': 'Answer', text: 'Credit utilisation ratio is the percentage of your available credit that you are currently using. It is calculated by dividing your total credit card balances by your total credit limits. It is the second most important factor in your credit score, accounting for 30% of your FICO score.' },
              },
              {
                '@type': 'Question',
                name: 'What is a good credit utilisation ratio?',
                acceptedAnswer: { '@type': 'Answer', text: 'A credit utilisation ratio under 30% is considered good, and under 10% is excellent for maximum score benefit. Ratios above 50% start to negatively impact your credit score significantly.' },
              },
            ],
          }),
        }}
      />
      <section ref={heroRef} className="relative overflow-hidden py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl italic leading-tight md:text-5xl">
              Free Credit{' '}
              <span className="text-primary">Calculators</span>
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground md:text-lg">
              Understand your credit health with our free tools. No sign-up, no
              personal data needed — just honest, transparent estimates to help
              you plan your next move.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {calculators.map((calc) => (
              <Link
                key={calc.title}
                to={calc.link}
                className="group rounded-xl border border-border bg-card p-8 shadow-sm transition-colors hover:bg-moss"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-moss">
                  <calc.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-xl text-foreground">
                  {calc.title}
                </h3>
                <p className="mt-2 font-body text-base text-muted-foreground">
                  {calc.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 font-body text-sm font-medium text-primary">
                  Try it free
                  <span className="transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 right-0 select-none text-[80px] opacity-[0.08]"
          aria-hidden="true"
        >
          🧮
        </div>
      </section>

      <section ref={stepsRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              How our calculators work
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Three simple steps to get the insight you need.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="step-card rounded-xl bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-moss">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-3 font-heading text-sm text-primary">Step {i + 1}</p>
                <h3 className="mt-1 font-heading text-xl text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 font-body text-base text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl text-foreground">
              Why use our calculators?
            </h2>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Your credit score is one of the most important numbers in your
              financial life. It affects the interest rates you are offered, the
              credit cards and loans you qualify for, and even your housing and
              employment options. Yet most people have no idea how their
              everyday financial decisions translate into a three-digit score.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              ScoreLift&apos;s free calculators bridge that gap. Each tool uses
              the same self-reported, deterministic methodology that powers our
              full credit improvement platform. You get instant, transparent
              estimates without connecting a bank account or sharing personal
              information. Use them to explore different scenarios, understand
              what moves the needle, and build a strategy that works for you.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              When you are ready to take action, ScoreLift provides a
              step-by-step roadmap, monthly check-ins, and a document vault to
              track your progress. Start with the calculators, then sign up for
              your free plan and put those insights to work.
            </p>
            <div className="mt-8 text-center">
              <Button render={<Link to="/signup" />}>
                Get started free
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section ref={testimonialsRef} className="bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              What our users say
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Real stories from people who used our tools to take control of their credit.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="testimonial-card rounded-xl bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <p className="font-body text-base text-foreground italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-moss flex items-center justify-center">
                    <span className="font-heading text-sm text-primary">{t.author[0]}</span>
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">{t.author}</p>
                    <p className="font-body text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}