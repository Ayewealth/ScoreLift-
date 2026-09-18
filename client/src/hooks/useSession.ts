import { useQuery } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data, error } = await authClient.getSession()
      if (error) {
        console.error('[useSession] Failed to fetch session:', error)
        throw error
      }
      return data
    },
    staleTime: 1000 * 60 * 2,
    retry: false,
  })
}