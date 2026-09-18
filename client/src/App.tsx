import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { queryClient } from './lib/query-client'
import { PublicLayout, VerifyEmailLayout, OnboardingLayout, AppShell, AuthLayout } from './components/layouts'
import { AuthGuard, GuestGuard } from './lib/route-guard'
import { ErrorBoundary } from './components/error-boundary'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import LoginPage from './pages/public/LoginPage'
import SignupPage from './pages/public/SignupPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import ResetPasswordPage from './pages/public/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import BillingPage from './pages/app/settings/BillingPage'
import SettingsPage from './pages/app/settings/SettingsPage'
import OnboardingPage from './pages/app/OnboardingPage'
import DashboardPage from './pages/app/DashboardPage'
import RoadmapPage from './pages/app/RoadmapPage'
import HomePage from './pages/public/HomePage'
import HowItWorksPage from './pages/public/HowItWorksPage'
import FeaturesPage from './pages/public/FeaturesPage'
import PricingPage from './pages/public/PricingPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import PrivacyPage from './pages/public/PrivacyPage'
import TermsPage from './pages/public/TermsPage'
import CalculatorsHubPage from './pages/public/CalculatorsHubPage'
import UtilisationRatioCalculator from './pages/public/UtilisationRatioCalculator'
import PaymentImpactEstimator from './pages/public/PaymentImpactEstimator'
import ScoreBandEstimator from './pages/public/ScoreBandEstimator'
import FIREReadinessChecker from './pages/public/FIREReadinessChecker'
import MortgageReadinessEstimator from './pages/public/MortgageReadinessEstimator'
import BlogIndexPage from './pages/public/BlogIndexPage'
import BlogPostPage from './pages/public/BlogPostPage'
import CheckinPage from './pages/app/CheckinPage'
import GoalsPage from './pages/app/GoalsPage'
import MilestonesPage from './pages/app/MilestonesPage'
import SimulatorPage from './pages/app/SimulatorPage'
import DisputesPage from './pages/app/DisputesPage'
import DocumentsPage from './pages/app/DocumentsPage'
import EducationPage from './pages/app/EducationPage'
import NotFoundPage from './pages/NotFoundPage'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">{title}</p>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="how-it-works" element={<HowItWorksPage />} />
              <Route path="features" element={<FeaturesPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="calculators" element={<CalculatorsHubPage />} />
              <Route path="calculators/utilisation-ratio" element={<UtilisationRatioCalculator />} />
              <Route path="calculators/payment-impact" element={<PaymentImpactEstimator />} />
              <Route path="calculators/score-band" element={<ScoreBandEstimator />} />
              <Route path="calculators/fire-readiness" element={<FIREReadinessChecker />} />
              <Route path="calculators/mortgage-readiness" element={<MortgageReadinessEstimator />} />
              <Route path="blog" element={<BlogIndexPage />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route element={<GuestGuard><LoginPage /></GuestGuard>} path="/login" />
              <Route element={<GuestGuard><SignupPage /></GuestGuard>} path="/signup" />
              <Route element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} path="/forgot-password" />
              <Route element={<GuestGuard><ResetPasswordPage /></GuestGuard>} path="/reset-password" />
            </Route>

            <Route element={<VerifyEmailLayout />}>
              <Route element={<VerifyEmailPage />} path="/verify-email" />
            </Route>

            <Route element={<OnboardingLayout />}>
              <Route
                element={<AuthGuard requireVerified><OnboardingPage /></AuthGuard>}
                path="/onboarding"
              />
            </Route>

            <Route element={<AppShell />}>
              <Route
                element={<AuthGuard requireVerified requireOnboarding><DashboardPage /></AuthGuard>}
                path="/dashboard"
              />
              <Route
                element={<AuthGuard requireVerified requireOnboarding><RoadmapPage /></AuthGuard>}
                path="/roadmap"
              />
              <Route
                element={<AuthGuard requireVerified requireOnboarding><SettingsPage /></AuthGuard>}
                path="/settings"
              />
              <Route
                element={<AuthGuard requireVerified requireOnboarding><BillingPage /></AuthGuard>}
                path="/settings/billing"
              />
              <Route
                element={<AuthGuard requireVerified requireOnboarding><SimulatorPage /></AuthGuard>}
                path="/simulator"
              />
              <Route
                element={<AuthGuard requireVerified requireOnboarding><CheckinPage /></AuthGuard>}
                path="/checkin"
              />
              <Route
                element={<AuthGuard requireVerified requireOnboarding><MilestonesPage /></AuthGuard>}
                path="/milestones"
              />
              <Route
                element={<AuthGuard requireVerified requireOnboarding><GoalsPage /></AuthGuard>}
                path="/goals"
              />
              <Route
                element={<AuthGuard requireVerified requireOnboarding><DisputesPage /></AuthGuard>}
                path="/disputes"
              />
              <Route
                element={<AuthGuard requireVerified requireOnboarding><DocumentsPage /></AuthGuard>}
                path="/documents"
              />
              <Route
                element={<AuthGuard requireVerified requireOnboarding><EducationPage /></AuthGuard>}
                path="/education"
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
        </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}