import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { fetchWithDemo, demoQueryKey, isDemoMode } from '../lib/demo-utils'
import { DEMO_DATA } from '../lib/demo-data'

interface CheckinStatus {
  streak: number
  lastCheckin: { completedAt: string; scoreEstimate: number; deltaFromPrevious: number } | null
  daysSinceLastCheckin: number | null
  dueForCheckin: boolean
  totalCheckins: number
}

interface CheckinHistoryItem {
  id: string
  scoreEstimate: number
  deltaFromPrevious: number | null
  completedAt: string
  notes: string | null
}

export function useCheckinStatus() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<CheckinStatus>({
    queryKey: demoQueryKey(['checkin', 'status', userId], userId),
    queryFn: async () => fetchWithDemo('/api/checkin/status', DEMO_DATA.checkin.status),
    enabled: !!userId,
  })
}

export function useCheckinHistory() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<{ history: CheckinHistoryItem[] }>({
    queryKey: demoQueryKey(['checkin', 'history', userId], userId),
    queryFn: async () => fetchWithDemo('/api/checkin/history', { history: DEMO_DATA.checkin.history }),
    enabled: !!userId,
  })
}

export function useSubmitCheckin() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (data: {
      missedPaymentCount?: number
      missedPaymentRecency?: string
      cards?: { cardName: string; creditLimit: number; currentBalance: number }[]
      newAccounts?: number
      newInquiries?: number
    }) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return {
          success: true,
          scoreEstimate: 648,
          deltaFromPrevious: 6,
          factHealth: [],
          topActions: [],
          newlyUnlocked: [],
          isDemo: true,
        }
      }
      const res = await fetch('/api/checkin/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to submit check-in')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] })
      queryClient.invalidateQueries({ queryKey: ['checkin', userId] })
      queryClient.invalidateQueries({ queryKey: ['roadmap', userId] })
      queryClient.invalidateQueries({ queryKey: ['milestones', userId] })
    },
  })
}