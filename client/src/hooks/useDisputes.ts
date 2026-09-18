import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { fetchWithDemo, demoQueryKey, isDemoMode } from '../lib/demo-utils'
import { DEMO_DATA } from '../lib/demo-data'

interface DisputeLetter {
  id: string
  templateId: string
  formData: Record<string, string>
  renderedHtml: string
  r2Key: string | null
  status: string
  bureauName: string | null
  createdAt: string
}

interface DisputeTemplate {
  id: string
  title: string
  description: string
  fields: { key: string; label: string; type: string }[]
}

export function useDisputeTemplates() {
  return useQuery<{ templates: DisputeTemplate[] }>({
    queryKey: ['dispute-templates'],
    queryFn: async () => {
      const res = await fetch('/api/disputes/templates')
      if (!res.ok) throw new Error('Failed to fetch templates')
      return res.json()
    },
    staleTime: Infinity,
  })
}

export function useDisputeLetters() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<{ disputes: DisputeLetter[] }>({
    queryKey: demoQueryKey(['disputes', userId], userId),
    queryFn: async () => fetchWithDemo('/api/disputes', DEMO_DATA.disputes),
    enabled: !!userId,
  })
}

export function useGenerateDispute() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (data: {
      templateId: string
      formData: Record<string, string>
      userName: string
      userAddress: string
      bureauId?: string
    }) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return {
          id: 'demo-dispute-new',
          ...data,
          renderedHtml: '',
          r2Key: null,
          status: 'draft',
          createdAt: new Date().toISOString(),
          isDemo: true,
        }
      }
      const res = await fetch('/api/disputes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to generate dispute letter')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes', userId] })
      queryClient.invalidateQueries({ queryKey: ['milestones', userId] })
    },
  })
}

export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return { id, status, isDemo: true }
      }
      const res = await fetch(`/api/disputes/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes', userId] })
    },
  })
}