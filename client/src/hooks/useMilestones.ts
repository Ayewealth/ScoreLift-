import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { fetchWithDemo, demoQueryKey } from '../lib/demo-utils'
import { DEMO_DATA } from '../lib/demo-data'

interface MilestoneItem {
  type: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
}

export function useMilestones() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<{ milestones: MilestoneItem[] }>({
    queryKey: demoQueryKey(['milestones', userId], userId),
    queryFn: async () => fetchWithDemo('/api/milestones', DEMO_DATA.milestones),
    enabled: !!userId,
  })
}