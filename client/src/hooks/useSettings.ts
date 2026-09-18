import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'

interface NotificationPreferences {
  checkinReminder: boolean
  milestoneEmails: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
}

export function useNotificationPreferences() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<NotificationPreferences>({
    queryKey: ['settings', 'notifications', userId],
    queryFn: async () => {
      const res = await fetch('/api/settings/notifications')
      if (!res.ok) throw new Error('Failed to fetch notification preferences')
      return res.json()
    },
    enabled: !!userId,
  })
}

export function useUpdateNotificationPreferences() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to update notification preferences')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'notifications', userId] })
    },
  })
}

export function useUpdateProfileName() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to update name')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to change password')
      }
      return res.json()
    },
  })
}