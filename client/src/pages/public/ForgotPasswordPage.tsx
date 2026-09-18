import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Alert } from '../../components/ui/alert'
import { updateMeta } from '../../lib/seo'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    updateMeta({
      title: 'Forgot Password',
      description: 'Reset your ScoreLift password. Enter your email and we\'ll send you a reset link.',
      canonical: '/forgot-password',
    })
  }, [])

  useGSAP(() => {
    gsap.set(pageRef.current, { autoAlpha: 0, y: 20 })
    gsap.to(pageRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    if (formRef.current && !sent) {
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
  }, { scope: pageRef, dependencies: [sent] })

  const forgotPassword = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to send reset link' }))
        throw new Error(err.message || 'Failed to send reset link')
      }
      return res.json()
    },
    onSuccess: () => setSent(true),
  })

  if (sent) {
    return (
      <div ref={pageRef}>
        <Card className="w-full p-6 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf0e8]">
              <CheckCircle2 className="h-6 w-6 text-[#4a7c59]" />
            </div>
            <CardTitle className="font-heading text-2xl">Check your email</CardTitle>
            <CardDescription className="font-body text-sm">
              If an account exists for that email, we've sent a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="success">
              Reset link sent! Check your inbox (and spam folder).
            </Alert>
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#4a7c59] underline-offset-4 hover:underline"
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

  return (
    <div ref={pageRef}>
      <Card className="w-full shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">Reset your password</CardTitle>
          <CardDescription className="font-body text-sm">
            Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forgotPassword.error && (
            <div className="mb-4">
              <Alert
                variant="error"
                dismissible
                onDismiss={() => forgotPassword.reset()}
              >
                {forgotPassword.error.message || 'Something went wrong. Please try again.'}
              </Alert>
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={(e) => { e.preventDefault(); forgotPassword.mutate() }}
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

            <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send reset link'
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