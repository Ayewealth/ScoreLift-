import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Skeleton } from '../ui/skeleton'
import FactorGauge, { FactorDashboardSkeleton } from './FactorGauge'

interface FactorHealthData {
  factor: string
  label: string
  weight: number
  status: string
  score: number
  maxScore: number
}

interface FactorDashboardProps {
  factors?: FactorHealthData[]
  isLoading?: boolean
}

export default function FactorDashboard({ factors, isLoading }: FactorDashboardProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (ref.current) {
      gsap.from(ref.current, {
        y: 15,
        duration: 0.5,
        ease: 'power2.out',
      })
    }
  }, { scope: ref })

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
        <Skeleton className="mb-4 h-4 w-36" />
        <FactorDashboardSkeleton />
      </div>
    )
  }

  if (!factors || factors.length === 0) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
        <h3 className="font-heading text-lg text-foreground">Credit Factors</h3>
        <p className="mt-2 font-body text-sm text-muted-foreground">Complete your profile to see your factor breakdown.</p>
      </div>
    )
  }

  return (
    <div ref={ref} className="rounded-xl bg-card p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
      <h3 className="font-heading text-lg text-foreground">Credit Factors</h3>
      <p className="mb-4 font-body text-xs text-muted-foreground">
        How your score breaks down across the five FICO factors
      </p>
      <div className="space-y-1">
        {factors.map((f, i) => (
          <FactorGauge key={f.factor} name={f.factor} {...f} index={i} />
        ))}
      </div>
    </div>
  )
}