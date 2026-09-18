import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Flame, ArrowRight, TrendingUp } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, usePageEnter } from '../../hooks/useAnimations'
import { Button } from '../../components/ui/button'

gsap.registerPlugin(ScrollTrigger)

const creditBands = ['Poor', 'Fair', 'Good', 'Very Good', 'Exceptional'] as const

type ReadinessLevel = 'Not Ready' | 'Getting There' | 'Almost Ready' | 'FIRE Ready'

function getReadiness(
  age: number,
  targetAge: number,
  band: string,
  savingsRate: number,
): { level: ReadinessLevel; score: number; description: string } {
  let score = 0

  const bandScores: Record<string, number> = {
    Poor: 0,
    Fair: 10,
    Good: 20,
    'Very Good': 25,
    Exceptional: 30,
  }
  score += bandScores[band] ?? 0

  if (savingsRate >= 50) score += 30
  else if (savingsRate >= 30) score += 20
  else if (savingsRate >= 15) score += 10
  else score += 5

  const yearsRemaining = targetAge - age
  if (yearsRemaining <= 5) score += 25
  else if (yearsRemaining <= 10) score += 20
  else if (yearsRemaining <= 20) score += 15
  else score += 10

  if (band === 'Exceptional' && savingsRate >= 50)
    return {
      level: 'FIRE Ready',
      score,
      description:
        'Your credit profile and savings rate are aligned with FIRE goals. You are in excellent shape to pursue financial independence.',
    }
  if (score >= 60)
    return {
      level: 'Almost Ready',
      score,
      description:
        'You are close to FIRE readiness. Improving your credit band or increasing your savings rate could get you there.',
    }
  if (score >= 35)
    return {
      level: 'Getting There',
      score,
      description:
        'You are on the right track. Focus on building your credit profile and increasing your savings rate over time.',
    }
  return {
    level: 'Not Ready',
    score,
    description:
      'Your credit profile needs significant improvement before FIRE becomes realistic. Start with the basics: on-time payments and reducing utilisation.',
  }
}

const tips = [
  'A high savings rate is the strongest FIRE accelerator — aim for 50%+ of your income if possible.',
  'Good credit unlocks better investment property financing and lower insurance costs in retirement.',
  'Even a 1% lower interest rate on a mortgage can save hundreds of thousands over a lifetime.',
  'Track your credit alongside your net worth — both are essential FIRE metrics.',
]

export default function FIREReadinessChecker() {
  const pageRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const tipsRef = useRef<HTMLDivElement>(null)
  const explanationRef = useRef<HTMLDivElement>(null)

  const [age, setAge] = useState<string>('')
  const [targetAge, setTargetAge] = useState<string>('')
  const [creditBand, setCreditBand] = useState<string>('Fair')
  const [savingsRate, setSavingsRate] = useState<string>('')

  useEffect(() => {
    updateMeta({
      title: 'FIRE Readiness Checker — ScoreLift',
      description: 'Check if your credit profile is ready for financial independence. Free FIRE readiness tool, no sign-up needed.',
      canonical: '/calculators/fire-readiness',
    })
  }, [])

  usePageEnter(pageRef)
  useScrollReveal(tipsRef)
  useScrollReveal(explanationRef)

  const result = useMemo(() => {
    const a = parseInt(age, 10)
    const ta = parseInt(targetAge, 10)
    const sr = parseFloat(savingsRate)
    if (isNaN(a) || isNaN(ta) || isNaN(sr)) return null
    if (a >= ta) return null
    return getReadiness(a, ta, creditBand, sr)
  }, [age, targetAge, creditBand, savingsRate])

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
              FIRE Readiness{' '}
              <span className="text-primary">Checker</span>
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground">
              See if your credit profile is ready to support your Financial
              Independence, Retire Early goals.
            </p>

            <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Age</Label>
                  <Input
                    type="number"
                    min="18"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Retirement Age</Label>
                  <Input
                    type="number"
                    min="18"
                    max="100"
                    value={targetAge}
                    onChange={(e) => setTargetAge(e.target.value)}
                    placeholder="e.g. 50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Credit Band</Label>
                  <Select value={creditBand} onValueChange={(val) => val !== null && setCreditBand(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {creditBands.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Savings Rate (% of income)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={savingsRate}
                    onChange={(e) => setSavingsRate(e.target.value)}
                    placeholder="e.g. 40"
                  />
                </div>
              </div>

              {result && (
                <div ref={resultRef} className="mt-6 rounded-lg bg-moss p-4 text-center">
                  <p className="font-body text-xs text-muted-foreground">
                    FIRE Readiness Level
                  </p>
                  <p className="font-heading text-4xl text-primary">
                    {result.level}
                  </p>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    Readiness score: {result.score}/100
                  </p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    {result.description}
                  </p>
                </div>
              )}

              {!result && (age || targetAge || savingsRate) && (
                <p className="mt-4 text-center font-body text-sm text-muted-foreground">
                  {parseInt(age) >= parseInt(targetAge)
                    ? 'Your target retirement age must be greater than your current age.'
                    : 'Please fill in all fields.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section ref={explanationRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl text-foreground">
              Credit and the FIRE movement
            </h2>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              The FIRE (Financial Independence, Retire Early) movement focuses
              on aggressive saving and investing to achieve financial
              independence decades before traditional retirement age. While the
              FIRE community rightly prioritises savings rates and investment
              returns, credit is often overlooked — but it matters.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              A strong credit profile ensures you can access favourable financing
              when you need it, whether for a rental property investment, a low-rate
              balance transfer to optimise debt, or a mortgage for your
              post-retirement home. Good credit also reduces your cost of living
              through lower insurance premiums and better loan terms.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              This checker combines your credit band, savings rate, and time
              horizon to give you a FIRE readiness level. Use it to identify
              whether your credit profile is an asset or a liability on your
              path to early retirement.
            </p>
            <div className="mt-8 text-center">
              <Button render={<Link to="/signup" />}>
                <Flame className="h-4 w-4" />
                Start your credit journey
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section ref={tipsRef} className="bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-3xl text-foreground">
                FIRE and credit tips
              </h2>
            </div>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Maximise your readiness with these strategies.
            </p>
            <ul className="mt-8 space-y-4">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3 rounded-lg bg-card p-4 shadow-sm">
                  <Flame className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
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
              <Flame className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-3xl text-foreground">
                Related calculators
              </h2>
            </div>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Complement your FIRE planning with these credit tools.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                to="/calculators/mortgage-readiness"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 font-body text-sm font-medium text-foreground transition-colors hover:bg-moss"
              >
                Mortgage Readiness Estimator
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