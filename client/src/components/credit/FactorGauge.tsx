import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from 'cn'
import { Skeleton } from '../ui/skeleton'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { CircleAlert, CircleCheck, CircleMinus, Info } from 'lucide-react'

interface FactorGaugeProps {
  name: string
  label: string
  weight: number
  status: string
  index?: number
}

const statusConfig: Record<string, { icon: typeof CircleCheck; color: string; bg: string; label: string }> = {
  excellent: { icon: CircleCheck, color: 'text-[#4a7c59]', bg: 'bg-[#eaf0e8]', label: 'Excellent' },
  good: { icon: CircleCheck, color: 'text-[#6a7a65]', bg: 'bg-[#eaf0e8]', label: 'Good' },
  needs_work: { icon: CircleMinus, color: 'text-[#d4a843]', bg: 'bg-[#f5f0e0]', label: 'Needs Work' },
  critical: { icon: CircleAlert, color: 'text-[#c0392b]', bg: 'bg-[#fae8e8]', label: 'Critical' },
}

export default function FactorGauge({ name, label, weight, status, index = 0 }: FactorGaugeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const config = statusConfig[status] ?? statusConfig.needs_work
  const Icon = config.icon

  useGSAP(() => {
    if (ref.current) {
      gsap.from(ref.current, {
        x: -10,
        duration: 0.4,
        delay: 0.1 * index,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 90%' },
      })
    }
  }, { scope: ref })

  return (
    <div ref={ref} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-moss/50">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', config.bg)}>
          <Icon className={cn('size-4', config.color)} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-body text-sm font-medium text-foreground truncate">{label}</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Weight: {weight}% of total score</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className={cn('font-body text-xs', config.color)}>{config.label}</span>
        </div>
      </div>
      <span className="font-body text-xs text-muted-foreground shrink-0">{weight}%</span>
    </div>
  )
}

export function FactorDashboardSkeleton() {
  return (
    <div className="space-y-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-1 h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}