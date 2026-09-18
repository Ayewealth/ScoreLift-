import { useQuery } from '@tanstack/react-query'
import { useSession } from '../../../hooks/useSession'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { Skeleton } from '../../../components/ui/skeleton'
import { CheckCircle2, XCircle, FileDown, ExternalLink, ArrowUpRight, CreditCard, CalendarDays, ShieldCheck, Sparkles, Plus } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Get started with the basics',
    features: [
      'Credit profile & basic factor dashboard',
      '1 simulator scenario',
      'All public calculators',
      '5 document uploads',
    ],
    popular: false,
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: '$9.99',
    period: '/mo',
    description: 'Full toolkit for serious credit building',
    features: [
      'Full personalised roadmap',
      'Unlimited simulator scenarios',
      'Monthly check-ins with streak tracking',
      'Goal tracker with progress ring',
      'Dispute letter generator',
      'Unlimited document uploads',
      'Education centre with quizzes & badges',
      'Milestone emails & weekly digest',
    ],
    popular: true,
  },
  {
    id: 'pro_annual',
    name: 'Annual Pro',
    price: '$89',
    period: '/yr',
    description: 'Best value — save $29.88 per year',
    features: [
      'Everything in Pro',
      '$7.42/mo equivalent',
      'Second credit goal (exclusive)',
    ],
    popular: false,
  },
]

const ALL_FEATURES = [
  { name: 'Credit Profile & Dashboard', free: true, pro: true, annual: true },
  { name: 'Public Calculators', free: true, pro: true, annual: true },
  { name: 'Personalised Roadmap', free: false, pro: true, annual: true },
  { name: 'Simulator Scenarios', free: '1', pro: 'Unlimited', annual: 'Unlimited' },
  { name: 'Monthly Check-Ins', free: false, pro: true, annual: true },
  { name: 'Goal Tracker', free: false, pro: true, annual: true },
  { name: 'Dispute Letter Generator', free: false, pro: true, annual: true },
  { name: 'Document Uploads', free: '5', pro: 'Unlimited', annual: 'Unlimited' },
  { name: 'Education Centre', free: false, pro: true, annual: true },
  { name: 'Milestones & Achievements', free: false, pro: true, annual: true },
  { name: 'Weekly Digest', free: false, pro: true, annual: true },
  { name: 'Second Credit Goal', free: false, pro: false, annual: true },
]

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'usd', minimumFractionDigits: 2 }).format(amount / 100)
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-[#eaf0e8] text-[#4a7c59]' },
    past_due: { label: 'Past Due', className: 'bg-[#fae8e8] text-[#c0392b]' },
    canceled: { label: 'Canceled', className: 'bg-[#f5f0e0] text-[#d4a843]' },
    unpaid: { label: 'Unpaid', className: 'bg-[#fae8e8] text-[#c0392b]' },
    trialing: { label: 'Trial', className: 'bg-[#eaf0e8] text-[#4a7c59]' },
    incomplete: { label: 'Incomplete', className: 'bg-[#f5f0e0] text-[#d4a843]' },
    free: { label: 'Free', className: 'bg-[#eaf0e8] text-[#6a7a65]' },
  }
  const c = config[status] ?? { label: status, className: 'bg-muted text-muted-foreground' }
  return <Badge className={`font-body text-[11px] ${c.className}`}>{c.label}</Badge>
}

export default function BillingPage() {
  const { data: session } = useSession()

  const subscriptionStatus = useQuery({
    queryKey: ['stripe', 'status', session?.user.id],
    queryFn: async () => {
      const res = await fetch('/api/stripe/status')
      if (!res.ok) throw new Error('Failed to fetch subscription status')
      return res.json() as Promise<{
        local: { status: string; plan: string | null }
        direct: { status: string; plan: string | null; currentPeriodEnd: number } | null
      }>
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 15,
  })

  const invoices = useQuery({
    queryKey: ['stripe', 'invoices', session?.user.id],
    queryFn: async () => {
      const res = await fetch('/api/stripe/invoices')
      if (!res.ok) return []
      return res.json() as Promise<Array<{
        id: string
        number: string | null
        amountPaid: number
        currency: string
        status: string
        created: number
        pdfUrl: string | null
        paid: boolean
      }>>
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 15,
  })

  const prices = useQuery({
    queryKey: ['stripe', 'prices'],
    queryFn: async () => {
      const res = await fetch('/api/stripe/prices')
      if (!res.ok) throw new Error('Failed to fetch prices')
      return res.json() as Promise<{ proMonthly: string; proAnnual: string }>
    },
    staleTime: Infinity,
  })

  const createPortal = async () => {
    const res = await fetch('/api/stripe/portal')
    if (!res.ok) return
    const { url } = await res.json()
    window.location.href = url
  }

  const createCheckout = async (priceId: string) => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    if (!res.ok) return
    const { url } = await res.json()
    window.location.href = url
  }

  const status = subscriptionStatus.data?.local.status ?? 'free'
  const plan = subscriptionStatus.data?.local.plan
  const currentPlanName = status === 'active' ? (plan === 'pro_annual' ? 'Annual Pro' : 'Pro') : 'Free'
  const currentPeriodEnd = subscriptionStatus.data?.direct?.currentPeriodEnd
  const isOnPaidPlan = status === 'active' || status === 'trialing'

  const loading = subscriptionStatus.isLoading
  const priceIds = {
    pro_monthly: prices.data?.proMonthly ?? 'price_pro_monthly',
    pro_annual: prices.data?.proAnnual ?? 'price_pro_annual',
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="font-heading text-3xl text-[#2d3a2a]">Billing</h1>
        <p className="mt-1 font-body text-base text-[#6a7a65]">Manage your subscription, view invoices, and compare plans</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border border-[#e8e6dd] bg-white p-0 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
            <div className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-6 text-[#4a7c59]" />
                    <h2 className="font-heading text-xl text-[#2d3a2a]">Current Plan</h2>
                  </div>
                  <div className="mt-4 flex flex-wrap items-baseline gap-2">
                    <span className="font-heading text-3xl text-[#2d3a2a]">{currentPlanName}</span>
                    <StatusBadge status={status} />
                  </div>
                  <p className="mt-2 font-body text-sm text-[#6a7a65]">
                    {isOnPaidPlan
                      ? `Your plan renews ${currentPeriodEnd ? formatDate(currentPeriodEnd) : '—'}`
                      : 'You are currently on the Free plan.'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {isOnPaidPlan ? (
                    <Button onClick={createPortal} variant="outline" className="font-body text-sm">
                      <ExternalLink className="mr-2 size-4" />
                      Manage in Stripe
                    </Button>
                  ) : (
                    <Button onClick={() => createCheckout(priceIds.pro_monthly)} className="font-body text-sm bg-[#4a7c59] hover:bg-[#3d6b4d] text-white">
                      <Sparkles className="mr-2 size-4" />
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </div>

              <Separator className="my-6 bg-[#e8e6dd]" />

              <div>
                <h3 className="font-heading text-base text-[#2d3a2a]">Plan Features</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PLANS.find(p => p.name === currentPlanName)?.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#4a7c59]" />
                      <span className="font-body text-sm text-[#2d3a2a]">{feat}</span>
                    </div>
                  ))}
                  {status === 'free' && (
                    <>
                      <div className="flex items-start gap-2.5">
                        <XCircle className="mt-0.5 size-4 shrink-0 text-[#6a7a65]" />
                        <span className="font-body text-sm text-[#6a7a65]">Personalised roadmap</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <XCircle className="mt-0.5 size-4 shrink-0 text-[#6a7a65]" />
                        <span className="font-body text-sm text-[#6a7a65]">Monthly check-ins</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <XCircle className="mt-0.5 size-4 shrink-0 text-[#6a7a65]" />
                        <span className="font-body text-sm text-[#6a7a65]">Dispute letter generator</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <XCircle className="mt-0.5 size-4 shrink-0 text-[#6a7a65]" />
                        <span className="font-body text-sm text-[#6a7a65]">Unlimited documents</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isOnPaidPlan && currentPeriodEnd && (
                <>
                  <Separator className="my-6 bg-[#e8e6dd]" />
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-[#6a7a65]" />
                      <div>
                        <p className="font-body text-xs text-[#6a7a65]">Current period ends</p>
                        <p className="font-body text-sm font-medium text-[#2d3a2a]">{formatDate(currentPeriodEnd)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-[#6a7a65]" />
                      <div>
                        <p className="font-body text-xs text-[#6a7a65]">Status</p>
                        <p className="font-body text-sm font-medium capitalize text-[#2d3a2a]">{status.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4 text-[#6a7a65]" />
                      <div>
                        <p className="font-body text-xs text-[#6a7a65]">Plan</p>
                        <p className="font-body text-sm font-medium text-[#2d3a2a]">{currentPlanName}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="rounded-xl border border-[#e8e6dd] bg-white p-0 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
            <div className="p-8">
              <div className="flex items-center gap-3">
                <FileDown className="size-6 text-[#4a7c59]" />
                <h2 className="font-heading text-xl text-[#2d3a2a]">Invoice History</h2>
              </div>
              <p className="mt-1 font-body text-sm text-[#6a7a65]">View and download past invoices</p>

              <div className="mt-6 overflow-x-auto">
                {invoices.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : invoices.data && invoices.data.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#e8e6dd] font-body text-xs font-medium uppercase tracking-wider text-[#6a7a65]">
                        <th className="pb-3 pr-4">Invoice</th>
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Amount</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 text-right">Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.data.map((inv) => (
                        <tr key={inv.id} className="border-b border-[#e8e6dd]/60 last:border-0 transition-colors hover:bg-[#faf8f2]">
                          <td className="py-3 pr-4">
                            <span className="font-body text-sm text-[#2d3a2a]">{inv.number ?? inv.id.slice(0, 12)}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-body text-sm text-[#6a7a65]">{formatDate(inv.created)}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-body text-sm font-medium text-[#2d3a2a]">{formatCurrency(inv.amountPaid, inv.currency)}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="py-3 text-right">
                            {inv.pdfUrl ? (
                              <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-body text-sm text-[#4a7c59] hover:text-[#3d6b4d] transition-colors">
                                PDF
                                <FileDown className="size-3.5" />
                              </a>
                            ) : (
                              <span className="font-body text-sm text-[#6a7a65]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="rounded-lg bg-[#faf8f2] py-10 text-center">
                    <FileDown className="mx-auto size-8 text-[#6a7a65]" />
                    <p className="mt-2 font-body text-sm text-[#6a7a65]">No invoices yet. Invoices appear after your first payment.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {!isOnPaidPlan && (
            <Card className="rounded-xl border border-[#4a7c59]/30 bg-white p-0 shadow-[0_2px_24px_rgba(74,124,89,0.12)]">
              <div className="p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-[#4a7c59]" />
                  <h3 className="font-heading text-base text-[#2d3a2a]">Upgrade to Pro</h3>
                </div>
                <p className="mt-2 font-body text-sm text-[#6a7a65]">
                  Unlock the full toolkit: personalised roadmap, unlimited simulations, dispute letters, and more.
                </p>
                <div className="mt-4 space-y-2">
                  <Button
                    onClick={() => createCheckout(priceIds.pro_monthly)}
                    className="w-full font-body text-sm bg-[#4a7c59] hover:bg-[#3d6b4d] text-white"
                  >
                    <ArrowUpRight className="mr-2 size-4" />
                    Upgrade — $9.99/mo
                  </Button>
                  <Button
                    onClick={() => createCheckout(priceIds.pro_annual)}
                    variant="outline"
                    className="w-full font-body text-sm border-[#4a7c59] text-[#4a7c59] hover:bg-[#eaf0e8]"
                  >
                    <Plus className="mr-2 size-4" />
                    Annual Pro — $89/yr (save $29.88)
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card className="rounded-xl border border-[#e8e6dd] bg-white p-0 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
            <div className="p-6">
              <h3 className="font-heading text-base text-[#2d3a2a]">Payment Method</h3>
              <p className="mt-1 font-body text-sm text-[#6a7a65]">
                {isOnPaidPlan
                  ? 'Manage your payment method through the Stripe Customer Portal.'
                  : 'No payment method required on the Free plan.'}
              </p>
              {isOnPaidPlan && (
                <Button onClick={createPortal} variant="outline" size="sm" className="mt-4 font-body text-sm">
                  <CreditCard className="mr-2 size-4" />
                  Update Payment Method
                </Button>
              )}
            </div>
          </Card>

          <Card className="rounded-xl border border-[#e8e6dd] bg-white p-0 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
            <div className="p-6">
              <h3 className="font-heading text-base text-[#2d3a2a]">Need Help?</h3>
              <p className="mt-1 font-body text-sm text-[#6a7a65]">
                Visit the Stripe Customer Portal to update your payment method, view detailed billing history, or cancel your subscription.
              </p>
              {isOnPaidPlan && (
                <Button onClick={createPortal} variant="outline" size="sm" className="mt-4 font-body text-sm">
                  <ExternalLink className="mr-2 size-4" />
                  Open Customer Portal
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card className="rounded-xl border border-[#e8e6dd] bg-white p-0 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
        <div className="p-8">
          <h2 className="font-heading text-xl text-[#2d3a2a]">Compare Plans</h2>
          <p className="mt-1 font-body text-sm text-[#6a7a65]">Find the plan that is right for you</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {PLANS.map((p) => {
              const isCurrentPlan = (status === 'active' && plan === p.id) || (status === 'free' && p.id === 'free')
              return (
                <div
                  key={p.id}
                  className={`relative rounded-xl border bg-white p-6 transition-shadow ${
                    p.popular ? 'border-[#4a7c59] shadow-[0_2px_24px_rgba(74,124,89,0.12)]' : 'border-[#e8e6dd] shadow-sm'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#4a7c59] px-3 py-0.5 font-body text-[11px] font-medium text-white">
                      Most Popular
                    </span>
                  )}
                  <div className="mt-1">
                    <h3 className="font-heading text-lg text-[#2d3a2a]">{p.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-heading text-3xl text-[#2d3a2a]">{p.price}</span>
                      <span className="font-body text-sm text-[#6a7a65]">{p.period}</span>
                    </div>
                    <p className="mt-1 font-body text-xs text-[#6a7a65]">{p.description}</p>
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#4a7c59]" />
                        <span className="font-body text-sm text-[#2d3a2a]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    {isCurrentPlan && status !== 'free' ? (
                      <Button disabled className="w-full font-body text-sm bg-[#eaf0e8] text-[#4a7c59] cursor-default">
                        Current Plan
                      </Button>
                    ) : p.id === 'free' ? (
                      <Button disabled className="w-full font-body text-sm bg-[#eaf0e8] text-[#6a7a65] cursor-default">
                        {isCurrentPlan ? 'Current Plan' : 'Free'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => createCheckout(p.id === 'pro_annual' ? priceIds.pro_annual : priceIds.pro_monthly)}
                        className={`w-full font-body text-sm ${
                          p.popular
                            ? 'bg-[#4a7c59] hover:bg-[#3d6b4d] text-white'
                            : 'border border-[#4a7c59] text-[#4a7c59] hover:bg-[#eaf0e8]'
                        }`}
                      >
                        <ArrowUpRight className="mr-2 size-4" />
                        {p.id === 'pro_annual' ? 'Subscribe Annual' : 'Subscribe Monthly'}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e8e6dd] font-body text-xs font-medium uppercase tracking-wider text-[#6a7a65]">
                  <th className="pb-3 pr-6">Feature</th>
                  <th className="pb-3 pr-6">Free</th>
                  <th className="pb-3 pr-6">Pro</th>
                  <th className="pb-3">Annual Pro</th>
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((feat) => (
                  <tr key={feat.name} className="border-b border-[#e8e6dd]/60 last:border-0">
                    <td className="py-3 pr-6 font-body text-sm text-[#2d3a2a]">{feat.name}</td>
                    <td className="py-3 pr-6">
                      {typeof feat.free === 'string' ? (
                        <span className="font-body text-sm text-[#6a7a65]">{feat.free}</span>
                      ) : feat.free ? (
                        <CheckCircle2 className="size-4 text-[#4a7c59]" />
                      ) : (
                        <XCircle className="size-4 text-[#c0392b]/60" />
                      )}
                    </td>
                    <td className="py-3 pr-6">
                      {typeof feat.pro === 'string' ? (
                        <span className="font-body text-sm text-[#6a7a65]">{feat.pro}</span>
                      ) : feat.pro ? (
                        <CheckCircle2 className="size-4 text-[#4a7c59]" />
                      ) : (
                        <XCircle className="size-4 text-[#c0392b]/60" />
                      )}
                    </td>
                    <td className="py-3">
                      {typeof feat.annual === 'string' ? (
                        <span className="font-body text-sm text-[#6a7a65]">{feat.annual}</span>
                      ) : feat.annual ? (
                        <CheckCircle2 className="size-4 text-[#4a7c59]" />
                      ) : (
                        <XCircle className="size-4 text-[#c0392b]/60" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}