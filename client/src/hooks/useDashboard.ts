import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { fetchWithDemo, demoQueryKey } from '../lib/demo-utils'
import { DEMO_DATA } from '../lib/demo-data'

interface FactorHealth {
  factor: string
  label: string
  weight: number
  status: string
  score: number
  maxScore: number
}

interface DashboardData {
  profile: {
    id: string
    estimatedScore: number | null
    scoreBand: string
    overallUtilisation: number
  } | null
  scoreEstimate: number | null
  scoreBand: string | null
  scoreDelta: number | null
  topActions: Array<{
    id: string
    actionTitle: string
    estimatedImpactMin: number
    estimatedImpactMax: number
    effortLevel: string
    timeHorizon: string
    factor: string
    status: string
  }>
  progress: {
    total: number
    completed: number
    percent: number
  }
  checkin: {
    streak: number
    lastCheckin: { completedAt: string; scoreEstimate: number; deltaFromPrevious: number } | null
    totalCheckins: number
  }
  milestones: Array<{
    type: string
    name: string
    icon: string
    unlockedAt: string
  }>
  activeGoal: {
    id: string
    targetScoreBand: string
    targetDate: string
    purpose: string | null
  } | null
  scoreTimeline: Array<{
    date: string
    score: number
    delta: number | null
  }>
}

export function useDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<DashboardData>({
    queryKey: demoQueryKey(['dashboard', userId], userId),
    queryFn: async () => fetchWithDemo('/api/dashboard', DEMO_DATA.dashboard),
    enabled: !!userId,
  })
}