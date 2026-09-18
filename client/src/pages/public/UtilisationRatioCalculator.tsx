import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Percent, ArrowRight, Lightbulb } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, usePageEnter } from '../../hooks/useAnimations'
import { Button } from '../../components/ui/button'

gsap.registerPlugin(ScrollTrigger)

type HealthRating = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical'

function getHealthRating(ratio: number): {
  rating: HealthRating
  color: string
  action: string
} {
  if (ratio < 10)
    return {
      rating: 'Excellent',
      color: 'text-green-600',
      action: 'You are in great shape. Keeping utilisation this low shows strong credit management.',
    }
  if (ratio < 30)
    return {
      rating: 'Good',
      color: 'text-lime-600',
      action: 'You are doing well. Try to keep balances below 30% to maintain a healthy score.',
    }
  if (ratio < 50)
    return {
      rating: 'Fair',
      color: 'text-yellow-600',
      action: 'Room for improvement. Aim to pay down balances to bring your ratio below 30%.',
    }
  if (ratio < 75)
    return {
      rating: 'Poor',
      color: 'text-orange-600',
      action: 'High utilisation is likely dragging your score down. A payoff plan is recommended.',
    }
  return {
    rating: 'Critical',
    color: 'text-red-600',
    action: 'Maxed-out cards can severely damage your score. Consider a debt management strategy.',
  }
}

const tips = [
  'Pay down high-balance cards first to quickly lower your overall ratio.',
  'Request a credit limit increase — but only if you won\'t be tempted to spend more.',
  'Spread balances across multiple cards instead of maxing out one.',
  'Set up balance alerts to stay aware of your utilisation in real time.',
]

export default function UtilisationRatioCalculator() {
  const pageRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const tipsRef = useRef<HTMLDivElement>(null)
  const explanationRef = useRef<HTMLDivElement>(null)

  const [limit, setLimit] = useState<string>('')
  const [balance, setBalance] = useState<string>('')

  useEffect(() => {
    updateMeta({
      title: 'Credit Utilisation Ratio Calculator — ScoreLift',
      description: 'Calculate your credit utilisation ratio and see how it affects your credit health. Free, no sign-up required.',
      canonical: '/calculators/utilisation-ratio',
    })
  }, [])

  usePageEnter(pageRef)
  useScrollReveal(tipsRef)
  useScrollReveal(explanationRef)

  const ratio = useMemo(() => {
    const l = parseFloat(limit)
    const b = parseFloat(balance)
    if (!l || !b) return null
    return (b / l) * 100
  }, [limit, balance])

  const health = useMemo(() => (ratio !== null ? getHealthRating(ratio) : null), [ratio])

  useEffect(() => {
    if (ratio !== null && resultRef.current) {
      gsap.from(resultRef.current, { autoAlpha: 0, y: 20, duration: 0.5, ease: 'power2.out' })
    }
  }, [ratio])

  return (
    <div ref={pageRef}>
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-heading text-4xl italic leading-tight md:text-5xl">
              Credit Utilisation{' '}
              <span className="text-primary">Ratio Calculator</span>
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Find out how much of your available credit you are using and what
              that means for your score.
            </p>

            <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Total Credit Limit ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    placeholder="e.g. 10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Balance ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="e.g. 3500"
                  />
                </div>
              </div>

              {ratio !== null && health && (
                <div ref={resultRef} className="mt-6 rounded-lg bg-moss p-4 text-center">
                  <p className="font-body text-xs text-muted-foreground">
                    Credit Utilisation Ratio
                  </p>
                  <p className="font-heading text-4xl text-primary">
                    {ratio.toFixed(1)}%
                  </p>
                  <p className={`mt-1 font-heading text-2xl ${health.color}`}>
                    {health.rating}
                  </p>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    {health.action}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section ref={explanationRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl text-foreground">
              Why your utilisation ratio matters
            </h2>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Your credit utilisation ratio — the percentage of your total
              available credit that you are currently using — is one of the most
              influential factors in credit scoring models like FICO and
              VantageScore. It accounts for roughly 30% of your FICO score,
              making it second only to payment history in importance.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Lenders view high utilisation as a sign of financial stress.
              Someone using 80% of their available credit looks riskier than
              someone using 20%, even if both make their payments on time. The
              good news: utilisation is highly actionable. Paying down balances
              can produce score improvements in as little as one billing cycle.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Most experts recommend keeping your utilisation below 30%, and
              the best scores typically belong to those under 10%. Our
              calculator gives you a clear picture of where you stand and a
              specific action you can take to improve.
            </p>
            <div className="mt-8 text-center">
              <Button render={<Link to="/signup" />}>
                <Percent className="h-4 w-4" />
                Get a personalised plan
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section ref={tipsRef} className="bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-3xl text-foreground">
                Tips to improve your ratio
              </h2>
            </div>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Small changes can make a big difference. Here are actionable steps to lower your utilisation.
            </p>
            <ul className="mt-8 space-y-4">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3 rounded-lg bg-card p-4 shadow-sm">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="font-body text-base text-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <Percent className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-3xl text-foreground">
                Related calculators
              </h2>
            </div>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Dive deeper into your credit profile with these complementary tools.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                to="/calculators/payment-impact"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 font-body text-sm font-medium text-foreground transition-colors hover:bg-moss"
              >
                Payment Impact Estimator
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/calculators/score-band"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 font-body text-sm font-medium text-foreground transition-colors hover:bg-moss"
              >
                Score Band Estimator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}