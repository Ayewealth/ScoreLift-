import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { authClient } from '../lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Alert } from '../components/ui/alert'
import { Separator } from '../components/ui/separator'
import { Loader2, Mail, CheckCircle2, RefreshCw, LogIn } from 'lucide-react'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const [cooldown, setCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [manualCheckDone, setManualCheckDone] = useState(false)

  useGSAP(() => {
    gsap.set(pageRef.current, { autoAlpha: 0, y: 20 })
    gsap.to(pageRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' })
  }, { scope: pageRef })

  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await authClient.getSession()
      if (data?.user) {
        console.log('[VerifyEmail] Session poll:', { userId: data.user.id, emailVerified: data.user.emailVerified })
      } else {
        console.log('[VerifyEmail] Session poll: no session')
      }
      return data
    },
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.user?.emailVerified) return false
      return data?.user ? 5000 : false
    },
  })

  useEffect(() => {
    if (sessionQuery.data?.user?.emailVerified) {
      console.log('[VerifyEmail] Email verified via poll — navigating to /onboarding')
      navigate('/onboarding', { replace: true })
    }
  }, [sessionQuery.data?.user?.emailVerified, navigate])

  const hasSession = !!sessionQuery.data?.user

  const checkVerification = useMutation({
    mutationFn: async () => {
      const { data } = await authClient.getSession()
      return data
    },
    onSuccess: (data) => {
      console.log('[VerifyEmail] Manual check:', { hasSession: !!data?.user, emailVerified: data?.user?.emailVerified })
      setManualCheckDone(true)
      if (data?.user?.emailVerified) {
        navigate('/onboarding', { replace: true })
      }
    },
  })

  const resendVerification = useMutation({
    mutationFn: async () => {
      setIsResending(true)
      console.log('[VerifyEmail] Resending verification email')
      await fetch('/api/auth/resend-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    },
    onSuccess: () => {
      console.log('[VerifyEmail] Resend success — waiting for user to check email')
      setIsResending(false)
      setResendSuccess(true)
      setCooldown(60)
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0 }
          return prev - 1
        })
      }, 1000)
    },
    onError: (err) => {
      console.log('[VerifyEmail] Resend failed:', err)
      setIsResending(false)
    },
  })

  if (!hasSession) {
    return (
      <div ref={pageRef} className="w-full max-w-sm">
        <Card className="p-6 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf0e8]">
              <Mail className="h-6 w-6 text-[#4a7c59]" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a verification link to your email. Click it to activate your account, then sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => navigate('/login')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="w-full max-w-sm">
      <Card className="p-6 shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf0e8]">
            <Mail className="h-6 w-6 text-[#4a7c59]" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to your email. Click it to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionQuery.data?.user?.emailVerified ? (
            <Alert variant="success" title="Verified!">
              Redirecting to onboarding...
            </Alert>
          ) : (
            <>
              <Button
                className="w-full"
                onClick={() => checkVerification.mutate()}
                disabled={checkVerification.isPending}
              >
                {checkVerification.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    I've verified my email
                  </span>
                )}
              </Button>

              {manualCheckDone && !sessionQuery.data?.user?.emailVerified && (
                <Alert variant="warning" dismissible onDismiss={() => setManualCheckDone(false)}>
                  Not verified yet — click the link in your email, then try again. Check your spam
                  folder if you don't see it.
                </Alert>
              )}

              {resendSuccess && (
                <Alert variant="success" dismissible onDismiss={() => setResendSuccess(false)}>
                  Verification link resent! Check your inbox (and spam folder).
                </Alert>
              )}

              <Separator />

              <div className="text-center">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => resendVerification.mutate()}
                  disabled={isResending || cooldown > 0}
                >
                  {isResending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : cooldown > 0 ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Resend available in {cooldown}s
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Resend verification link
                    </span>
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-[#6a7a65]">
                Wrong email?{' '}
                <button
                  type="button"
                  className="font-medium text-[#4a7c59] underline-offset-4 hover:underline"
                  onClick={() => authClient.signOut().then(() => navigate('/signup', { replace: true }))}
                >
                  Sign out and start over
                </button>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}