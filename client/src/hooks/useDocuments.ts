import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { fetchWithDemo, demoQueryKey, isDemoMode } from '../lib/demo-utils'
import { DEMO_DATA } from '../lib/demo-data'

interface Document {
  id: string
  filename: string
  fileSize: number
  fileType: string
  category: string
  notes: string | null
  linkedDisputeId: string | null
  createdAt: string
}

export function useDocuments() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<{ documents: Document[] }>({
    queryKey: demoQueryKey(['documents', userId], userId),
    queryFn: async () => fetchWithDemo('/api/documents', DEMO_DATA.documents),
    enabled: !!userId,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (data: { file: File; category?: string; notes?: string }) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return {
          id: 'demo-doc-upload',
          filename: data.file.name,
          fileSize: data.file.size,
          fileType: data.file.type,
          category: data.category ?? 'uncategorized',
          notes: data.notes ?? null,
          linkedDisputeId: null,
          createdAt: new Date().toISOString(),
          isDemo: true,
        }
      }
      const formData = new FormData()
      formData.append('file', data.file)
      if (data.category) formData.append('category', data.category)
      if (data.notes) formData.append('notes', data.notes)
      const res = await fetch('/api/documents/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Upload failed')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', userId] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return { success: true, isDemo: true }
      }
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete document')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', userId] })
    },
  })
}