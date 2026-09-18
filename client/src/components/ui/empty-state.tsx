import { type LucideIcon } from 'lucide-react'
import { cn } from 'cn'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionLink?: string
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-[#e8e6dd] bg-card px-6 py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#eaf0e8]">
          <Icon className="size-6 text-[#4a7c59]" />
        </div>
      )}
      <h3 className="font-heading text-lg font-semibold text-[#2d3a2a]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#6a7a65]">{description}</p>
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="mt-5 inline-block rounded-lg bg-[#4a7c59] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3d6b4d]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}