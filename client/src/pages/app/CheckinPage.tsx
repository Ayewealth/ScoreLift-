import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useCheckinStatus, useSubmitCheckin } from '../../hooks/useCheckins'
import { useSession } from '../../hooks/useSession'
import { updateMeta } from '../../lib/seo'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Card } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { CalendarCheck, TrendingUp, Flame, Trophy, Sparkles, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'

gsap.registerPlugin(useGSAP)

const steps = [
  { id: 'start', title: 'Monthly Check-In' },
  { id: 'payments', title: 'Missed Payments' },
  { id: 'balances', title: 'Card Balances' },
  { id: 'changes', title: 'Other Changes' },
  { id: 'results', title: 'Results' },
]

export default function CheckinPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const { data: status, isLoading } = useCheckinStatus()
  const submitCheckin = useSubmitCheckin()
  const pageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const [missedPaymentCount, setMissedPaymentCount] = useState(0)
  const [missedPaymentRecency, setMissedPaymentRecency] = useState('none')
  const [cards, setCards] = useState<{ cardName: string; creditLimit: number; currentBalance: number }[]>([])
  const [newAccounts, setNewAccounts] = useState(0)
  const [newInquiries, setNewInquiries] = useState(0)

  useGSAP(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, { y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
    }
  }, { scope: pageRef })

  useGSAP(() => {
    if (contentRef.current && step > 0 && step < steps.length - 1) {
      gsap.from(contentRef.current.children, { opacity: 0, y: 10, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
    }
  }, { dependencies: [step], scope: contentRef })

  updateMeta({
    title: 'Monthly Check-In — ScoreLift',
    description: 'Update your credit information and track your monthly progress.',
  })

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await submitCheckin.mutateAsync({
        missedPaymentCount,
        missedPaymentRecency: missedPaymentRecency === 'none' && missedPaymentCount === 0 ? 'none' : missedPaymentRecency,
        cards: cards.length > 0 ? cards : undefined,
        newAccounts: newAccounts > 0 ? newAccounts : undefined,
        newInquiries: newInquiries > 0 ? newInquiries : undefined,
      })
      setResult(res)
      setStep(4)
      if (contentRef.current) {
        gsap.from(contentRef.current.children, { opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power2.out' })
      }
    } catch {
      /* handled by mutation */
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div ref={pageRef} className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!status?.dueForCheckin && step === 0) {
    return (
      <div ref={pageRef} className="space-y-6">
        <h1 className="font-heading text-3xl text-foreground">Monthly Check-In</h1>
        <Card className="p-8 text-center">
          <CalendarCheck className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 font-heading text-xl text-foreground">Already checked in</h2>
          {status && (
            <>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Your last check-in was {status.daysSinceLastCheckin} days ago.
                Your next check-in will be due in about {30 - (status.daysSinceLastCheckin ?? 0)} days.
              </p>
              <p className="mt-1 font-body text-sm text-primary font-medium">
                Streak: {status.streak} months {status.streak > 0 && <Flame className="inline size-3.5" />}
              </p>
            </>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button onClick={() => { setStep(1); window.scrollTo(0, 0) }}>
              Check in again early
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-heading text-3xl text-foreground">{steps[step].title}</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <div ref={contentRef}>
        {step === 0 && (
          <Card className="p-8">
            <CalendarCheck className="size-10 text-primary" />
            <h2 className="mt-4 font-heading text-xl text-foreground">Time for your monthly check-in</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              This only takes a few minutes. We'll ask about any changes to your credit situation,
              recalculate your score, and update your roadmap.
            </p>
            {status && status.streak > 0 && (
              <p className="mt-3 font-body text-sm text-primary font-medium">
                <Flame className="inline size-4 mr-1" />
                You're on a {status.streak}-month streak!
              </p>
            )}
            <Button onClick={() => setStep(1)} className="mt-6">
              Start Check-In
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-8 space-y-6">
            <h2 className="font-heading text-xl text-foreground">Any new missed payments?</h2>
            <p className="font-body text-sm text-muted-foreground">
              Have you missed any payments in the last month?
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="missedCount">Number of missed payments (last 24 months)</Label>
                <Input
                  id="missedCount"
                  type="number"
                  min={0}
                  max={20}
                  value={missedPaymentCount}
                  onChange={(e) => setMissedPaymentCount(Number(e.target.value))}
                />
              </div>
              {missedPaymentCount > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="missedRecency">When was the most recent missed payment?</Label>
                  <Select value={missedPaymentRecency} onValueChange={(v: string | null) => v && setMissedPaymentRecency(v)}>
                    <SelectTrigger id="missedRecency" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="within_6_months">Within the last 6 months</SelectItem>
                      <SelectItem value="6_12_months">6–12 months ago</SelectItem>
                      <SelectItem value="1_2_years">1–2 years ago</SelectItem>
                      <SelectItem value="2_plus_years">2+ years ago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button onClick={() => setStep(2)} className="w-full">
              Next
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-8 space-y-6">
            <h2 className="font-heading text-xl text-foreground">Updated card balances</h2>
            <p className="font-body text-sm text-muted-foreground">
              Have your credit card balances changed? Add your current cards below.
            </p>
            {cards.map((card, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <Label className="text-xs">Card name</Label>
                  <Input
                    value={card.cardName}
                    onChange={(e) => {
                      const next = [...cards]
                      next[i] = { ...next[i], cardName: e.target.value }
                      setCards(next)
                    }}
                    placeholder="e.g. Visa"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Limit</Label>
                  <Input
                    type="number"
                    value={card.creditLimit || ''}
                    onChange={(e) => {
                      const next = [...cards]
                      next[i] = { ...next[i], creditLimit: Number(e.target.value) }
                      setCards(next)
                    }}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Balance</Label>
                  <Input
                    type="number"
                    value={card.currentBalance || ''}
                    onChange={(e) => {
                      const next = [...cards]
                      next[i] = { ...next[i], currentBalance: Number(e.target.value) }
                      setCards(next)
                    }}
                    placeholder="1500"
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setCards([...cards, { cardName: '', creditLimit: 0, currentBalance: 0 }])}
              className="w-full"
            >
              + Add Card
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(3)}>Skip</Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Next
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-8 space-y-6">
            <h2 className="font-heading text-xl text-foreground">Other changes</h2>
            <p className="font-body text-sm text-muted-foreground">
              Any other credit changes this month?
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newAccounts">New accounts opened</Label>
                <Input
                  id="newAccounts"
                  type="number"
                  min={0}
                  max={10}
                  value={newAccounts}
                  onChange={(e) => setNewAccounts(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newInquiries">New hard inquiries</Label>
                <Input
                  id="newInquiries"
                  type="number"
                  min={0}
                  max={20}
                  value={newInquiries}
                  onChange={(e) => setNewInquiries(Number(e.target.value))}
                />
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || submitCheckin.isPending}
              className="w-full"
            >
              {submitting || submitCheckin.isPending ? (
                <>Calculating...</>
              ) : (
                <>Submit Check-In <CheckCircle2 className="ml-2 size-4" /></>
              )}
            </Button>
          </Card>
        )}

        {step === 4 && result && (
          <div className="space-y-6">
            <Card className="p-8 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-moss">
                {result.delta >= 0 ? (
                  <TrendingUp className="size-8 text-primary" />
                ) : (
                  <TrendingUp className="size-8 text-amber-500 rotate-180" />
                )}
              </div>
              <h2 className="mt-4 font-heading text-2xl text-foreground">Check-in complete</h2>
              <p className="mt-2 font-body text-lg text-muted-foreground">
                Your estimated score
              </p>
              <p className="font-heading text-5xl text-primary">{result.newScore}</p>
              <p className={`mt-1 font-body text-sm font-medium ${result.delta >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {result.delta >= 0 ? '+' : ''}{result.delta} points this month
              </p>
              {result.streak > 0 && (
                <p className="mt-3 font-body text-sm text-muted-foreground">
                  <Flame className="inline size-4 mr-1" />
                  {result.streak}-month streak
                </p>
              )}
              {result.newlyUnlocked.length > 0 && (
                <div className="mt-4 rounded-lg bg-moss p-4">
                  <Sparkles className="mx-auto size-5 text-amber" />
                  <p className="mt-1 font-body text-sm font-medium text-foreground">
                    New milestone unlocked!
                  </p>
                </div>
              )}
            </Card>

            {result.factorHealth && (
              <Card className="p-6">
                <h3 className="font-heading text-lg text-foreground">Factor breakdown</h3>
                <div className="mt-4 space-y-3">
                  {result.factorHealth.map((f: any) => (
                    <div key={f.factor} className="flex items-center justify-between">
                      <span className="font-body text-sm text-foreground">{f.label}</span>
                      <span className={`font-body text-xs font-medium ${
                        f.status === 'excellent' || f.status === 'good' ? 'text-primary' : 'text-amber'
                      }`}>
                        {f.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate('/roadmap')} className="flex-1">
                View Roadmap
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}