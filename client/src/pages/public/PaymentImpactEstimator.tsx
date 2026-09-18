import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, usePageEnter } from '../../hooks/useAnimations'
import { Button } from '../../components/ui/button'

gsap.registerPlugin(ScrollTrigger)

function estimateScore(
  currentUtilisation: number,
  targetUtilisation: number,
  missedPayments: number,
): { current: number; newScore: number; delta: number } {
  let current = 680

  current -= Math.min(Math.floor(currentUtilisation / 10) * 10, 80)
  current -= missedPayments * 20

  let newScore = 680
  newScore -= Math.min(Math.floor(targetUtilisation / 10) * 10, 80)
  newScore -= missedPayments * 20

  const delta = newScore - current

  return { current, newScore, delta }
}

const tips = [
  'Even one missed payment can drop your score significantly. Set up auto-pay to avoid forgetting.',
  'Reducing utilisation from 65% to 25% can boost your score by 30-40 points in one billing cycle.',
  'Focus on the 30% utilisation threshold — crossing below it often unlocks better credit offers.',
  'Payment history matters most: one late payment can outweigh months of low utilisation.',
]

export default function PaymentImpactEstimator() {
  const pageRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const tipsRef = useRef<HTMLDivElement>(null)
  const explanationRef = useRef<HTMLDivElement>(null)

  const [currentUtilisation, setCurrentUtilisation] = useState<string>('')
  const [targetUtilisation, setTargetUtilisation] = useState<string>('')
  const [missedPayments, setMissedPayments] = useState<string>('0')

  useEffect(() => {
    updateMeta({
      title: 'Payment Impact Estimator — ScoreLift',
      description: 'See how reducing your utilisation and avoiding missed payments could change your estimated credit score. Free tool.',
      canonical: '/calculators/payment-impact',
    })
  }, [])

  usePageEnter(pageRef)
  useScrollReveal(tipsRef)
  useScrollReveal(explanationRef)

  const result = useMemo(() => {
    const cur = parseFloat(currentUtilisation)
    const tgt = parseFloat(targetUtilisation)
    const missed = parseInt(missedPayments, 10)
    if (isNaN(cur) || isNaN(tgt)) return null
    return estimateScore(cur, tgt, missed)
  }, [currentUtilisation, targetUtilisation, missedPayments])

  useEffect(() => {
    if (result && resultRef.current) {
      gsap.from(resultRef.current, { autoAlpha: 0, y: 20, duration: 0.5, ease: 'power2.out' })
    }
  }, [result])

  return (
    <div ref={pageRef}>
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-heading text-4xl italic leading-tight md:text-5xl">
              Payment{' '}
              <span className="text-primary">Impact Estimator</span>
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground">
              See how reducing your utilisation and avoiding missed payments
              could change your estimated credit score.
            </p>

            <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Current Utilisation %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={currentUtilisation}
                    onChange={(e) => setCurrentUtilisation(e.target.value)}
                    placeholder="e.g. 65"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Utilisation %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={targetUtilisation}
                    onChange={(e) => setTargetUtilisation(e.target.value)}
                    placeholder="e.g. 25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Missed Payments</Label>
                  <Select value={missedPayments} onValueChange={(val) => val !== null && setMissedPayments(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}{n === 5 ? '+' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {result && (
                <div ref={resultRef} className="mt-6 rounded-lg bg-moss p-4 text-center">
                  <p className="font-body text-xs text-muted-foreground">
                    Estimated Score Impact
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="font-body text-xs text-muted-foreground">
                        Current Score
                      </p>
                      <p className="font-heading text-3xl text-foreground">
                        {result.current}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-xs text-muted-foreground">
                        New Estimated Score
                      </p>
                      <p className="font-heading text-3xl text-primary">
                        {result.newScore}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-xs text-muted-foreground">
                        Change
                      </p>
                      <p
                        className={`font-heading text-3xl ${
                          result.delta >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {result.delta >= 0 ? '+' : ''}
                        {result.delta}
                      </p>
                    </div>
                  </div>
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
              Understanding payment impact
            </h2>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Payment history is the single largest factor in most credit
              scoring models, accounting for about 35% of your FICO score. Even
              one missed payment can stay on your credit report for up to seven
              years and significantly reduce your score. The more recent the
              missed payment, the greater the negative impact.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Credit utilisation, at roughly 30% of your FICO score, is the
              second most important factor. Because it updates monthly as you
              pay down balances, improving your utilisation is one of the
              fastest ways to boost your score. This estimator combines both
              factors to show you the combined effect of lowering your
              utilisation and maintaining on-time payments.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Use this tool to model different scenarios. For example, if you
              are at 65% utilisation with two missed payments, what happens if
              you pay down to 25% and make no further late payments? The delta
              can be dramatic — and our estimator makes it visible in seconds.
            </p>
            <div className="mt-8 text-center">
              <Button render={<Link to="/signup" />}>
                <TrendingUp className="h-4 w-4" />
                Build your improvement plan
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section ref={tipsRef} className="bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-3xl text-foreground">
                Key insights
              </h2>
            </div>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Understand what moves the needle on your credit score.
            </p>
            <ul className="mt-8 space-y-4">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3 rounded-lg bg-card p-4 shadow-sm">
                  <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
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
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-3xl text-foreground">
                Related calculators
              </h2>
            </div>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Explore more tools to understand your full credit picture.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                to="/calculators/utilisation-ratio"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 font-body text-sm font-medium text-foreground transition-colors hover:bg-moss"
              >
                Utilisation Ratio Calculator
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