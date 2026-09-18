import { isDemoMode } from '../hooks/useDemoMode'
import { DEMO_DATA } from './demo-data'

export { isDemoMode }

export function demoQueryKey(baseKey: (string | undefined)[], userId?: string | undefined): (string | undefined)[] {
  if (isDemoMode()) return ['demo', ...baseKey]
  return baseKey
}

export async function fetchWithDemo<T>(
  url: string,
  demoData: T,
): Promise<T> {
  if (isDemoMode()) {
    await new Promise(r => setTimeout(r, 200))
    return demoData
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`)
  return res.json()
}