import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowRight, Shield } from 'lucide-react'
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

type ReadinessLevel = 'Not Ready' | 'Needs Work' | 'Nearly There' | 'Mortgage Ready'

function estimateMortgage(
  band: string,
  income: number,
  homePrice: number,
  downPaymentPercent: number,
): {
  level: ReadinessLevel
  score: number
  estRate: string
  estMonthly: string
  description: string
} {
  let score = 0

  const bandScores: Record<string, number> = {
    Poor: 0,
    Fair: 15,
    Good: 30,
    'Very Good': 40,
    Exceptional: 50,
  }
  score += bandScores[band] ?? 0

  const loanAmount = homePrice * (1 - downPaymentPercent / 100)
  const dtiRatio = (loanAmount * 0.06 + loanAmount / 360) / (income / 12)

  if (dtiRatio <= 0.28) score += 30
  else if (dtiRatio <= 0.36) score += 20
  else if (dtiRatio <= 0.43) score += 10
  else score += 0

  if (downPaymentPercent >= 20) score += 20
  else if (downPaymentPercent >= 10) score += 10
  else score += 0

  let estRate: string
  if (band === 'Exceptional') estRate = '5.5% – 6.5%'
  else if (band === 'Very Good') estRate = '6.0% – 7.0%'
  else if (band === 'Good') estRate = '6.5% – 7.5%'
  else if (band === 'Fair') estRate = '7.5% – 9.0%'
  else estRate = '9.0%+'

  const avgRate =
    band === 'Exceptional'
      ? 6
      : band === 'Very Good'
        ? 6.5
        : band === 'Good'
          ? 7
          : band === 'Fair'
            ? 8.25
            : 9.5

  const monthlyRate = avgRate / 100 / 12
  const numPayments = 360
  const monthly =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)

  if (band === 'Exceptional' && dtiRatio <= 0.36 && downPaymentPercent >= 20)
    return {
      level: 'Mortgage Ready',
      score,
      estRate,
      estMonthly: `$${Math.round(monthly).toLocaleString()}`,
      description:
        'You are in an excellent position for a mortgage. Your credit profile, income, and down payment are strong.',
    }
  if (score >= 60)
    return {
      level: 'Nearly There',
      score,
      estRate,
      estMonthly: `$${Math.round(monthly).toLocaleString()}`,
      description:
        'You are close to mortgage readiness. Improving your credit band or increasing your down payment could help.',
    }
  if (score >= 30)
    return {
      level: 'Needs Work',
      score,
      estRate,
      estMonthly: `$${Math.round(monthly).toLocaleString()}`,
      description:
        'Your profile needs improvement before applying. Focus on building your credit and saving for a larger down payment.',
    }
  return {
    level: 'Not Ready',
    score,
    estRate,
    estMonthly: `$${Math.round(monthly).toLocaleString()}`,
    description:
      'Significant improvements are needed. Start by addressing payment history and credit utilisation.',
  }
}

const tips = [
  'A 20% down payment eliminates PMI and signals financial strength to lenders.',
  'Improving from Fair to Good can lower your rate by 1-2%, saving thousands per year.',
  'Keep your debt-to-income ratio below 36% for the best mortgage approval odds.',
  'Check your credit report for errors before applying — mistakes can cost you a better rate.',
]

export default function MortgageReadinessEstimator() {
  const pageRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const tipsRef = useRef<HTMLDivElement>(null)
  const explanationRef = useRef<HTMLDivElement>(null)

  const [band, setBand] = useState<string>('Fair')
  const [income, setIncome] = useState<string>('')
  const [homePrice, setHomePrice] = useState<string>('')
  const [downPaymentPercent, setDownPaymentPercent] = useState<string>('')

  useEffect(() => {
    updateMeta({
      title: 'Mortgage Readiness Estimator — ScoreLift',
      description: 'Find out if your credit and finances are ready for a mortgage. Get estimated rates and monthly payments, free.',
      canonical: '/calculators/mortgage-readiness',
    })
  }, [])

  usePageEnter(pageRef)
  useScrollReveal(tipsRef)
  useScrollReveal(explanationRef)

  const result = useMemo(() => {
    const inc = parseFloat(income)
    const price = parseFloat(homePrice)
    const dp = parseFloat(downPaymentPercent)
    if (isNaN(inc) || isNaN(price) || isNaN(dp)) return null
    if (inc <= 0 || price <= 0) return null
    return estimateMortgage(band, inc, price, dp)
  }, [band, income, homePrice, downPaymentPercent])

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
              Mortgage Readiness{' '}
              <span className="text-primary">Estimator</span>
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Find out if your credit and finances are ready for a mortgage,
              and get an estimate of the terms you might expect.
            </p>

            <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Credit Band</Label>
                  <Select value={band} onValueChange={(val) => val !== null && setBand(val)}>
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
                  <Label>Annual Income ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="e.g. 75000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Home Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={homePrice}
                    onChange={(e) => setHomePrice(e.target.value)}
                    placeholder="e.g. 350000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Down Payment (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(e.target.value)}
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              {result && (
                <div ref={resultRef} className="mt-6 rounded-lg bg-moss p-4 text-center">
                  <p className="font-body text-xs text-muted-foreground">
                    Mortgage Readiness
                  </p>
                  <p className="font-heading text-4xl text-primary">
                    {result.level}
                  </p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    Readiness score: {result.score}/100
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-md bg-background p-3">
                      <p className="font-body text-xs text-muted-foreground">
                        Est. Interest Rate
                      </p>
                      <p className="font-heading text-lg text-foreground">
                        {result.estRate}
                      </p>
                    </div>
                    <div className="rounded-md bg-background p-3">
                      <p className="font-body text-xs text-muted-foreground">
                        Est. Monthly Payment
                      </p>
                      <p className="font-heading text-lg text-foreground">
                        {result.estMonthly}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 font-body text-sm text-muted-foreground">
                    {result.description}
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
              Preparing for a mortgage
            </h2>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Your credit profile is one of the most important factors lenders
              evaluate when you apply for a mortgage. A higher credit score can
              save you tens of thousands of dollars over the life of a loan
              through a lower interest rate. Even a 1% difference in rate can
              mean hundreds of dollars per month.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Lenders also look at your debt-to-income ratio, which compares
              your monthly housing costs to your gross monthly income. A DTI
              below 36% is generally considered healthy, and many lenders prefer
              28% or lower for the housing component alone. Your down payment
              size also matters: 20% or more lets you avoid private mortgage
              insurance and signals financial stability.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              This estimator combines these factors to give you a holistic view
              of your mortgage readiness. Use it to understand where you stand
              and what improvements would have the biggest impact on your
              homeownership timeline.
            </p>
<div className="mt-8 text-center">
              <Button render={<Link to="/signup" />}>
                <Home className="h-4 w-4" />
                Check your mortgage readiness
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section ref={tipsRef} className="bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-3xl text-foreground">
                Mortgage readiness tips
              </h2>
            </div>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Prepare yourself for the best possible mortgage terms.
            </p>
            <ul className="mt-8 space-y-4">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3 rounded-lg bg-card p-4 shadow-sm">
                  <Home className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
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
              <Home className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-3xl text-foreground">
                Related calculators
              </h2>
            </div>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Strengthen your financial profile with these related tools.
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
                to="/calculators/fire-readiness"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 font-body text-sm font-medium text-foreground transition-colors hover:bg-moss"
              >
                FIRE Readiness Checker
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}