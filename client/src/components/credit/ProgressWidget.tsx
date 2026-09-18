import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { cn } from 'cn'
import { Skeleton } from '../ui/skeleton'

interface ProgressWidgetProps {
  completed: number
  total: number
  percent: number
  isLoading?: boolean
}

export default function ProgressWidget({ completed, total, percent, isLoading }: ProgressWidgetProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (barRef.current && percent > 0) {
      gsap.from(barRef.current, {
        width: '0%',
        duration: 1,
        ease: 'power2.out',
      })
    }
  }, [percent])

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        y: 15,
        duration: 0.5,
        ease: 'power2.out',
      })
    }
  }, [])

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-20" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="rounded-xl bg-card p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
      <p className="font-heading text-lg text-foreground">Roadmap Progress</p>
      {total > 0 && (
        <>
          <p className="mt-3 font-body text-sm text-foreground">
            {completed} of {total} actions complete
          </p>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#eaf0e8]">
            <div
              ref={barRef}
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      )}
      {total === 0 && (
        <p className="mt-3 font-body text-sm text-muted-foreground">
          Generate your roadmap to see progress
        </p>
      )}
    </div>
  )
}