import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSaveProfile, useCompleteOnboarding } from '../../hooks/useProfile'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { Separator } from '../../components/ui/separator'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'

type StepKey = 'score-band' | 'credit-cards' | 'account-details' | 'derogatory-marks' | 'missed-payments' | 'summary'

interface CardEntry {
  cardName: string
  creditLimit: string
  currentBalance: string
}

const scoreBands = [
  { value: 'poor', label: 'Poor (<580)' },
  { value: 'fair', label: 'Fair (580–669)' },
  { value: 'good', label: 'Good (670–739)' },
  { value: 'very_good', label: 'Very Good (740–799)' },
  { value: 'exceptional', label: 'Exceptional (800+)' },
]

const recencyOptions = [
  { value: 'none', label: 'None' },
  { value: 'within_6_months', label: 'Within last 6 months' },
  { value: '6_12_months', label: '6–12 months ago' },
  { value: '1_2_years', label: '1–2 years ago' },
  { value: '2_plus_years', label: '2+ years ago' },
]

const ageOptions = [
  { value: 'under_1_year', label: 'Under 1 year' },
  { value: '1_3_years', label: '1–3 years' },
  { value: '3_7_years', label: '3–7 years' },
  { value: '7_plus_years', label: '7+ years' },
]

const derogatoryOptions = [
  { value: 'collections', label: 'Collections' },
  { value: 'bankruptcy', label: 'Bankruptcy' },
  { value: 'foreclosure', label: 'Foreclosure' },
]

const creditMixOptions = [
  { value: 'credit_cards', label: 'Credit Cards' },
  { value: 'auto_loan', label: 'Auto Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'student_loan', label: 'Student Loan' },
]

const steps: { key: StepKey; title: string; description: string }[] = [
  { key: 'score-band', title: 'Score Band', description: 'Where do you think your credit stands?' },
  { key: 'credit-cards', title: 'Credit Cards', description: 'Tell us about your credit cards' },
  { key: 'account-details', title: 'Account Details', description: 'The bigger picture' },
  { key: 'derogatory-marks', title: 'Credit Health', description: 'Any negative marks or credit types?' },
  { key: 'missed-payments', title: 'Missed Payments', description: 'Payment history details' },
  { key: 'summary', title: 'Review', description: 'Review your credit profile' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const saveProfile = useSaveProfile()
  const completeOnboarding = useCompleteOnboarding()

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [error, setError] = useState<string | null>(null)

  const formRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const stepperRef = useRef<HTMLDivElement>(null)

  const [scoreBand, setScoreBand] = useState<string>('fair')
  const [cards, setCards] = useState<CardEntry[]>([{ cardName: '', creditLimit: '', currentBalance: '' }])
  const [totalAccounts, setTotalAccounts] = useState(1)
  const [oldestAccountAge, setOldestAccountAge] = useState<string>('1_3_years')
  const [hardInquiries, setHardInquiries] = useState(0)
  const [derogatoryMarks, setDerogatoryMarks] = useState<string[]>([])
  const [creditMix, setCreditMix] = useState<string[]>(['credit_cards'])
  const [missedPaymentCount, setMissedPaymentCount] = useState(0)
  const [missedPaymentRecency, setMissedPaymentRecency] = useState<string>('none')

  useGSAP(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current, {
        y: direction === 'forward' ? 20 : -20,
        duration: 0.35,
        ease: 'power2.out',
      })
    }
  }, { dependencies: [currentStep, direction], scope: formRef })

  useGSAP(() => {
    if (stepperRef.current) {
      gsap.from(stepperRef.current.children, {
        y: 10,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power2.out',
      })
    }
  }, { scope: stepperRef })

  useGSAP(() => {
    if (formRef.current) {
      gsap.from(formRef.current, {
        y: 15,
        duration: 0.4,
        ease: 'power2.out',
      })
    }
  }, { scope: formRef })

  const handleNext = () => {
    if (!validateStep()) return
    setDirection('forward')
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setDirection('backward')
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const validateStep = (): boolean => {
    setError(null)
    const step = steps[currentStep].key
    if (step === 'credit-cards') {
      const invalid = cards.some(c => !c.cardName || !c.creditLimit || !c.currentBalance)
      if (invalid) { setError('Please fill in all card details'); return false }
      if (cards.length === 0) { setError('Add at least one card'); return false }
    }
    if (step === 'account-details') {
      if (totalAccounts < 0) { setError('Total accounts must be 0 or more'); return false }
      if (hardInquiries < 0) { setError('Hard inquiries must be 0 or more'); return false }
    }
    return true
  }

  const addCard = () => {
    setCards([...cards, { cardName: '', creditLimit: '', currentBalance: '' }])
  }

  const removeCard = (index: number) => {
    if (cards.length <= 1) return
    setCards(cards.filter((_, i) => i !== index))
  }

  const updateCard = (index: number, field: keyof CardEntry, value: string) => {
    const updated = [...cards]
    updated[index] = { ...updated[index], [field]: value }
    setCards(updated)
  }

  const toggleDerogatory = (value: string) => {
    setDerogatoryMarks(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const toggleCreditMix = (value: string) => {
    setCreditMix(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const overallUtilisation = cards.reduce((acc, c) => {
    const limit = parseFloat(c.creditLimit) || 0
    const balance = parseFloat(c.currentBalance) || 0
    if (limit === 0) return acc
    return acc + (balance / limit) * 100
  }, 0) / Math.max(cards.filter(c => parseFloat(c.creditLimit) > 0).length, 1)

  const handleSubmit = async () => {
    setError(null)
    try {
      const result = await saveProfile.mutateAsync({
        scoreBand,
        missedPaymentCount,
        missedPaymentRecency,
        overallUtilisation: Math.round(overallUtilisation),
        oldestAccountAge,
        totalAccounts,
        hardInquiries12m: hardInquiries,
        derogatoryMarks,
        creditMix,
        cards: cards.map(c => ({
          cardName: c.cardName,
          creditLimit: c.creditLimit || '0',
          currentBalance: c.currentBalance || '0',
        })),
      })

      const roadmapActions = result.scoringResult?.roadmapActions
      if (roadmapActions && roadmapActions.length > 0) {
        await fetch('/api/roadmap/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actions: roadmapActions }),
        })
      }

      await completeOnboarding.mutateAsync()
      await queryClient.refetchQueries({ queryKey: ['session'] })
      navigate('/dashboard')
    } catch {
      setError('Failed to save your profile. Please try again.')
    }
  }

  const isPending = saveProfile.isPending || completeOnboarding.isPending

  const renderStep = () => {
    const step = steps[currentStep].key
    return (
      <div key={currentStep} ref={contentRef} className="space-y-8">
        {step === 'score-band' && (
          <div className="space-y-6 p-6">
            <Label className="text-base">Current Score Band</Label>
            <Select value={scoreBand} onValueChange={(v: string | null) => v && setScoreBand(v)}>
              <SelectTrigger className="w-full"><SelectValue>{scoreBands.find(b => b.value === scoreBand)?.label ?? 'Select your score band'}</SelectValue></SelectTrigger>
              <SelectContent>
                {scoreBands.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="font-body text-sm text-muted-foreground">
              This is the foundation for your personalised score estimate.
            </p>
          </div>
        )}

        {step === 'credit-cards' && (
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <Label className="text-base">Your Credit Cards</Label>
              <Button variant="ghost" size="sm" onClick={addCard} className="font-body text-xs">
                + Add card
              </Button>
            </div>
            {cards.map((card, i) => (
              <div key={i} className="space-y-4 rounded-lg border border-border p-5">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs font-medium text-muted-foreground">Card {i + 1}</span>
                  {cards.length > 1 && (
                    <button
                      onClick={() => removeCard(i)}
                      className="font-body text-xs text-[#c0392b] hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div>
                  <Label htmlFor={`card-name-${i}`}>Card Name</Label>
                  <Input
                    id={`card-name-${i}`}
                    value={card.cardName}
                    onChange={(e) => updateCard(i, 'cardName', e.target.value)}
                    placeholder="e.g. Chase Sapphire"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`limit-${i}`}>Credit Limit</Label>
                    <Input
                      id={`limit-${i}`}
                      type="number"
                      min="0"
                      value={card.creditLimit}
                      onChange={(e) => updateCard(i, 'creditLimit', e.target.value)}
                      placeholder="$5,000"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`balance-${i}`}>Current Balance</Label>
                    <Input
                      id={`balance-${i}`}
                      type="number"
                      min="0"
                      value={card.currentBalance}
                      onChange={(e) => updateCard(i, 'currentBalance', e.target.value)}
                      placeholder="$1,200"
                    />
                  </div>
                </div>
              </div>
            ))}
            {cards.filter(c => parseFloat(c.creditLimit) > 0).length > 0 && (
              <div className="rounded-lg bg-moss px-5 py-4">
                <p className="font-body text-xs text-muted-foreground">
                  Overall utilisation: <span className="font-medium text-foreground">{Math.round(overallUtilisation)}%</span>
                  {overallUtilisation > 30 && (
                    <span className="ml-1 text-[#d4a843]">(Aim for under 30%)</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {step === 'account-details' && (
          <div className="space-y-6 p-6">
            <div>
              <Label htmlFor="total-accounts" className="text-base">Total Number of Accounts</Label>
              <Input
                id="total-accounts"
                type="number"
                min="0"
                value={totalAccounts}
                onChange={(e) => setTotalAccounts(Number(e.target.value))}
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <Label htmlFor="oldest-account">Oldest Account Age</Label>
              <Select value={oldestAccountAge} onValueChange={(v: string | null) => v && setOldestAccountAge(v)}>
                <SelectTrigger id="oldest-account" className="w-full"><SelectValue>{ageOptions.find(o => o.value === oldestAccountAge)?.label ?? 'Select account age'}</SelectValue></SelectTrigger>
                <SelectContent>
                  {ageOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hard-inquiries">Hard Inquiries (last 12 months)</Label>
              <Input
                id="hard-inquiries"
                type="number"
                min="0"
                max="20"
                value={hardInquiries}
                onChange={(e) => setHardInquiries(Number(e.target.value))}
                placeholder="e.g., 2"
              />
            </div>
          </div>
        )}

        {step === 'derogatory-marks' && (
          <div className="space-y-6 p-6">
            <div>
              <Label className="text-base">Derogatory Marks (select all that apply)</Label>
              <div className="mt-2 space-y-2">
                {derogatoryOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={derogatoryMarks.includes(opt.value)}
                      onCheckedChange={() => toggleDerogatory(opt.value)}
                    />
                    <span className="font-body text-sm">{opt.label}</span>
                  </label>
                ))}
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={derogatoryMarks.length === 0}
                    onCheckedChange={() => setDerogatoryMarks([])}
                  />
                  <span className="font-body text-sm">None of the above</span>
                </label>
              </div>
            </div>
            <Separator />
            <div>
              <Label>Credit Mix (select account types you have)</Label>
              <div className="mt-2 space-y-2">
                {creditMixOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={creditMix.includes(opt.value)}
                      onCheckedChange={() => toggleCreditMix(opt.value)}
                    />
                    <span className="font-body text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'missed-payments' && (
          <div className="space-y-6 p-6">
            <div>
              <Label htmlFor="missed-count" className="text-base">Missed Payments (last 24 months)</Label>
              <Input
                id="missed-count"
                type="number"
                min="0"
                value={missedPaymentCount}
                onChange={(e) => setMissedPaymentCount(Number(e.target.value))}
                placeholder="e.g., 0"
              />
            </div>
            <div>
              <Label htmlFor="missed-recency">Most Recent Missed Payment</Label>
              <Select value={missedPaymentRecency} onValueChange={(v: string | null) => v && setMissedPaymentRecency(v)}>
                <SelectTrigger id="missed-recency" className="w-full"><SelectValue>{recencyOptions.find(o => o.value === missedPaymentRecency)?.label ?? 'Select recency'}</SelectValue></SelectTrigger>
                <SelectContent>
                  {recencyOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 'summary' && (
          <div className="space-y-6 p-6">
            <div className="rounded-lg bg-moss px-5 py-4">
              <p className="font-body text-xs text-muted-foreground">Score Band</p>
              <p className="mt-0.5 font-body text-sm font-medium text-foreground">
                {scoreBands.find(b => b.value === scoreBand)?.label ?? scoreBand}
              </p>
            </div>
            {cards.length > 0 && (
              <div className="rounded-lg bg-moss px-5 py-4">
                <p className="font-body text-xs text-muted-foreground">Cards ({cards.length})</p>
                <p className="mt-0.5 font-body text-sm font-medium text-foreground">
                  Utilisation: {Math.round(overallUtilisation)}% &middot; Total limit: $
                  {cards.reduce((s, c) => s + (parseFloat(c.creditLimit) || 0), 0).toLocaleString()}
                </p>
              </div>
            )}
            <div className="rounded-lg bg-moss px-5 py-4">
              <p className="font-body text-xs text-muted-foreground">Account Details</p>
              <p className="mt-0.5 font-body text-sm font-medium text-foreground">
                {totalAccounts} accounts &middot; Oldest: {ageOptions.find(o => o.value === oldestAccountAge)?.label ?? oldestAccountAge} &middot; {hardInquiries} inquiries
              </p>
            </div>
            <div className="rounded-lg bg-moss px-5 py-4">
              <p className="font-body text-xs text-muted-foreground">Credit Mix</p>
              <p className="mt-0.5 font-body text-sm font-medium text-foreground">
                {creditMix.length} type{creditMix.length !== 1 ? 's' : ''}: {creditMix.map(v => creditMixOptions.find(o => o.value === v)?.label ?? v).join(', ')}
              </p>
            </div>
            <div className="rounded-lg bg-moss px-5 py-4">
              <p className="font-body text-xs text-muted-foreground">Missed Payments</p>
              <p className="mt-0.5 font-body text-sm font-medium text-foreground">
                {missedPaymentCount} missed &middot; Most recent: {recencyOptions.find(o => o.value === missedPaymentRecency)?.label ?? missedPaymentRecency}
              </p>
            </div>
            {error && (
              <div className="rounded-lg bg-rose px-5 py-4" role="alert" aria-live="assertive">
                <p className="font-body text-sm text-[#c0392b]">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f2] py-16 px-4 md:px-8 lg:px-0">
      <div ref={formRef} className="w-full max-w-2xl lg:max-w-4xl">
        <div className="mb-12 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20 4C14.5 4 8 10 8 18C8 26 16 36 20 36C24 36 32 26 32 18C32 10 25.5 4 20 4Z" fill="rgba(74,124,89,0.2)" stroke="#4a7c59" strokeWidth="2"/>
              <path d="M20 12V24" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 18H26" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-heading text-2xl italic text-foreground">
              Score<span className="text-primary">Lift</span>
            </span>
          </div>
          <h1 className="font-heading text-4xl text-foreground">Build Your Credit Profile</h1>
          <p className="mt-2 font-body text-base text-muted-foreground">
            Tell us about your credit situation. All data is self-reported.
          </p>
        </div>

        <div ref={stepperRef} className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    i < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : i === currentStep
                        ? 'border-2 border-primary text-primary'
                        : 'border-2 border-border text-muted-foreground'
                  }`}
                >
                  {i < currentStep ? <Check className="size-4" /> : i + 1}
                </div>
                <span className={`mt-1.5 block text-xs ${i === currentStep ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-3">
            <div className="h-1 bg-border" />
            <div
              className="absolute left-0 top-0 h-1 bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-heading text-2xl text-foreground">{steps[currentStep].title}</h2>
          <p className="mt-1 font-body text-base text-muted-foreground">{steps[currentStep].description}</p>
        </div>

        {error && currentStep < steps.length - 1 && (
          <div className="mb-6 rounded-lg bg-rose px-5 py-4" role="alert" aria-live="assertive">
            <p className="font-body text-sm text-[#c0392b]">{error}</p>
          </div>
        )}

        {renderStep()}

        <div className="mt-10 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || isPending}
            className="font-body"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="font-body" disabled={isPending}>
              Next
              <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="font-body"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Building your profile...
                </>
              ) : (
                <>
                  <Check className="mr-2 size-4" />
                  Complete Profile
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}