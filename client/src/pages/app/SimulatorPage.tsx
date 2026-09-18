import { useState, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSession } from '../../hooks/useSession'
import { useCalculateSimulation, useSaveScenario, useSimulatorScenarios, useDeleteScenario } from '../../hooks/useSimulator'
import { updateMeta } from '../../lib/seo'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Sliders, Save, Trash2, TrendingUp, TrendingDown, BarChart3, Sparkles, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent'

gsap.registerPlugin(useGSAP)

const scoreBandValues: Record<string, number> = {
  poor: 500,
  fair: 620,
  good: 700,
  very_good: 770,
  exceptional: 825,
}

function getScoreBand(score: number): string {
  if (score < 580) return 'poor'
  if (score < 670) return 'fair'
  if (score < 740) return 'good'
  if (score < 800) return 'very_good'
  return 'exceptional'
}

function getScoreBandLabel(band: string): string {
  const labels: Record<string, string> = {
    poor: 'Poor (<580)',
    fair: 'Fair (580–669)',
    good: 'Good (670–739)',
    very_good: 'Very Good (740–799)',
    exceptional: 'Exceptional (800+)',
  }
  return labels[band] ?? band
}

interface SimInput {
  scoreBand: string
  missedPaymentCount: number
  missedPaymentRecency: string
  overallUtilisation: number
  oldestAccountAge: string
  totalAccounts: number
  hardInquiries12m: number
  derogatoryMarks: string[]
  creditMix: string[]
}

function runClientScore(input: SimInput): { estimatedScore: number; factorHealth: any[]; delta: number } {
  const baselineScore = scoreBandValues[input.scoreBand] ?? 620

  const paymentScore = input.missedPaymentCount === 0 ? 60
    : input.missedPaymentRecency === 'within_6_months' ? -60
    : input.missedPaymentRecency === '6_12_months' ? -60
    : input.missedPaymentRecency === '1_2_years' ? -40
    : input.missedPaymentRecency === '2_plus_years' ? -20
    : 0

  const derogScore = input.derogatoryMarks.reduce((s, m) => {
    return s + (m === 'bankruptcy' ? -150 : m === 'foreclosure' ? -100 : m === 'collections' ? -60 : 0)
  }, 0)

  const utilisScore = input.overallUtilisation < 10 ? 50
    : input.overallUtilisation < 30 ? 20
    : input.overallUtilisation < 50 ? 0
    : input.overallUtilisation < 75 ? -30
    : -60

  const ageScore = input.oldestAccountAge === '7_plus_years' ? 30
    : input.oldestAccountAge === '3_7_years' ? 15
    : input.oldestAccountAge === '1_3_years' ? 0
    : -20

  const mixTypes = input.creditMix.length
  const mixScore = mixTypes >= 3 ? 20 : mixTypes >= 2 ? 10 : 0

  const inquiryKey = input.hardInquiries12m === 0 ? 10
    : input.hardInquiries12m <= 2 ? 0
    : input.hardInquiries12m <= 4 ? -15
    : -30

  const totalAdjustment = paymentScore + derogScore + utilisScore + ageScore + mixScore + inquiryKey
  const estimatedScore = Math.max(300, Math.min(850, Math.round(baselineScore + totalAdjustment)))

  const factorHealth = [
    { factor: 'payment_history', label: 'Payment History', weight: 35, status: paymentScore >= 50 ? 'excellent' : paymentScore >= 0 ? 'good' : 'needs_work', score: paymentScore, maxScore: 60 },
    { factor: 'credit_utilisation', label: 'Credit Utilisation', weight: 30, status: utilisScore >= 20 ? 'good' : utilisScore >= 0 ? 'needs_work' : 'critical', score: utilisScore, maxScore: 50 },
    { factor: 'account_age', label: 'Account Age', weight: 15, status: ageScore >= 15 ? 'good' : 'needs_work', score: ageScore, maxScore: 30 },
    { factor: 'credit_mix', label: 'Credit Mix', weight: 10, status: mixScore >= 10 ? 'good' : 'needs_work', score: mixScore, maxScore: 20 },
    { factor: 'new_inquiries', label: 'New Inquiries', weight: 10, status: inquiryKey >= 0 ? 'excellent' : 'good', score: inquiryKey, maxScore: 10 },
  ]

  return { estimatedScore, factorHealth, delta: 0 }
}

const presets: { label: string; apply: (input: SimInput) => SimInput }[] = [
  {
    label: 'Pay off one card',
    apply: (input) => ({ ...input, overallUtilisation: Math.max(0, input.overallUtilisation - 15) }),
  },
  {
    label: 'Pay off all cards',
    apply: (input) => ({ ...input, overallUtilisation: 0 }),
  },
  {
    label: 'Open a new card',
    apply: (input) => ({ ...input, totalAccounts: input.totalAccounts + 1, hardInquiries12m: input.hardInquiries12m + 1, oldestAccountAge: '1_3_years' }),
  },
  {
    label: 'Miss a payment',
    apply: (input) => ({ ...input, missedPaymentCount: input.missedPaymentCount + 1, missedPaymentRecency: 'within_6_months' }),
  },
  {
    label: 'Get limit increase',
    apply: (input) => ({ ...input, overallUtilisation: Math.round(input.overallUtilisation / 2) }),
  },
  {
    label: 'Close an old account',
    apply: (input) => ({ ...input, totalAccounts: Math.max(1, input.totalAccounts - 1), oldestAccountAge: '1_3_years' }),
  },
]

const DefaultInput: SimInput = {
  scoreBand: 'fair',
  missedPaymentCount: 0,
  missedPaymentRecency: 'none',
  overallUtilisation: 30,
  oldestAccountAge: '3_7_years',
  totalAccounts: 5,
  hardInquiries12m: 1,
  derogatoryMarks: [],
  creditMix: ['credit_cards', 'auto_loan'],
}

export default function SimulatorPage() {
  const { data: session } = useSession()
  const { data: scenariosData } = useSimulatorScenarios()
  const calculate = useCalculateSimulation()
  const saveScenario = useSaveScenario()
  const deleteScenario = useDeleteScenario()
  const pageRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState<SimInput>(DefaultInput)
  const [result, setResult] = useState(() => runClientScore(DefaultInput))
  const [saveName, setSaveName] = useState('')

  useGSAP(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, { y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
    }
  }, { scope: pageRef })

  useGSAP(() => {
    if (scoreRef.current) {
      gsap.from(scoreRef.current, { scale: 0.8, opacity: 0, duration: 0.5, ease: 'power2.out' })
    }
  }, { dependencies: [result.estimatedScore], scope: scoreRef })

  updateMeta({ title: 'Score Simulator — ScoreLift', description: 'Simulate how different actions could affect your credit score.' })

  const recalculate = useCallback((newInput: SimInput) => {
    const r = runClientScore(newInput)
    setResult(r)
    setInput(newInput)
  }, [])

  const applyPreset = (preset: typeof presets[0]) => {
    const newInput = preset.apply(input)
    recalculate(newInput)
  }

  const handleSave = async () => {
    if (!saveName.trim()) return
    try {
      await saveScenario.mutateAsync({
        name: saveName,
        inputOverrides: input as any,
        estimatedDelta: result.estimatedScore,
      })
      setSaveName('')
    } catch {
      /* handled */
    }
  }

  const band = getScoreBand(result.estimatedScore)
  const scenarios = scenariosData?.scenarios ?? []

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-foreground">Score Simulator</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6 space-y-5">
            <h2 className="font-heading text-lg text-foreground flex items-center gap-2">
              <Sliders className="size-4 text-primary" />
              Adjustments
            </h2>

            <div className="space-y-2">
              <Label>Credit utilisation: {input.overallUtilisation}%</Label>
              <input
                type="range"
                min={0}
                max={100}
                value={input.overallUtilisation}
                onChange={(e) => recalculate({ ...input, overallUtilisation: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Missed payments: {input.missedPaymentCount}</Label>
              <input
                type="range"
                min={0}
                max={6}
                value={input.missedPaymentCount}
                onChange={(e) => recalculate({ ...input, missedPaymentCount: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-2">
              <Label>Hard inquiries: {input.hardInquiries12m}</Label>
              <input
                type="range"
                min={0}
                max={10}
                value={input.hardInquiries12m}
                onChange={(e) => recalculate({ ...input, hardInquiries12m: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-2">
              <Label>Account age</Label>
              <select
                value={input.oldestAccountAge}
                onChange={(e) => recalculate({ ...input, oldestAccountAge: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 font-body text-sm text-foreground"
              >
                <option value="under_1_year">Under 1 year</option>
                <option value="1_3_years">1-3 years</option>
                <option value="3_7_years">3-7 years</option>
                <option value="7_plus_years">7+ years</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Total accounts: {input.totalAccounts}</Label>
              <input
                type="range"
                min={1}
                max={20}
                value={input.totalAccounts}
                onChange={(e) => recalculate({ ...input, totalAccounts: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-heading text-sm text-foreground">Quick presets</h3>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="rounded-full bg-moss px-3 py-1.5 font-body text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-heading text-sm text-foreground">Save scenario</h3>
            <div className="flex gap-2">
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Scenario name"
                className="flex-1"
              />
              <Button size="sm" onClick={handleSave} disabled={!saveName.trim() || saveScenario.isPending}>
                <Save className="size-4" />
              </Button>
            </div>
            {scenarios.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                <span className="font-body text-xs text-foreground">{s.name}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteScenario.mutate(s.id)}>
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div ref={scoreRef} className="rounded-xl bg-card p-8 text-center shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
            <p className="font-body text-sm text-muted-foreground">Estimated score</p>
            <p className="font-heading text-6xl text-primary">{result.estimatedScore}</p>
            <p className="mt-1 font-body text-sm text-muted-foreground">{getScoreBandLabel(band)}</p>
          </div>

          <Card className="p-6">
            <h3 className="font-heading text-lg text-foreground">Factor breakdown</h3>
            <div className="mt-4 space-y-3">
              {result.factorHealth.map((f) => (
                <div key={f.factor} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {f.score >= 0 ? (
                      <TrendingUp className="size-4 text-primary" />
                    ) : (
                      <TrendingDown className="size-4 text-amber" />
                    )}
                    <span className="font-body text-sm text-foreground">{f.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-xs text-muted-foreground">{f.score}/{f.maxScore}</span>
                    <span className={`font-body text-xs font-medium ${
                      f.status === 'excellent' || f.status === 'good' ? 'text-primary' : f.status === 'needs_work' ? 'text-amber' : 'text-destructive'
                    }`}>
                      {f.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-heading text-lg text-foreground">Impact Timeline (6-month projection)</h3>
            <div className="mt-4 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={Array.from({ length: 6 }).map((_, i) => {
                  const variance = (i === 0 ? 0 : Math.sin(i * 0.8) * 15)
                  const projected = result.estimatedScore + (i * 3) + variance
                  return { month: `M${i + 1}`, projected: Math.max(300, Math.min(850, Math.round(projected))) }
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e6dd" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6a7a65', fontFamily: 'Outfit' }} stroke="#e8e6dd" />
                  <YAxis domain={[300, 850]} tick={{ fontSize: 11, fill: '#6a7a65', fontFamily: 'Outfit' }} stroke="#e8e6dd" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e8e6dd', fontSize: '13px', fontFamily: 'Outfit' }} />
                  <Line type="monotone" dataKey="projected" stroke="#4a7c59" strokeWidth={2} dot={{ fill: '#4a7c59', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}