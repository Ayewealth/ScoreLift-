import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { fetchWithDemo, demoQueryKey, isDemoMode } from '../lib/demo-utils'
import { DEMO_DATA } from '../lib/demo-data'

interface TrackWithProgress {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  sortOrder: number
  lessonCount: number
  completedCount: number
  progress: number
}

interface LessonWithProgress {
  id: string
  title: string
  slug: string
  contentHtml: string
  readTimeMinutes: number
  sortOrder: number
  completed: boolean
}

export function useEducationTracks() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<{ tracks: TrackWithProgress[] }>({
    queryKey: demoQueryKey(['education', 'tracks', userId], userId),
    queryFn: async () => fetchWithDemo('/api/education/tracks', DEMO_DATA.education),
    enabled: !!userId,
  })
}

export function useEducationTrack(trackId: string | undefined) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery<{ track: TrackWithProgress; lessons: LessonWithProgress[]; progress: number }>({
    queryKey: demoQueryKey(['education', 'track', trackId, userId], userId),
    queryFn: async () => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        const track = DEMO_DATA.education.tracks.find(t => t.id === trackId)
        if (!track) throw new Error('Track not found')
        return {
          track,
          lessons: [
            { id: 'demo-lesson-1', title: 'What is a Credit Score?', slug: 'what-is-credit-score', contentHtml: '<h2>Understanding Credit Scores</h2><p>A credit score is a three-digit number that lenders use to assess your creditworthiness. Scores range from 300 to 850.</p>', readTimeMinutes: 5, sortOrder: 0, completed: true },
            { id: 'demo-lesson-2', title: 'How Scores Are Calculated', slug: 'how-scores-calculated', contentHtml: '<h2>Score Calculation</h2><p>Your credit score is calculated based on payment history (35%), credit utilisation (30%), length of credit history (15%), new credit (10%), and credit mix (10%).</p>', readTimeMinutes: 7, sortOrder: 1, completed: true },
            { id: 'demo-lesson-3', title: 'Improving Your Score', slug: 'improving-your-score', contentHtml: '<h2>Improvement Strategies</h2><p>Focus on paying bills on time, reducing credit card balances, and avoiding unnecessary credit applications.</p>', readTimeMinutes: 6, sortOrder: 2, completed: false },
          ],
          progress: 40,
        }
      }
      const res = await fetch(`/api/education/tracks/${trackId}`)
      if (!res.ok) throw new Error('Failed to fetch track')
      return res.json()
    },
    enabled: !!trackId && !!userId,
  })
}

export function useCompleteLesson() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async ({ lessonId, quizScore }: { lessonId: string; quizScore?: number }) => {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 200))
        return { success: true, trackComplete: false, isDemo: true }
      }
      const res = await fetch(`/api/education/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizScore }),
      })
      if (!res.ok) throw new Error('Failed to complete lesson')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', userId] })
      queryClient.invalidateQueries({ queryKey: ['milestones', userId] })
    },
  })
}