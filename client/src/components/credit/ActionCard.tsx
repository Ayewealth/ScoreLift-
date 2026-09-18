import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from 'cn'
import { Skeleton } from '../ui/skeleton'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react'

interface ActionCardProps {
  id: string
  actionTitle: string
  factor: string
  estimatedImpactMin: number
  estimatedImpactMax: number
  effortLevel: string
  timeHorizon: string
  description: string
  status: string
  index?: number
  onStatusChange?: (id: string, status: string) => void
}

const factorLabels: Record<string, string> = {
  payment_history: 'Payment History',
  credit_utilisation: 'Credit Utilisation',
  account_age: 'Account Age',
  credit_mix: 'Credit Mix',
  new_inquiries: 'New Inquiries',
}

const effortConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low Effort', color: 'bg-[#eaf0e8] text-[#4a7c59]' },
  medium: { label: 'Medium Effort', color: 'bg-[#f5f0e0] text-[#d4a843]' },
  high: { label: 'High Effort', color: 'bg-[#fae8e8] text-[#c0392b]' },
}

const timeHorizonLabels: Record<string, string> = {
  immediate: 'Immediate',
  '1_3_months': '1–3 months',
  '3_6_months': '3–6 months',
  '6_12_months': '6–12 months',
}

export default function ActionCard({ id, actionTitle, factor, estimatedImpactMin, estimatedImpactMax, effortLevel, timeHorizon, description, status, index = 0, onStatusChange }: ActionCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)

  useGSAP(() => {
    if (ref.current) {
      gsap.from(ref.current, {
        y: 15,
        duration: 0.4,
        delay: 0.06 * index,
        ease: 'power2.out',
      })
    }
  }, { scope: ref })

  const effort = effortConfig[effortLevel] ?? effortConfig.medium

  const handleToggleStatus = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(id, newStatus)
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card px-5 py-4 shadow-[0_2px_24px_rgba(74,124,89,0.06)] transition-all',
        status === 'done' ? 'opacity-60' : '',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleStatus(status === 'done' ? 'todo' : 'done')}
              className={cn(
                'shrink-0 transition-colors',
                status === 'done' ? 'text-primary' : 'text-muted-foreground hover:text-primary',
              )}
              aria-label={status === 'done' ? 'Mark as to do' : 'Mark as done'}
            >
              {status === 'done' ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Circle className="size-5" />
              )}
            </button>
            <div>
              <p className={cn('font-body text-sm font-medium text-foreground', status === 'done' ? 'line-through' : '')}>
                {actionTitle}
              </p>
              <p className="mt-0.5 font-body text-xs text-muted-foreground">
                Factor: {factorLabels[factor] ?? factor}
              </p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-body text-sm font-semibold text-primary whitespace-nowrap">
            +{estimatedImpactMin}–{estimatedImpactMax} pts
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className={cn('font-body text-xs', effort.color)}>
          {effort.label}
        </Badge>
        <Badge variant="outline" className="font-body text-xs">
          <Clock className="mr-1 size-3" />
          {timeHorizonLabels[timeHorizon] ?? timeHorizon}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            'font-body text-xs cursor-pointer transition-colors',
            status === 'in_progress' ? 'border-primary text-primary' : '',
          )}
          onClick={() => handleToggleStatus(status === 'in_progress' ? 'todo' : 'in_progress')}
        >
          {status === 'in_progress' ? 'In Progress' : status === 'done' ? 'Done' : 'To Do'}
        </Badge>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="font-body text-sm leading-relaxed text-muted-foreground">{description}</p>
          <div className="mt-3 flex gap-2">
            {status !== 'in_progress' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus('in_progress')}
                className="font-body text-xs"
              >
                <ArrowRight className="mr-1 size-3" />
                Start working on this
              </Button>
            )}
            <Dialog>
              <DialogTrigger render={<Button variant="ghost" size="sm" className="font-body text-xs" />}>
                Full details
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading text-xl">{actionTitle}</DialogTitle>
                  <DialogDescription className="font-body text-sm">
                    {factorLabels[factor] ?? factor} &middot; +{estimatedImpactMin}–{estimatedImpactMax} pts estimated
                  </DialogDescription>
                </DialogHeader>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{description}</p>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )
}

export function ActionCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-5 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-1 h-3 w-1/3" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}