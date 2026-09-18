import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

interface AuthGuardProps {
  children: ReactNode
  requireVerified?: boolean
  requireOnboarding?: boolean
}

function hasOnboarding(user: { onboardingComplete: boolean }): boolean {
  return user.onboardingComplete
}

export function AuthGuard({ children, requireVerified, requireOnboarding }: AuthGuardProps) {
  const { data: session, isPending, error } = useSession()
  const location = useLocation()

  if (isPending) return null

  if (error || !session) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    console.log(`[AuthGuard] No session — redirecting to /login?redirect=${redirect}`)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (requireVerified && !session.user.emailVerified) {
    console.log(`[AuthGuard] Email not verified — redirecting to /verify-email`)
    return <Navigate to="/verify-email" replace />
  }

  if (requireOnboarding && !hasOnboarding(session.user as unknown as { onboardingComplete: boolean })) {
    console.log(`[AuthGuard] Onboarding not complete — redirecting to /onboarding`)
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

export function GuestGuard({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession()

  if (isPending) return null

  if (!session) return <>{children}</>

  if (!session.user.emailVerified) {
    console.log(`[GuestGuard] Has session but email not verified — redirecting to /verify-email`)
    return <Navigate to="/verify-email" replace />
  }

  if (!hasOnboarding(session.user as unknown as { onboardingComplete: boolean })) {
    console.log(`[GuestGuard] Has session, verified, onboarding not complete — redirecting to /onboarding`)
    return <Navigate to="/onboarding" replace />
  }

  console.log(`[GuestGuard] Has session, verified, onboarded — redirecting to /dashboard`)
  return <Navigate to="/dashboard" replace />
}