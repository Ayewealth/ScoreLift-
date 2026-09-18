import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { authClient } from '../../lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Alert } from '../../components/ui/alert'
import { updateMeta } from '../../lib/seo'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useGSAP(() => {
    gsap.set(pageRef.current, { autoAlpha: 0, y: 20 })
    gsap.to(pageRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    if (formRef.current) {
      const children = Array.from(formRef.current.children)
      gsap.set(children, { autoAlpha: 0, y: 12 })
      gsap.to(children, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.08,
        delay: 0.2,
      })
    }
  }, { scope: pageRef })

  const login = useMutation({
    mutationFn: () => authClient.signIn.email({ email, password }),
    onSuccess: ({ data, error }) => {
      console.log('[Login] signIn result:', {
        hasSession: !!data?.user,
        emailVerified: data?.user?.emailVerified,
        userId: data?.user?.id ?? null,
        hasError: !!error,
        errorMsg: error?.message ?? null,
      })
      if (error) {
        setApiError(error.message || 'Something went wrong. Please try again.')
        return
      }
      if (!data) return
      if (!data.user.emailVerified) {
        navigate('/verify-email', { replace: true })
      } else if (!(data.user as unknown as { onboardingComplete: boolean }).onboardingComplete) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate(redirect, { replace: true })
      }
    },
    onError: (err) => {
      console.log('[Login] signIn threw:', err)
    },
  })

  const [apiError, setApiError] = useState<string | null>(null)
  const errorMessage = apiError || (login.error
    ? login.error.message === 'Invalid email or password'
      ? 'Invalid email or password. Please check your credentials and try again.'
      : login.error.message || 'Something went wrong. Please try again.'
    : null)

  return (
    <div ref={pageRef}>
      <Card className="w-full p-6 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">Sign in</CardTitle>
          <CardDescription className="font-body text-sm">
            Enter your email and password to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams.get('reset') === 'success' && (
            <div className="mb-4">
              <Alert variant="success" title="Password updated">
                Your password has been reset successfully. Sign in with your new password.
              </Alert>
            </div>
          )}

          {login.error && apiError && (
            <div className="mb-4">
              <Alert
                variant="error"
                dismissible
                onDismiss={() => { login.reset(); setApiError(null) }}
              >
                {errorMessage}
              </Alert>
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={(e) => { e.preventDefault(); login.mutate() }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#6a7a65] underline-offset-4 hover:text-[#4a7c59] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-[#6a7a65]">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-[#4a7c59] underline-offset-4 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}