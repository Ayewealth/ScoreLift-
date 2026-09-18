import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'

interface CreditCard {
  id: string
  cardName: string
  creditLimit: string
  currentBalance: string
}

interface CreditProfile {
  id: string
  userId: string
  scoreBand: string
  missedPaymentCount: number
  missedPaymentRecency: string
  overallUtilisation: number
  oldestAccountAge: string
  totalAccounts: number
  hardInquiries12m: number
  derogatoryMarks: string[]
  creditMix: string[]
  estimatedScore: number | null
  updatedAt: string
}

interface ProfileData {
  profile: CreditProfile | null
  cards: CreditCard[]
}

interface ProfileInput {
  scoreBand: string
  missedPaymentCount?: number
  missedPaymentRecency?: string
  overallUtilisation?: number
  oldestAccountAge: string
  totalAccounts?: number
  hardInquiries12m?: number
  derogatoryMarks?: string[]
  creditMix: string[]
  cards?: Array<{
    cardName: string
    creditLimit: string
    currentBalance: string
  }>
}

export function useProfile() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<ProfileData>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json()
    },
    enabled: !!userId,
  })
}

export function useSaveProfile() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ProfileInput) => {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to save profile')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] })
    },
  })
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/onboarding/complete', { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to complete onboarding')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}