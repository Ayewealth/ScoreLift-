import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { fetchWithDemo, demoQueryKey, isDemoMode } from '../lib/demo-utils'
import { DEMO_DATA } from '../lib/demo-data'

interface SimulatorScenario {
  id: string
  name: string
  inputOverrides: Record<string, unknown>
  estimatedDelta: number | null
  createdAt: string
}

interface ScoringResult {
  estimatedScore: number
  factorHealth: Array<{
    factor: string
    label: string
    weight: number
    status: string
    score: number
    maxScore: number
  }>
  roadmapActions: Array<{
    factor: string
    actionTitle: string
    description: string
    estimatedImpactMin: number
    estimatedImpactMax: number
    effortLevel: string
    timeHorizon: string
  }>
}

export function useCalculateSimulation() {
  return useMutation({
    mutationFn: async (input: Record<string, unknown>): Promise<ScoringResult> => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return {
          estimatedScore: 642,
          factorHealth: [],
          roadmapActions: DEMO_DATA.roadmap.items.map(i => ({
            factor: i.factor,
            actionTitle: i.actionTitle,
            description: i.description,
            estimatedImpactMin: i.estimatedImpactMin,
            estimatedImpactMax: i.estimatedImpactMax,
            effortLevel: i.effortLevel,
            timeHorizon: i.timeHorizon,
          })),
        }
      }
      const res = await fetch('/api/simulator/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to calculate')
      return res.json()
    },
  })
}

export function useSimulatorScenarios() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<{ scenarios: SimulatorScenario[] }>({
    queryKey: demoQueryKey(['simulator', 'scenarios', userId], userId),
    queryFn: async () => fetchWithDemo('/api/simulator/scenarios', DEMO_DATA.simulator),
    enabled: !!userId,
  })
}

export function useSaveScenario() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (data: { name: string; inputOverrides: Record<string, unknown>; estimatedDelta?: number }) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return { id: 'demo-scenario-new', ...data, createdAt: new Date().toISOString(), isDemo: true }
      }
      const res = await fetch('/api/simulator/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save scenario')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulator', 'scenarios', userId] })
    },
  })
}

export function useDeleteScenario() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return { success: true, isDemo: true }
      }
      const res = await fetch(`/api/simulator/scenarios/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete scenario')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulator', 'scenarios', userId] })
    },
  })
}