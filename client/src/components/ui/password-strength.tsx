import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'
import { cn } from 'cn'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
}

function evaluateStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
  barColor: string
  checks: { label: string; met: boolean }[]
} {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ]

  const metCount = checks.filter((c) => c.met).length

  if (password.length === 0) return { score: 0, label: '', color: '', barColor: '#e8e6dd', checks }
  if (metCount <= 1) return { score: 1, label: 'Weak', color: '#c0392b', barColor: '#c0392b', checks }
  if (metCount <= 2) return { score: 2, label: 'Fair', color: '#d4a843', barColor: '#d4a843', checks }
  if (metCount <= 3) return { score: 3, label: 'Good', color: '#6a7a65', barColor: '#6a7a65', checks }
  return { score: 4, label: 'Strong', color: '#4a7c59', barColor: '#4a7c59', checks }
}

export function PasswordStrengthMeter({ password }: PasswordStrengthProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const result = useMemo(() => evaluateStrength(password), [password])

  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, {
        width: `${(result.score / 4) * 100}%`,
        backgroundColor: result.barColor,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [result.score, result.barColor])

  if (password.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8e6dd]">
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{ width: '0%', backgroundColor: '#e8e6dd' }}
        />
      </div>

      {result.label && (
        <p className="text-xs font-medium" style={{ color: result.color }}>
          {result.label}
        </p>
      )}

      <ul className="space-y-1">
        {result.checks.map((check) => (
          <li key={check.label} className="flex items-center gap-1.5 text-xs">
            {check.met ? (
              <Check className="h-3 w-3 text-[#4a7c59]" aria-hidden="true" />
            ) : (
              <X className="h-3 w-3 text-[#c0392b]" aria-hidden="true" />
            )}
            <span className={check.met ? 'text-[#4a7c59]' : 'text-[#6a7a65]'}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}