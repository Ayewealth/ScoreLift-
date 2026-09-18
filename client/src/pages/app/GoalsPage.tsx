import { useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useGoals, useGoalProgress, useCreateGoal, useDeleteGoal, useReadiness } from '../../hooks/useGoals'
import { updateMeta } from '../../lib/seo'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Card } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Target, CheckCircle2, AlertCircle, Trash2, Plus, TrendingUp, Home, CreditCard, Car, Banknote } from 'lucide-react'

gsap.registerPlugin(useGSAP)

const scoreBands = [
  { value: 'poor', label: 'Poor (<580)' },
  { value: 'fair', label: 'Fair (580–669)' },
  { value: 'good', label: 'Good (670–739)' },
  { value: 'very_good', label: 'Very Good (740–799)' },
  { value: 'exceptional', label: 'Exceptional (800+)' },
]

const purposeIcons: Record<string, typeof Home> = {
  mortgage: Home,
  car_finance: Car,
  credit_card: CreditCard,
  personal_loan: Banknote,
}

export default function GoalsPage() {
  const { data: goalsData, isLoading: goalsLoading } = useGoals()
  const { data: progress } = useGoalProgress()
  const { data: readiness } = useReadiness()
  const createGoal = useCreateGoal()
  const deleteGoal = useDeleteGoal()
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [showForm, setShowForm] = useState(false)

  const [targetBand, setTargetBand] = useState('good')
  const [targetDate, setTargetDate] = useState('')
  const [purpose, setPurpose] = useState('')

  useGSAP(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, { y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
    }
  }, { scope: pageRef })

  useGSAP(() => {
    if (formRef.current && showForm) {
      gsap.from(formRef.current, { opacity: 0, y: 10, duration: 0.4, ease: 'power2.out' })
    }
  }, { dependencies: [showForm], scope: formRef })

  updateMeta({
    title: 'Goals — ScoreLift',
    description: 'Set and track your credit score improvement goals.',
  })

  const handleCreate = async () => {
    try {
      await createGoal.mutateAsync({
        targetScoreBand: targetBand,
        targetDate,
        purpose: purpose || undefined,
      })
      setShowForm(false)
      setTargetBand('good')
      setTargetDate('')
      setPurpose('')
    } catch {
      /* handled */
    }
  }

  if (goalsLoading) {
    return (
      <div ref={pageRef} className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const activeGoal = goalsData?.goals?.find(g => g.isActive)

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-foreground">Goals</h1>
        <Button onClick={() => setShowForm(!showForm)} disabled={!!activeGoal && !showForm}>
          <Plus className="mr-1 size-4" />
          {activeGoal && !showForm ? 'Goal active' : 'New Goal'}
        </Button>
      </div>

      {showForm && (
        <Card ref={formRef} className="p-6 space-y-4">
          <h2 className="font-heading text-lg text-foreground">Create a goal</h2>
          <div className="space-y-2">
            <Label htmlFor="targetBand">Target score band</Label>
            <Select value={targetBand} onValueChange={(v: string | null) => v && setTargetBand(v)}>
              <SelectTrigger id="targetBand" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {scoreBands.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target date</Label>
            <Input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose (optional)</Label>
            <Select value={purpose} onValueChange={(v: string | null) => v !== null && setPurpose(v)}>
              <SelectTrigger id="purpose" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific purpose</SelectItem>
                <SelectItem value="mortgage">Mortgage application</SelectItem>
                <SelectItem value="car_finance">Car finance</SelectItem>
                <SelectItem value="credit_card">Credit card application</SelectItem>
                <SelectItem value="personal_loan">Personal loan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createGoal.isPending || !targetDate}>
              {createGoal.isPending ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </Card>
      )}

      {progress?.goal && (
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-heading text-lg text-foreground">
                {scoreBands.find(b => b.value === progress.goal!.targetScoreBand)?.label}
              </h2>
              {progress.goal.purpose && (
                <p className="mt-1 font-body text-sm text-muted-foreground capitalize">
                  Purpose: {progress.goal.purpose.replace('_', ' ')}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-heading text-3xl text-primary">{progress.progress}%</p>
              <p className="font-body text-xs text-muted-foreground">
                Target: {new Date(progress.goal.targetDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-moss">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress.progress}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-moss p-3">
              <p className="font-body text-xs text-muted-foreground">Current score</p>
              <p className="font-heading text-lg text-foreground">{progress.currentScore}</p>
            </div>
            <div className="rounded-lg bg-moss p-3">
              <p className="font-body text-xs text-muted-foreground">Need per month</p>
              <p className="font-heading text-lg text-foreground">+{progress.neededPerMonth}</p>
            </div>
          </div>

          <div className={`mt-4 flex items-center gap-2 rounded-lg p-3 ${progress.onTrack ? 'bg-moss' : 'bg-[#fae8e8]'}`}>
            {progress.onTrack ? (
              <CheckCircle2 className="size-5 text-primary shrink-0" />
            ) : (
              <AlertCircle className="size-5 text-destructive shrink-0" />
            )}
            <p className={`font-body text-sm ${progress.onTrack ? 'text-foreground' : 'text-destructive'}`}>
              {progress.onTrack
                ? 'You\'re on track to reach your goal!'
                : 'You may need to extend your target date or focus on higher-impact actions.'}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteGoal.mutate(progress.goal!.id)}
            className="mt-4"
          >
            <Trash2 className="mr-1 size-3.5" />
            Delete Goal
          </Button>
        </Card>
      )}

      {!activeGoal && !showForm && (
        <Card className="p-8 text-center">
          <Target className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-3 font-heading text-lg text-foreground">No active goal</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Set a target score and date to track your progress.
          </p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            Create Your Goal
          </Button>
        </Card>
      )}

      {readiness && (
        <Card className="p-6">
          <h2 className="font-heading text-lg text-foreground">Product Readiness Checker</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            See how close you are to typical lender requirements.
          </p>
          <div className="mt-4 space-y-3">
            {readiness.readiness.map((item) => {
              const Icon = purposeIcons[item.purpose] ?? Target
              return (
                <div
                  key={item.purpose}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-5 text-primary" />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{item.label}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        Min score: {item.minScore}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-body text-sm font-medium ${item.ready ? 'text-primary' : 'text-amber'}`}>
                      {item.ready ? 'Ready' : `${item.gap} pts away`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}