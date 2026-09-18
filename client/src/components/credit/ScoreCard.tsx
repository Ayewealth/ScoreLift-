import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { cn } from 'cn'
import { Skeleton } from '../ui/skeleton'
import { ArrowUp, ArrowDown, Minus, ShieldCheck, CreditCard, Clock, Layers } from 'lucide-react'

interface ScoreCardProps {
  score: number | null
  band: string | null
  delta?: number | null
  isLoading?: boolean
}

const healthColors: Record<string, string> = {
  poor: 'bg-[#c0392b]',
  fair: 'bg-[#d4a843]',
  good: 'bg-[#6a7a65]',
  very_good: 'bg-[#4a7c59]',
  exceptional: 'bg-[#3d6b4d]',
}

const healthGradients: Record<string, string> = {
  poor: 'from-[#c0392b] to-[#e74c3c]',
  fair: 'from-[#d4a843] to-[#e0b854]',
  good: 'from-[#6a7a65] to-[#8a9a85]',
  very_good: 'from-[#4a7c59] to-[#5a8c69]',
  exceptional: 'from-[#3d6b4d] to-[#4a7c59]',
}

function formatBandLabel(band: string | null): string {
  const labels: Record<string, string> = {
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    very_good: 'Very Good',
    exceptional: 'Exceptional',
  }
  return labels[band ?? ''] ?? 'Not yet scored'
}

function formatRange(band: string | null): string {
  const ranges: Record<string, string> = {
    poor: '300 – 579',
    fair: '580 – 669',
    good: '670 – 739',
    very_good: '740 – 799',
    exceptional: '800 – 850',
  }
  return ranges[band ?? ''] ?? ''
}

export default function ScoreCard({ score, band, delta, isLoading }: ScoreCardProps) {
  const scoreRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (score && scoreRef.current) {
      const obj = { value: 0 }
      gsap.to(obj, {
        value: score,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (scoreRef.current) {
            scoreRef.current.textContent = Math.round(obj.value).toString()
          }
        },
      })
    }
  }, [score])

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
      })
    }
  }, [])

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-12 w-32" />
        <div className="mt-4 flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    )
  }

  if (!score || !band) {
    return (
      <div ref={containerRef} className="rounded-xl bg-card p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
        <p className="font-body text-xs text-muted-foreground">Estimated Score</p>
        <p className="mt-2 font-body text-sm text-muted-foreground">Complete your profile to see your score</p>
      </div>
    )
  }

  const barColor = healthColors[band] ?? 'bg-muted'
  const textColor = band === 'poor' || band === 'fair' ? 'text-[#2d3a2a]' : ''

  return (
    <div ref={containerRef} className="rounded-xl bg-card p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
      <div className="flex items-center justify-between">
        <p className="font-body text-xs text-muted-foreground">Estimated Score</p>
        {delta !== null && delta !== undefined && (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-body text-xs font-medium',
            delta > 0 ? 'bg-[#eaf0e8] text-[#4a7c59]' : delta < 0 ? 'bg-[#fae8e8] text-[#c0392b]' : 'bg-[#f5f0e0] text-[#d4a843]'
          )}>
            {delta > 0 ? <ArrowUp className="size-3" /> : delta < 0 ? <ArrowDown className="size-3" /> : <Minus className="size-3" />}
            {delta > 0 ? '+' : ''}{delta} pts
          </span>
        )}
      </div>

      <p className="mt-1 font-heading text-[56px] leading-none text-primary">
        <span ref={scoreRef}>0</span>
      </p>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <span className="font-body text-sm font-medium text-foreground">
            {formatBandLabel(band)}
          </span>
          <span className="font-body text-xs text-muted-foreground">
            {formatRange(band)}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#eaf0e8]">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-1000', healthGradients[band])}
            style={{ width: `${((score - 300) / 550) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-[#eaf0e8]/50 p-3 text-center">
          <Clock className="mx-auto size-4 text-[#4a7c59]" />
          <p className="mt-1 font-body text-[10px] font-medium text-[#2d3a2a]">Payment History</p>
          <p className="font-body text-xs text-[#6a7a65]">35% weight</p>
        </div>
        <div className="rounded-lg bg-[#eaf0e8]/50 p-3 text-center">
          <CreditCard className="mx-auto size-4 text-[#4a7c59]" />
          <p className="mt-1 font-body text-[10px] font-medium text-[#2d3a2a]">Utilisation</p>
          <p className="font-body text-xs text-[#6a7a65]">30% weight</p>
        </div>
        <div className="rounded-lg bg-[#eaf0e8]/50 p-3 text-center">
          <Layers className="mx-auto size-4 text-[#4a7c59]" />
          <p className="mt-1 font-body text-[10px] font-medium text-[#2d3a2a]">Account Age</p>
          <p className="font-body text-xs text-[#6a7a65]">15% weight</p>
        </div>
      </div>
    </div>
  )
}