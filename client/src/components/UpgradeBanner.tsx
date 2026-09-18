import { Sparkles, ArrowUpRight, Crown } from 'lucide-react'
import { Button } from './ui/button'

export type PlanGate = 'pro' | 'annual_pro'

interface UpgradeBannerProps {
  feature: string
  description?: string
  gate?: PlanGate
  onUpgrade?: () => void
}

const PLAN_DATA = {
  pro: { label: 'Pro', price: '$9.99/mo', cta: 'Upgrade to Pro', buttonClass: 'bg-[#4a7c59] hover:bg-[#3d6b4d] text-white' },
  annual_pro: { label: 'Annual Pro', price: '$89/yr', cta: 'Upgrade to Annual Pro', buttonClass: 'bg-[#4a7c59] hover:bg-[#3d6b4d] text-white' },
}

export default function UpgradeBanner({ feature, description, gate = 'pro', onUpgrade }: UpgradeBannerProps) {
  const plan = PLAN_DATA[gate]

  return (
    <div className="rounded-xl border border-[#4a7c59]/20 bg-gradient-to-br from-[#eaf0e8] to-[#faf8f2] p-6 shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#4a7c59]/10">
          <Crown className="size-5 text-[#4a7c59]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base text-[#2d3a2a]">{feature}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#4a7c59]/10 px-2.5 py-0.5 font-body text-[10px] font-medium text-[#4a7c59]">
              <Sparkles className="size-3" />
              {plan.label}
            </span>
          </div>
          <p className="mt-1 font-body text-sm text-[#6a7a65]">
            {description ?? `This feature requires a ${plan.label} subscription. Upgrade to unlock unlimited access.`}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={onUpgrade} className={`font-body text-sm ${plan.buttonClass}`}>
              <ArrowUpRight className="mr-1.5 size-4" />
              {plan.cta} — {plan.price}
            </Button>
            <p className="font-body text-xs text-[#6a7a65]">
              Switch anytime. No long-term commitment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}