import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'

export function useAccountDeletion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to initiate account deletion')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useAccountRestore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/account/restore', { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to restore account')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}