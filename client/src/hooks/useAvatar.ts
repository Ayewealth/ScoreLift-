import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'

export function useAvatar() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<{ url: string | null }>({
    queryKey: ['user', 'avatar', userId],
    queryFn: async () => {
      const res = await fetch('/api/user/avatar')
      if (!res.ok) throw new Error('Failed to fetch avatar')
      return res.json()
    },
    enabled: !!userId,
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch('/api/user/avatar', {
        method: 'PUT',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to upload avatar')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'avatar', userId] })
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}