import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Alert } from '../../components/ui/alert'
import { PasswordStrengthMeter } from '../../components/ui/password-strength'
import { updateMeta } from '../../lib/seo'
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    updateMeta({
      title: 'Reset Password',
      description: 'Set a new password for your ScoreLift account.',
      canonical: '/reset-password',
    })
  }, [])

  useGSAP(() => {
    gsap.set(pageRef.current, { autoAlpha: 0, y: 20 })
    gsap.to(pageRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    if (formRef.current && token) {
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
  }, { scope: pageRef, dependencies: [token] })

  const resetPassword = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to reset password')
      }
      return res.json()
    },
    onSuccess: () => {
      navigate('/login?reset=success', { replace: true })
    },
  })

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword
  const canSubmit = password === confirmPassword && password.length >= 8

  if (!token) {
    return (
      <div ref={pageRef}>
        <Card className="w-full p-6 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">Invalid link</CardTitle>
            <CardDescription className="font-body text-sm">
              This reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="error">
              The password reset link you clicked is no longer valid.
            </Alert>
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#4a7c59] underline-offset-4 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Request a new reset link
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div ref={pageRef}>
      <Card className="w-full p-6 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">Set new password</CardTitle>
          <CardDescription className="font-body text-sm">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetPassword.error && (
            <div className="mb-4">
              <Alert
                variant="error"
                dismissible
                onDismiss={() => resetPassword.reset()}
              >
                {resetPassword.error.message || 'Failed to reset password. The link may have expired.'}
              </Alert>
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault()
              if (password !== confirmPassword) return
              resetPassword.mutate()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="flex items-center gap-1 text-xs text-[#c0392b]" role="alert">
                  <XCircle className="h-3 w-3" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword.length > 0 && passwordsMatch && password.length >= 8 && (
                <p className="flex items-center gap-1 text-xs text-[#4a7c59]">
                  <CheckCircle2 className="h-3 w-3" />
                  Passwords match
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={resetPassword.isPending || !canSubmit}>
              {resetPassword.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </span>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-[#6a7a65]">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 font-medium text-[#4a7c59] underline-offset-4 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}