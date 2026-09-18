import { useEffect, useState, useCallback } from 'react'

const DEMO_KEY = 'scorelift_demo_mode'

export function useDemoMode() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(DEMO_KEY) === 'true')

  const toggle = useCallback((value: boolean) => {
    setEnabled(value)
    if (value) {
      localStorage.setItem(DEMO_KEY, 'true')
    } else {
      localStorage.removeItem(DEMO_KEY)
    }
  }, [])

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === DEMO_KEY) {
        setEnabled(e.newValue === 'true')
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return { demoMode: enabled, toggleDemoMode: toggle }
}

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_KEY) === 'true'
}