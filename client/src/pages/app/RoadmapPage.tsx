import { useState, useRef, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useRoadmap, useUpdateRoadmapItemStatus, type RoadmapActionItem } from '../../hooks/useRoadmap'
import { updateMeta } from '../../lib/seo'
import ActionCard, { ActionCardSkeleton } from '../../components/credit/ActionCard'
import ProgressWidget from '../../components/credit/ProgressWidget'
import { Button } from '../../components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Skeleton } from '../../components/ui/skeleton'
import { Sparkles, Filter, ArrowUpDown, RotateCcw, CheckCircle2 } from 'lucide-react'

const factorOptions = [
  { value: 'all', label: 'All Factors' },
  { value: 'payment_history', label: 'Payment History' },
  { value: 'credit_utilisation', label: 'Credit Utilisation' },
  { value: 'account_age', label: 'Account Age' },
  { value: 'credit_mix', label: 'Credit Mix' },
  { value: 'new_inquiries', label: 'New Inquiries' },
]

const effortOptions = [
  { value: 'all', label: 'All Effort' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const horizonOptions = [
  { value: 'all', label: 'All Timeframes' },
  { value: 'immediate', label: 'Immediate' },
  { value: '1_3_months', label: '1–3 months' },
  { value: '3_6_months', label: '3–6 months' },
  { value: '6_12_months', label: '6–12 months' },
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

type SortKey = 'impact' | 'effort' | 'time'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'impact', label: 'Highest Impact' },
  { value: 'effort', label: 'Easiest First' },
  { value: 'time', label: 'Soonest First' },
]

export default function RoadmapPage() {
  const { data, isLoading, error } = useRoadmap()
  const updateStatus = useUpdateRoadmapItemStatus()
  const pageRef = useRef<HTMLDivElement>(null)

  const [factorFilter, setFactorFilter] = useState('all')
  const [effortFilter, setEffortFilter] = useState('all')
  const [horizonFilter, setHorizonFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('impact')

  useGSAP(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, {
        y: 15,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
      })
    }
  }, { scope: pageRef })

  const filteredItems = useMemo(() => {
    const items = data?.items ?? []

    return items
      .filter((item) => factorFilter === 'all' || item.factor === factorFilter)
      .filter((item) => effortFilter === 'all' || item.effortLevel === effortFilter)
      .filter((item) => horizonFilter === 'all' || item.timeHorizon === horizonFilter)
      .filter((item) => statusFilter === 'all' || item.status === statusFilter)
      .sort((a, b) => {
        if (sortKey === 'impact') return b.estimatedImpactMax - a.estimatedImpactMax
        const effortOrder = { low: 0, medium: 1, high: 2 }
        if (sortKey === 'effort') return effortOrder[a.effortLevel as keyof typeof effortOrder] - effortOrder[b.effortLevel as keyof typeof effortOrder]
        const timeOrder = { immediate: 0, '1_3_months': 1, '3_6_months': 2, '6_12_months': 3 }
        return timeOrder[a.timeHorizon as keyof typeof timeOrder] - timeOrder[b.timeHorizon as keyof typeof timeOrder]
      })
  }, [data?.items, factorFilter, effortFilter, horizonFilter, statusFilter, sortKey])

  const totalCount = data?.items?.length ?? 0
  const doneCount = data?.items?.filter(i => i.status === 'done').length ?? 0
  const hasActiveFilters = factorFilter !== 'all' || effortFilter !== 'all' || horizonFilter !== 'all' || statusFilter !== 'all'

  const clearFilters = () => {
    setFactorFilter('all')
    setEffortFilter('all')
    setHorizonFilter('all')
    setStatusFilter('all')
  }

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status })
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="font-body text-base text-[#c0392b]">Something went wrong loading your roadmap.</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4 font-body">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-foreground">Your Roadmap</h1>
          <p className="font-body text-sm text-muted-foreground">
            Prioritised actions to improve your credit score
          </p>
        </div>
      </div>

      {!isLoading && (
        <ProgressWidget
          completed={doneCount}
          total={totalCount}
          percent={totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Filter className="size-4 text-muted-foreground" />
          <span className="font-body text-xs text-muted-foreground">Filters:</span>
        </div>

        <Select value={factorFilter} onValueChange={(v: string | null) => v && setFactorFilter(v)}>
          <SelectTrigger className="h-8 w-36 font-body text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {factorOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={effortFilter} onValueChange={(v: string | null) => v && setEffortFilter(v)}>
          <SelectTrigger className="h-8 w-32 font-body text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {effortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={horizonFilter} onValueChange={(v: string | null) => v && setHorizonFilter(v)}>
          <SelectTrigger className="h-8 w-36 font-body text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {horizonOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v: string | null) => v && setStatusFilter(v)}>
          <SelectTrigger className="h-8 w-28 font-body text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 ml-auto">
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
          <span className="font-body text-xs text-muted-foreground">Sort:</span>
          <Select value={sortKey} onValueChange={(v: SortKey | null) => v && setSortKey(v)}>
            <SelectTrigger className="h-8 w-36 font-body text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {sortOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="font-body text-xs">
            <RotateCcw className="mr-1 size-3" />
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <ActionCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl bg-card p-12 text-center shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
          {hasActiveFilters ? (
            <>
              <Filter className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-4 font-body text-base text-foreground">No actions match your filters</p>
              <Button variant="outline" onClick={clearFilters} className="mt-3 font-body text-sm">
                Show all actions
              </Button>
            </>
          ) : (
            <>
              <Sparkles className="mx-auto size-10 text-primary" />
              <p className="mt-4 font-body text-base text-foreground">No roadmap yet</p>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Complete your credit profile to generate your personalised roadmap.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="font-body text-xs text-muted-foreground">
              Showing {filteredItems.length} of {totalCount} actions
            </p>
            {doneCount === totalCount && totalCount > 0 && (
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="size-5" />
                <span className="font-body text-sm font-medium">All actions complete — great work!</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {filteredItems.map((item, i) => (
              <ActionCard
                key={item.id}
                id={item.id}
                actionTitle={item.actionTitle}
                factor={item.factor}
                estimatedImpactMin={item.estimatedImpactMin}
                estimatedImpactMax={item.estimatedImpactMax}
                effortLevel={item.effortLevel}
                timeHorizon={item.timeHorizon}
                description={item.description}
                status={item.status}
                index={i}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}