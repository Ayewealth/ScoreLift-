import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { cn } from 'cn'

const alertVariants = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[#eaf0e8]',
    border: 'border-[#4a7c59]/30',
    text: 'text-[#2d3a2a]',
    iconColor: 'text-[#4a7c59]',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-[#fae8e8]',
    border: 'border-[#c0392b]/30',
    text: 'text-[#2d3a2a]',
    iconColor: 'text-[#c0392b]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[#f5f0e0]',
    border: 'border-[#d4a843]/30',
    text: 'text-[#2d3a2a]',
    iconColor: 'text-[#d4a843]',
  },
  info: {
    icon: Info,
    bg: 'bg-[#eaf0e8]/60',
    border: 'border-[#6a7a65]/20',
    text: 'text-[#2d3a2a]',
    iconColor: 'text-[#6a7a65]',
  },
}

interface AlertProps {
  variant?: keyof typeof alertVariants
  title?: string
  children: React.ReactNode
  onDismiss?: () => void
  className?: string
  dismissible?: boolean
}

export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
  dismissible = true,
}: AlertProps) {
  const ref = useRef<HTMLDivElement>(null)
  const vars = alertVariants[variant]
  const Icon = vars.icon

  useEffect(() => {
    if (ref.current) {
      gsap.from(ref.current, {
        autoAlpha: 0,
        y: -12,
        duration: 0.35,
        ease: 'power2.out',
      })
    }
  }, [])

  function handleDismiss() {
    if (!ref.current) return
    gsap.to(ref.current, {
      autoAlpha: 0,
      y: -12,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => onDismiss?.(),
    })
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        vars.bg,
        vars.border,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', vars.iconColor)} aria-hidden="true" />
      <div className="flex-1 space-y-1">
        {title && (
          <p className={cn('text-sm font-medium', vars.text)}>{title}</p>
        )}
        <div className={cn('text-sm leading-relaxed', vars.text, !title && 'font-medium')}>
          {children}
        </div>
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            'mt-0.5 shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5',
            vars.text,
          )}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}