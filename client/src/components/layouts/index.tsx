import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'
import { authClient } from '../../lib/auth-client'
import { ChevronDown, LayoutDashboard, LogOut, Settings, User, Route, BarChart3, Target, CalendarCheck, ScrollText, FileText, BookOpen, Trophy, CreditCard, Bell, Menu, X, Mail, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from 'cn'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuPopup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'

export { AuthLayout } from './AuthLayout'

export function PublicLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <PublicSiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicSiteFooter />
    </div>
  )
}

function PublicSiteHeader() {
  const { data: session } = useSession()
  const user = session?.user
  const navigate = useNavigate()

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetch('/api/user/avatar')
        .then(r => r.json())
        .then(d => setAvatarUrl(d.url))
        .catch(() => {})
    }
  }, [user?.id])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/features', label: 'Features' },
    { to: '/calculators', label: 'Calculators' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/blog', label: 'Blog' },
    { to: '/about', label: 'About' },
  ]

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e8e6dd] bg-[#faf8f2]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20 4C14.5 4 8 10 8 18C8 26 16 36 20 36C24 36 32 26 32 18C32 10 25.5 4 20 4Z" fill="rgba(74,124,89,0.2)" stroke="#4a7c59" strokeWidth="2"/>
            <path d="M20 12V24" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 18H26" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="font-heading text-xl italic text-[#2d3a2a]">
            Score<span className="text-[#4a7c59]">Lift</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-[#6a7a65] transition-colors hover:text-[#4a7c59]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt={user?.name ?? 'User'} /> : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <ChevronDown className="size-4 text-[#6a7a65]" />
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuPositioner align="end">
                  <DropdownMenuPopup>
                    <div className="px-2.5 py-2 text-xs text-[#6a7a65]">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(session.user.emailVerified ? '/dashboard' : '/onboarding')}>
                      <LayoutDashboard className="size-4" />
                      {session.user.emailVerified ? 'Dashboard' : 'Continue onboarding'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings/billing')}>
                      <Settings className="size-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        await authClient.signOut()
                        navigate('/')
                      }}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuPopup>
                </DropdownMenuPositioner>
              </DropdownMenuPortal>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[#6a7a65] transition-colors hover:text-[#4a7c59]"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3d6b4d]"
              >
                Get started free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function PublicSiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[#e8e6dd] bg-[#faf8f2]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="font-heading text-xl italic text-[#2d3a2a]">
                Score<span className="text-[#4a7c59]">Lift</span>
              </span>
            </Link>
            <p className="mt-2 text-sm text-[#6a7a65]">
              Build better credit, transparently.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-lg text-[#2d3a2a]">Product</h4>
            <ul className="space-y-2 text-sm text-[#6a7a65]">
              <li><Link to="/features" className="hover:text-[#4a7c59]">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-[#4a7c59]">Pricing</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#4a7c59]">How It Works</Link></li>
              <li><Link to="/calculators" className="hover:text-[#4a7c59]">Calculators</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-lg text-[#2d3a2a]">Resources</h4>
            <ul className="space-y-2 text-sm text-[#6a7a65]">
              <li><Link to="/blog" className="hover:text-[#4a7c59]">Blog</Link></li>
              <li><Link to="/about" className="hover:text-[#4a7c59]">About</Link></li>
              <li><Link to="/contact" className="hover:text-[#4a7c59]">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-lg text-[#2d3a2a]">Legal</h4>
            <ul className="space-y-2 text-sm text-[#6a7a65]">
              <li><Link to="/privacy" className="hover:text-[#4a7c59]">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-[#4a7c59]">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#e8e6dd] pt-6 text-center text-sm text-[#6a7a65]">
          &copy; {currentYear} ScoreLift. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export function VerifyEmailLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Outlet />
    </div>
  )
}

export function OnboardingLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="flex min-h-screen items-center justify-center px-4 lg:px-16">
      <Outlet />
    </div>
  )
}

export function AppShell() {
  const location = useLocation()
  const { data: session } = useSession()
  const navigate = useNavigate()
  const user = session?.user
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  useEffect(() => {
    if (user?.id) {
      fetch('/api/user/avatar')
        .then(r => r.json())
        .then(d => setAvatarUrl(d.url))
        .catch(() => {})
    }
  }, [user?.id])

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?'

  interface NavItem {
    to: string
    label: string
    icon: typeof LayoutDashboard
    active: boolean
  }

  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: 'Main',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
        { to: '/roadmap', label: 'Roadmap', icon: Route, active: true },
      ],
    },
    {
      label: 'Tools',
      items: [
        { to: '/simulator', label: 'Simulator', icon: BarChart3, active: true },
        { to: '/goals', label: 'Goals', icon: Target, active: true },
        { to: '/checkin', label: 'Check-In', icon: CalendarCheck, active: true },
      ],
    },
    {
      label: 'Resources',
      items: [
        { to: '/disputes', label: 'Disputes', icon: ScrollText, active: true },
        { to: '/documents', label: 'Documents', icon: FileText, active: true },
        { to: '/education', label: 'Education', icon: BookOpen, active: true },
        { to: '/milestones', label: 'Milestones', icon: Trophy, active: true },
      ],
    },
    {
      label: 'Account',
      items: [
        { to: '/settings', label: 'Settings', icon: Settings, active: true },
        { to: '/settings/billing', label: 'Billing', icon: CreditCard, active: true },
      ],
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden md:flex md:flex-col w-64 h-screen border-r border-[#e8e6dd] bg-card shrink-0 overflow-y-auto">
        <div className="py-4 px-4 flex items-center justify-center border-b border-[#e8e6dd]">
          <Link to="/dashboard" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20 4C14.5 4 8 10 8 18C8 26 16 36 20 36C24 36 32 26 32 18C32 10 25.5 4 20 4Z" fill="rgba(74,124,89,0.2)" stroke="#4a7c59" strokeWidth="2"/>
              <path d="M20 12V24" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 18H26" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-heading text-xl italic text-foreground">
              Score<span className="text-primary">Lift</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 font-body text-sm transition-colors',
                        location.pathname === item.to
                          ? 'bg-[#eaf0e8] text-primary font-medium'
                          : item.active
                            ? 'text-muted-foreground hover:text-foreground hover:bg-[#eaf0e8]/50'
                            : 'text-muted-foreground/40 cursor-not-allowed',
                      )}
                      onClick={(e) => {
                        if (!item.active) e.preventDefault()
                      }}
                      {...(!item.active ? { 'aria-disabled': true, title: 'Coming soon' } : {})}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                      {!item.active && (
                        <span className="ml-auto rounded-full bg-[#f5f0e0] px-1.5 py-0.5 text-[10px] text-[#d4a843]">
                          Soon
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-16 shrink-0 border-b border-[#e8e6dd] bg-card/95 backdrop-blur-sm flex items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[#eaf0e8] hover:text-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 4C14.5 4 8 10 8 18C8 26 16 36 20 36C24 36 32 26 32 18C32 10 25.5 4 20 4Z" fill="rgba(74,124,89,0.2)" stroke="#4a7c59" strokeWidth="2"/>
                <path d="M20 12V24" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
                <path d="M14 18H26" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="font-heading text-lg italic text-foreground">
                Score<span className="text-primary">Lift</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[#eaf0e8] hover:text-foreground" aria-label="Notifications">
                <Bell className="size-5" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#d4a843]" />
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuPositioner align="end" className="w-72">
                  <DropdownMenuPopup>
                    <div className="px-3 py-2.5">
                      <p className="font-heading text-sm text-[#2d3a2a]">Notifications</p>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="px-3 py-6 text-center">
                      <Bell className="mx-auto size-6 text-[#6a7a65]" />
                      <p className="mt-2 font-body text-sm text-[#6a7a65]">No new notifications</p>
                      <p className="font-body text-xs text-[#6a7a65]">Check-in reminders and milestone alerts appear here.</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/milestones')} className="justify-center gap-2 text-xs text-[#4a7c59]">
                      <Sparkles className="size-3.5" />
                      View milestones
                    </DropdownMenuItem>
                  </DropdownMenuPopup>
                </DropdownMenuPositioner>
              </DropdownMenuPortal>
            </DropdownMenu>
            <button
              onClick={async () => {
                await authClient.signOut()
                navigate('/')
              }}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Avatar className="size-8">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={user?.name ?? 'User'} /> : null}
                <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-foreground">{user?.name ?? 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-[#e8e6dd] bg-card shadow-lg">
              <div className="flex items-center justify-between border-b border-[#e8e6dd] px-4 py-4">
                <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M20 4C14.5 4 8 10 8 18C8 26 16 36 20 36C24 36 32 26 32 18C32 10 25.5 4 20 4Z" fill="rgba(74,124,89,0.2)" stroke="#4a7c59" strokeWidth="2"/>
                    <path d="M20 12V24" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M14 18H26" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="font-heading text-lg italic text-foreground">
                    Score<span className="text-primary">Lift</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[#eaf0e8] hover:text-foreground"
                  aria-label="Close navigation menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-5">
                {navGroups.map((group) => (
                  <div key={group.label} className="mb-6">
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                      {group.label}
                    </p>
                    <ul className="space-y-0.5">
                      {group.items.map((item) => (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 font-body text-sm transition-colors',
                              location.pathname === item.to
                                ? 'bg-[#eaf0e8] text-primary font-medium'
                                : item.active
                                  ? 'text-muted-foreground hover:text-foreground hover:bg-[#eaf0e8]/50'
                                  : 'text-muted-foreground/40 cursor-not-allowed',
                            )}
                          >
                            <item.icon className="size-4 shrink-0" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}