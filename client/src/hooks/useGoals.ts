import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { fetchWithDemo, demoQueryKey, isDemoMode } from '../lib/demo-utils'
import { DEMO_DATA } from '../lib/demo-data'

interface Goal {
  id: string
  targetScoreBand: string
  targetDate: string
  purpose: string | null
  isActive: boolean
  createdAt: string
}

interface GoalProgress {
  goal: Goal | null
  currentScore: number
  targetScore: number
  progress: number
  onTrack: boolean
  neededPerMonth: number
  monthsRemaining: number
}

interface ReadinessItem {
  purpose: string
  label: string
  minScore: number
  currentScore: number
  ready: boolean
  gap: number
}

export function useGoals() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<{ goals: Goal[] }>({
    queryKey: demoQueryKey(['goals', userId], userId),
    queryFn: async () => fetchWithDemo('/api/goals', DEMO_DATA.goals),
    enabled: !!userId,
  })
}

export function useGoalProgress() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<GoalProgress>({
    queryKey: demoQueryKey(['goals', 'progress', userId], userId),
    queryFn: async () => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return {
          goal: DEMO_DATA.goals.goals[0],
          currentScore: 642,
          targetScore: 660,
          progress: 35,
          onTrack: true,
          neededPerMonth: 6,
          monthsRemaining: 3,
        }
      }
      const res = await fetch('/api/goals/progress')
      if (!res.ok) throw new Error('Failed to fetch goal progress')
      return res.json()
    },
    enabled: !!userId,
  })
}

export function useReadiness() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<{ readiness: ReadinessItem[] }>({
    queryKey: demoQueryKey(['goals', 'readiness', userId], userId),
    queryFn: async () => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return {
          readiness: [
            { purpose: 'mortgage', label: 'Conventional Mortgage', minScore: 620, currentScore: 642, ready: true, gap: 0 },
            { purpose: 'mortgage', label: 'FHA Loan', minScore: 580, currentScore: 642, ready: true, gap: 0 },
            { purpose: 'credit_card', label: 'Premium Credit Card', minScore: 700, currentScore: 642, ready: false, gap: 58 },
          ]
        }
      }
      const res = await fetch('/api/goals/readiness')
      if (!res.ok) throw new Error('Failed to fetch readiness')
      return res.json()
    },
    enabled: !!userId,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (data: { targetScoreBand: string; targetDate: string; purpose?: string }) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return { id: 'demo-goal-new', ...data, isActive: true, createdAt: new Date().toISOString(), isDemo: true }
      }
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to create goal')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] })
      queryClient.invalidateQueries({ queryKey: ['goals', 'progress', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return { success: true, isDemo: true }
      }
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete goal')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] })
      queryClient.invalidateQueries({ queryKey: ['goals', 'progress', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] })
    },
  })
}