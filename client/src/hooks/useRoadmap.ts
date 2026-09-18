import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { fetchWithDemo, demoQueryKey, isDemoMode } from '../lib/demo-utils'
import { DEMO_DATA } from '../lib/demo-data'

export interface RoadmapActionItem {
  id: string
  userId: string
  factor: string
  actionTitle: string
  description: string
  estimatedImpactMin: number
  estimatedImpactMax: number
  effortLevel: string
  timeHorizon: string
  status: 'todo' | 'in_progress' | 'done'
  sortOrder: number
  completedAt: string | null
  createdAt: string
}

interface RoadmapData {
  items: RoadmapActionItem[]
}

export function useRoadmap() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<RoadmapData>({
    queryKey: demoQueryKey(['roadmap', userId], userId),
    queryFn: async () => fetchWithDemo<RoadmapData>('/api/roadmap', DEMO_DATA.roadmap as RoadmapData),
    enabled: !!userId,
  })
}

export function useGenerateRoadmap() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (actions: Array<{
      factor: string
      actionTitle: string
      description: string
      estimatedImpactMin: number
      estimatedImpactMax: number
      effortLevel: string
      timeHorizon: string
    }>) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return { items: DEMO_DATA.roadmap.items, isDemo: true }
      }
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to generate roadmap')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] })
    },
  })
}

export function useUpdateRoadmapItemStatus() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 100))
        return { id, status, isDemo: true }
      }
      const res = await fetch(`/api/roadmap/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to update status')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] })
    },
  })
}