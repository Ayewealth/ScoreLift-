import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { authClient } from '../../lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Alert } from '../../components/ui/alert'
import { PasswordStrengthMeter } from '../../components/ui/password-strength'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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

  const signup = useMutation({
    mutationFn: () => authClient.signUp.email({ email, password, name }),
    onSuccess: ({ error }) => {
      if (error) return
      navigate('/verify-email', { replace: true })
    },
  })

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword
  const canSubmit = password === confirmPassword && password.length >= 8

  return (
    <div ref={pageRef}>
      <Card className="w-full p-6 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">Create your account</CardTitle>
          <CardDescription className="font-body text-sm">No credit card required</CardDescription>
        </CardHeader>
        <CardContent>
          {signup.error && (
            <div className="mb-4">
              <Alert
                variant="error"
                dismissible
                onDismiss={() => signup.reset()}
              >
                {signup.error.message || 'Something went wrong. Please try again.'}
              </Alert>
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={(e) => { e.preventDefault(); signup.mutate() }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
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
                  Passwords do not match
                </p>
              )}
              {confirmPassword.length > 0 && passwordsMatch && password.length >= 8 && (
                <p className="flex items-center gap-1 text-xs text-[#4a7c59]">
                  Passwords match
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={signup.isPending || !canSubmit}>
              {signup.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-[#6a7a65]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#4a7c59] underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}