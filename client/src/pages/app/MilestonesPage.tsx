import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useMilestones } from '../../hooks/useMilestones'
import { updateMeta } from '../../lib/seo'
import { Card } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Trophy, CalendarCheck, Flame, TrendingUp, CheckCircle, GraduationCap, ScrollText, Award, Lock } from 'lucide-react'

gsap.registerPlugin(useGSAP)

const iconMap: Record<string, typeof Trophy> = {
  'calendar-check': CalendarCheck,
  'flame': Flame,
  'award': Award,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
  'graduation-cap': GraduationCap,
  'scroll-text': ScrollText,
  'trophy': Trophy,
}

export default function MilestonesPage() {
  const { data, isLoading } = useMilestones()
  const pageRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, { y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
    }
  }, { scope: pageRef })

  useGSAP(() => {
    if (gridRef.current) {
      gsap.from(gridRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: { trigger: gridRef.current, start: 'top 85%' },
      })
    }
  }, { scope: gridRef, dependencies: [data] })

  updateMeta({
    title: 'Milestones — ScoreLift',
    description: 'Track your achievements and credit journey milestones.',
  })

  if (isLoading) {
    return (
      <div ref={pageRef} className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const allMilestones = data?.milestones ?? []
  const unlocked = allMilestones.filter(m => m.unlocked)
  const locked = allMilestones.filter(m => !m.unlocked)

  const hasMilestones = allMilestones.length > 0

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-foreground">Milestones</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {unlocked.length} of {allMilestones.length} unlocked
          </p>
        </div>
        {unlocked.length > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-moss px-4 py-2">
            <Trophy className="size-4 text-primary" />
            <span className="font-body text-sm font-medium text-primary">{unlocked.length} badges</span>
          </div>
        )}
      </div>

      <div ref={gridRef}>
        {hasMilestones ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {unlocked.map((m) => {
          const Icon = iconMap[m.icon] ?? Trophy
          return (
            <Card key={m.type} className="p-6 text-center transition-all hover:shadow-md">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-moss">
                <Icon className="size-6 text-primary" />
              </div>
              <h3 className="mt-3 font-heading text-sm text-foreground">{m.name}</h3>
              <p className="mt-1 font-body text-[11px] text-muted-foreground leading-tight">{m.description}</p>
              {m.unlockedAt && (
                <p className="mt-2 font-body text-[10px] text-muted-foreground">
                  {new Date(m.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </Card>
          )
        })}

        {locked.map((m) => {
          const Icon = iconMap[m.icon] ?? Trophy
          return (
            <Card key={m.type} className="p-6 text-center opacity-50 grayscale transition-all hover:opacity-70 hover:grayscale-0">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5f0e0]">
                <Lock className="size-6 text-amber" />
              </div>
              <h3 className="mt-3 font-heading text-sm text-muted-foreground">{m.name}</h3>
              <p className="mt-1 font-body text-[11px] text-muted-foreground leading-tight">{m.description}</p>
            </Card>
          )
        })}
        </div>
        ) : (
          <div className="rounded-xl border border-[#e8e6dd] bg-white p-12 text-center shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
            <Trophy className="mx-auto size-10 text-[#6a7a65]" />
            <h3 className="mt-4 font-heading text-lg text-[#2d3a2a]">No Milestones Yet</h3>
            <p className="mx-auto mt-2 max-w-md font-body text-sm text-[#6a7a65]">
              Complete your first check-in, finish roadmap actions, or explore the education centre to start earning badges.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}