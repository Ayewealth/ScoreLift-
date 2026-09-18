import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, ArrowRight, Target } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, usePageEnter } from '../../hooks/useAnimations'
import { Button } from '../../components/ui/button'

gsap.registerPlugin(ScrollTrigger)

const scoreBands = ['Poor', 'Fair', 'Good', 'Very Good', 'Exceptional'] as const
const missedPayments = ['0', '1', '2', '3', '4', '5+'] as const
const utilisationBands = ['<10%', '10-29%', '30-49%', '50-74%', '75%+'] as const
const ageOptions = ['Less than 1 year', '1-3 years', '4-7 years', '8+ years'] as const

type HealthGrade = 'Excellent' | 'Good' | 'Fair' | 'Poor'

function estimateBand(
  band: string,
  missed: string,
  utilisation: string,
  age: string,
): { grade: HealthGrade; range: string; description: string } {
  let score = 680

  const bandScores: Record<string, number> = {
    Exceptional: 80,
    'Very Good': 60,
    Good: 30,
    Fair: 0,
    Poor: -40,
  }
  score += bandScores[band] ?? 0

  const missedDeductions: Record<string, number> = {
    '0': 0,
    '1': -15,
    '2': -35,
    '3': -55,
    '4': -75,
    '5+': -100,
  }
  score += missedDeductions[missed] ?? 0

  const utilisationDeductions: Record<string, number> = {
    '<10%': 20,
    '10-29%': 10,
    '30-49%': 0,
    '50-74%': -30,
    '75%+': -60,
  }
  score += utilisationDeductions[utilisation] ?? 0

  const ageBoosts: Record<string, number> = {
    'Less than 1 year': -20,
    '1-3 years': 0,
    '4-7 years': 15,
    '8+ years': 30,
  }
  score += ageBoosts[age] ?? 0

  const descriptions: Record<string, string> = {
    Excellent:
      'You have an exceptional credit profile. You likely qualify for the best rates and terms available.',
    Good: 'Your credit is solid. Most lenders will view you favourably with competitive rates.',
    Fair: 'You have a reasonable credit profile. Some lenders may offer you credit, but rates may be higher.',
    Poor:
      'Your credit needs attention. Focus on paying bills on time and reducing balances to improve.',
  }

  if (score >= 740)
    return { grade: 'Excellent', range: '740 – 850', description: descriptions.Excellent }
  if (score >= 700)
    return { grade: 'Good', range: '700 – 739', description: descriptions.Good }
  if (score >= 640)
    return { grade: 'Fair', range: '640 – 699', description: descriptions.Fair }
  return { grade: 'Poor', range: '300 – 639', description: descriptions.Poor }
}

const tips = [
  'Payment history and utilisation have the biggest impact — focus on these two first.',
  'A longer credit history helps your score. Keep old accounts open even if you don\'t use them.',
  'Checking your own score is a soft inquiry and never harms your credit.',
  'Diversifying credit types (cards, loans, etc.) can boost your score over time.',
]

export default function ScoreBandEstimator() {
  const pageRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const tipsRef = useRef<HTMLDivElement>(null)
  const explanationRef = useRef<HTMLDivElement>(null)

  const [band, setBand] = useState<string>('Fair')
  const [missed, setMissed] = useState<string>('0')
  const [utilisation, setUtilisation] = useState<string>('30-49%')
  const [age, setAge] = useState<string>('1-3 years')

  useEffect(() => {
    updateMeta({
      title: 'Score Band Estimator — ScoreLift',
      description: 'Get an estimated credit score range based on your self-reported profile. Free, no sign-up needed.',
      canonical: '/calculators/score-band',
    })
  }, [])

  usePageEnter(pageRef)
  useScrollReveal(tipsRef)
  useScrollReveal(explanationRef)

  const result = useMemo(
    () => estimateBand(band, missed, utilisation, age),
    [band, missed, utilisation, age],
  )

  useEffect(() => {
    if (resultRef.current) {
      gsap.from(resultRef.current, { autoAlpha: 0, y: 20, duration: 0.5, ease: 'power2.out' })
    }
  }, [result])

  return (
    <div ref={pageRef}>
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-heading text-4xl italic leading-tight md:text-5xl">
              Score Band{' '}
              <span className="text-primary">Estimator</span>
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Get an estimated credit score range based on your self-reported
              credit profile.
            </p>

            <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Score Band</Label>
                  <Select value={band} onValueChange={(val) => val !== null && setBand(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {scoreBands.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Missed Payments</Label>
                  <Select value={missed} onValueChange={(val) => val !== null && setMissed(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {missedPayments.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Credit Utilisation</Label>
                  <Select value={utilisation} onValueChange={(val) => val !== null && setUtilisation(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {utilisationBands.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Oldest Account Age</Label>
                  <Select value={age} onValueChange={(val) => val !== null && setAge(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ageOptions.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div ref={resultRef} className="mt-6 rounded-lg bg-moss p-4 text-center">
                <p className="font-body text-xs text-muted-foreground">
                  Estimated Credit Health
                </p>
                <p className="font-heading text-4xl text-primary">
                  {result.grade}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  Score range: {result.range}
                </p>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  {result.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={explanationRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl text-foreground">
              Understanding score bands
            </h2>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Credit scores typically range from 300 to 850, with higher scores
              indicating lower credit risk. Lenders use these scores to
              determine whether to extend credit, what interest rate to offer,
              and how much credit to approve. Understanding which band you fall
              into helps you set realistic goals and prioritise the factors that
              matter most.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Our estimator combines four key factors: your current score band,
              payment history, credit utilisation, and account age. By adjusting
              these inputs, you can see how different scenarios might change
              your estimated score band. For example, paying down utilisation
              from 50-74% to under 30% can move you from Fair to Good.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Remember that this is an estimate. Your actual credit score
              depends on many factors, including the specific scoring model used
              and the completeness of your credit report. Use this tool as a
              starting point for your credit improvement journey.
            </p>
            <div className="mt-8 text-center">
              <Button render={<Link to="/signup" />}>
                <BarChart3 className="h-4 w-4" />
                Get your personalised roadmap
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section ref={tipsRef} className="bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-3xl text-foreground">
                Tips to improve your band
              </h2>
            </div>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Simple, proven strategies to move up the score band ladder.
            </p>
            <ul className="mt-8 space-y-4">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3 rounded-lg bg-card p-4 shadow-sm">
                  <Target className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
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
              <BarChart3 className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-3xl text-foreground">
                Related calculators
              </h2>
            </div>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Continue exploring your credit profile with these tools.
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
                to="/calculators/payment-impact"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 font-body text-sm font-medium text-foreground transition-colors hover:bg-moss"
              >
                Payment Impact Estimator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}