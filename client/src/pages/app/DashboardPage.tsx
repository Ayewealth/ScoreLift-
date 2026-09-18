import { useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useDashboard } from '../../hooks/useDashboard'
import { updateMeta } from '../../lib/seo'
import ScoreCard from '../../components/credit/ScoreCard'
import FactorDashboard from '../../components/credit/FactorDashboard'
import ActionCard from '../../components/credit/ActionCard'
import ProgressWidget from '../../components/credit/ProgressWidget'
import { useGenerateRoadmap, useUpdateRoadmapItemStatus } from '../../hooks/useRoadmap'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { BarChart3, FileText, Route, ScrollText, Sparkles, Target, Zap, Flame, Trophy, CheckCircle2, BookOpen, Info, Mail, TrendingUp } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard()
  const generateRoadmap = useGenerateRoadmap()
  const updateStatus = useUpdateRoadmapItemStatus()
  const pageRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, {
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      })
    }
  }, { scope: pageRef })

  const handleRegenerate = async () => {
    if (!data?.profile) return
    try {
      const res = await fetch('/api/profile', { method: 'GET' })
      const profileData = await res.json()
      if (profileData.profile) {
        const scoringRes = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scoreBand: profileData.profile.scoreBand,
            missedPaymentCount: profileData.profile.missedPaymentCount,
            missedPaymentRecency: profileData.profile.missedPaymentRecency,
            overallUtilisation: profileData.profile.overallUtilisation,
            oldestAccountAge: profileData.profile.oldestAccountAge,
            totalAccounts: profileData.profile.totalAccounts,
            hardInquiries12m: profileData.profile.hardInquiries12m,
            derogatoryMarks: profileData.profile.derogatoryMarks,
            creditMix: profileData.profile.creditMix,
          }),
        })
        const scoringData = await scoringRes.json()
        if (scoringData.scoringResult?.roadmapActions) {
          await generateRoadmap.mutateAsync(scoringData.scoringResult.roadmapActions)
        }
      }
    } catch { /* handled by mutation */ }
  }

  const timelineData = useMemo(() =>
    data?.scoreTimeline?.map(p => ({
      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short' }),
      score: p.score,
      delta: p.delta,
    })) ?? [],
  [data?.scoreTimeline])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="font-body text-base text-[#c0392b]">Something went wrong loading your dashboard.</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4 font-body">Try Again</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div ref={pageRef} className="space-y-6">
        <Skeleton className="h-8 w-48" />
<div className="grid gap-6 md:grid-cols-2 items-start">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    )
  }

  const factors = data?.profile
    ? [
        { factor: 'payment_history', label: 'Payment History', weight: 35, status: 'excellent', score: 60, maxScore: 60 },
        { factor: 'credit_utilisation', label: 'Credit Utilisation', weight: 30, status: data.profile.overallUtilisation <= 30 ? 'good' : data.profile.overallUtilisation <= 50 ? 'needs_work' : 'critical', score: data.profile.overallUtilisation <= 30 ? 20 : data.profile.overallUtilisation <= 50 ? 0 : -30, maxScore: 50 },
        { factor: 'account_age', label: 'Account Age', weight: 15, status: 'good', score: 15, maxScore: 30 },
        { factor: 'credit_mix', label: 'Credit Mix', weight: 10, status: 'good', score: 10, maxScore: 20 },
        { factor: 'new_inquiries', label: 'New Inquiries', weight: 10, status: 'excellent', score: 10, maxScore: 10 },
      ]
    : undefined

  const scoreBandLabel = data?.scoreBand
    ? data.scoreBand.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : null

  const digestCheckin = data?.checkin?.lastCheckin
  const hasDigest = data?.checkin?.totalCheckins && data.checkin.totalCheckins > 0

  return (
    <div ref={pageRef} className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-[#2d3a2a]">Dashboard</h1>
          <p className="mt-1 font-body text-base text-[#6a7a65]">
            {scoreBandLabel
              ? `Your credit health at a glance — ${scoreBandLabel}`
              : 'Welcome to ScoreLift'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.profile && (
            <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={generateRoadmap.isPending} className="font-body text-xs">
              <Zap className="mr-1 size-3.5" />
              {generateRoadmap.isPending ? 'Regenerating...' : 'Regenerate Roadmap'}
            </Button>
          )}
          {data?.checkin?.streak > 0 && (
            <Badge className="flex items-center gap-1.5 bg-[#f5f0e0] font-body text-xs text-[#d4a843]">
              <Flame className="size-3.5" />
              {data.checkin.streak} month streak
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ScoreCard score={data?.scoreEstimate ?? null} band={data?.scoreBand ?? null} delta={data?.scoreDelta ?? null} isLoading={isLoading} />
        <FactorDashboard factors={factors} isLoading={isLoading} />
      </div>

      {data?.checkin?.streak > 0 && (
        <div className="grid grid-cols-4 gap-4 max-sm:grid-cols-2">
          <Link to="/checkin" className="group rounded-xl border border-[#e8e6dd] bg-white p-5 shadow-[0_2px_24px_rgba(74,124,89,0.08)] transition-all hover:border-[#d4a843]/50 hover:shadow-[0_2px_24px_rgba(74,124,89,0.12)]">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#f5f0e0]">
                <Flame className="size-6 text-[#d4a843]" />
              </div>
              <div>
                <p className="font-heading text-2xl text-[#2d3a2a]">{data.checkin.streak}</p>
                <p className="font-body text-xs text-[#6a7a65]">Month streak</p>
              </div>
            </div>
          </Link>
          <Link to="/roadmap" className="group rounded-xl border border-[#e8e6dd] bg-white p-5 shadow-[0_2px_24px_rgba(74,124,89,0.08)] transition-all hover:border-[#4a7c59]/30 hover:shadow-[0_2px_24px_rgba(74,124,89,0.12)]">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#eaf0e8]">
                <Route className="size-6 text-[#4a7c59]" />
              </div>
              <div>
                <p className="font-heading text-2xl text-[#2d3a2a]">{data?.progress.completed ?? 0}/{data?.progress.total ?? 0}</p>
                <p className="font-body text-xs text-[#6a7a65]">Actions done</p>
              </div>
            </div>
          </Link>
          <Link to="/goals" className="group rounded-xl border border-[#e8e6dd] bg-white p-5 shadow-[0_2px_24px_rgba(74,124,89,0.08)] transition-all hover:border-[#4a7c59]/30 hover:shadow-[0_2px_24px_rgba(74,124,89,0.12)]">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#eaf0e8]">
                <Target className="size-6 text-[#4a7c59]" />
              </div>
              <div>
                <p className="font-heading text-2xl text-[#2d3a2a]">{data?.checkin?.totalCheckins ?? 0}</p>
                <p className="font-body text-xs text-[#6a7a65]">Total check-ins</p>
              </div>
            </div>
          </Link>
          <Link to="/milestones" className="group rounded-xl border border-[#e8e6dd] bg-white p-5 shadow-[0_2px_24px_rgba(74,124,89,0.08)] transition-all hover:border-[#d4a843]/50 hover:shadow-[0_2px_24px_rgba(74,124,89,0.12)]">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#f5f0e0]">
                <Trophy className="size-6 text-[#d4a843]" />
              </div>
              <div>
                <p className="font-heading text-2xl text-[#2d3a2a]">{data?.milestones?.length ?? 0}</p>
                <p className="font-body text-xs text-[#6a7a65]">Milestones</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-heading text-xl text-[#2d3a2a]">Top Actions</h2>
            <p className="mt-1 font-body text-sm text-[#6a7a65]">Your highest-impact improvements this month</p>
            <div className="mt-4 space-y-3">
              {data?.topActions && data.topActions.length > 0 ? (
                data.topActions.map((action, i) => (
                  <ActionCard
                    key={action.id}
                    id={action.id}
                    actionTitle={action.actionTitle}
                    factor={action.factor}
                    estimatedImpactMin={action.estimatedImpactMin}
                    estimatedImpactMax={action.estimatedImpactMax}
                    effortLevel={action.effortLevel}
                    timeHorizon={action.timeHorizon}
                    description={action.actionTitle}
                    status={action.status}
                    index={i}
                    onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-[#e8e6dd] bg-white p-10 text-center shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
                  <Sparkles className="mx-auto size-8 text-[#6a7a65]" />
                  <p className="mt-3 font-body text-sm text-[#6a7a65]">Complete your credit profile to see your personalised action plan.</p>
                  <Link to="/roadmap" className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1 font-body text-xs text-foreground hover:bg-muted transition-colors">Go to Roadmap</Link>
                </div>
              )}
            </div>
          </div>

          {data?.scoreTimeline && data.scoreTimeline.length > 1 && (
            <div className="rounded-xl border border-[#e8e6dd] bg-white p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl text-[#2d3a2a]">Score Timeline</h3>
                  <p className="font-body text-sm text-[#6a7a65]">Your estimated score trajectory over time</p>
                </div>
                <Info className="size-5 text-[#6a7a65]" />
              </div>
              <div className="mt-6 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e6dd" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6a7a65', fontFamily: 'Outfit' }} stroke="#e8e6dd" />
                    <YAxis domain={['dataMin - 20', 'dataMax + 20']} tick={{ fontSize: 11, fill: '#6a7a65', fontFamily: 'Outfit' }} stroke="#e8e6dd" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e8e6dd', fontSize: '13px', fontFamily: 'Outfit' }} />
                    <Line type="monotone" dataKey="score" stroke="#4a7c59" strokeWidth={2} dot={{ fill: '#4a7c59', r: 4 }} activeDot={{ r: 6 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ProgressWidget completed={data?.progress.completed ?? 0} total={data?.progress.total ?? 0} percent={data?.progress.percent ?? 0} isLoading={isLoading} />

          {hasDigest && digestCheckin && (
            <div className="rounded-xl border border-[#e8e6dd] bg-white p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
              <div className="flex items-center gap-2">
                <Mail className="size-5 text-[#4a7c59]" />
                <h3 className="font-heading text-base text-[#2d3a2a]">Latest Digest</h3>
              </div>
              <Separator className="my-3 bg-[#e8e6dd]" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-[#6a7a65]">Check-in date</span>
                  <span className="font-body text-sm font-medium text-[#2d3a2a]">
                    {new Date(digestCheckin.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-[#6a7a65]">Score estimate</span>
                  <span className="font-heading text-lg text-[#4a7c59]">{digestCheckin.scoreEstimate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-[#6a7a65]">Change</span>
                  <span className={`font-body text-sm font-medium ${digestCheckin.deltaFromPrevious && digestCheckin.deltaFromPrevious >= 0 ? 'text-[#4a7c59]' : 'text-[#c0392b]'}`}>
                    {digestCheckin.deltaFromPrevious != null
                      ? `${digestCheckin.deltaFromPrevious >= 0 ? '+' : ''}${digestCheckin.deltaFromPrevious} pts`
                      : 'N/A'}
                  </span>
                </div>
              </div>
              <Link to="/checkin" className="mt-3 inline-flex items-center gap-1 font-body text-xs text-[#4a7c59] hover:text-[#3d6b4d] transition-colors">
                View full check-in history
                <TrendingUp className="size-3" />
              </Link>
            </div>
          )}

          {data?.activeGoal && (
            <Link to="/goals" className="block rounded-xl border border-[#e8e6dd] bg-white p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)] transition-all hover:border-[#4a7c59]/30 hover:shadow-[0_2px_24px_rgba(74,124,89,0.12)]">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-[#4a7c59]" />
                <h3 className="font-heading text-base text-[#2d3a2a]">Active Goal</h3>
              </div>
              <Separator className="my-3 bg-[#e8e6dd]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm text-[#2d3a2a]">Target: <span className="font-medium capitalize">{data.activeGoal.targetScoreBand.replace(/_/g, ' ')}</span></p>
                  {data.activeGoal.targetDate && (
                    <p className="mt-0.5 font-body text-xs text-[#6a7a65]">By {new Date(data.activeGoal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  )}
                </div>
                <div className="flex size-10 items-center justify-center rounded-full bg-[#eaf0e8]">
                  <Target className="size-5 text-[#4a7c59]" />
                </div>
              </div>
            </Link>
          )}

          {data?.milestones && data.milestones.length > 0 && (
            <Link to="/milestones" className="block rounded-xl border border-[#e8e6dd] bg-white p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)] transition-all hover:border-[#d4a843]/50 hover:shadow-[0_2px_24px_rgba(74,124,89,0.12)]">
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-[#d4a843]" />
                <h3 className="font-heading text-base text-[#2d3a2a]">Recent Milestones</h3>
              </div>
              <Separator className="my-3 bg-[#e8e6dd]" />
              <div className="flex flex-wrap gap-2">
                {data.milestones.slice(0, 3).map((m) => (
                  <span key={m.type} className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf0e8] px-3 py-1 font-body text-xs text-[#4a7c59]">
                    <CheckCircle2 className="size-3.5" />
                    {m.name}
                    <span className="text-[10px] text-[#6a7a65]">
                      {new Date(m.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </span>
                ))}
              </div>
            </Link>
          )}

          <div className="rounded-xl border border-[#e8e6dd] bg-white p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
            <h3 className="font-heading text-base text-[#2d3a2a]">Quick Links</h3>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Link to="/simulator" className="flex items-center gap-2.5 rounded-lg border border-[#e8e6dd] px-4 py-3 font-body text-xs text-[#2d3a2a] transition-colors hover:border-[#4a7c59]/30 hover:bg-[#eaf0e8]/50">
                <BarChart3 className="size-4 text-[#4a7c59]" />
                Simulator
              </Link>
              <Link to="/disputes" className="flex items-center gap-2.5 rounded-lg border border-[#e8e6dd] px-4 py-3 font-body text-xs text-[#2d3a2a] transition-colors hover:border-[#4a7c59]/30 hover:bg-[#eaf0e8]/50">
                <ScrollText className="size-4 text-[#4a7c59]" />
                Disputes
              </Link>
              <Link to="/documents" className="flex items-center gap-2.5 rounded-lg border border-[#e8e6dd] px-4 py-3 font-body text-xs text-[#2d3a2a] transition-colors hover:border-[#4a7c59]/30 hover:bg-[#eaf0e8]/50">
                <FileText className="size-4 text-[#4a7c59]" />
                Documents
              </Link>
              <Link to="/education" className="flex items-center gap-2.5 rounded-lg border border-[#e8e6dd] px-4 py-3 font-body text-xs text-[#2d3a2a] transition-colors hover:border-[#4a7c59]/30 hover:bg-[#eaf0e8]/50">
                <BookOpen className="size-4 text-[#4a7c59]" />
                Education
              </Link>
            </div>
          </div>
        </div>
      </div>

      {!data?.profile && (
        <div className="rounded-xl border border-[#e8e6dd] bg-white p-12 text-center shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#eaf0e8]">
            <Route className="size-8 text-[#4a7c59]" />
          </div>
          <h2 className="mt-4 font-heading text-xl text-[#2d3a2a]">Welcome to ScoreLift!</h2>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-[#6a7a65]">
            Complete your credit profile to get a personalised score estimate, roadmap, and actionable insights.
          </p>
          <Link to="/onboarding" className="mx-auto inline-flex items-center justify-center rounded-lg bg-[#4a7c59] px-5 py-2 font-body text-sm text-white hover:bg-[#3d6b4d] transition-colors w-fit">Complete Your Profile</Link>
        </div>
      )}
    </div>
  )
}