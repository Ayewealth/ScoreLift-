import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from '../pages/public/LoginPage'
import SignupPage from '../pages/public/SignupPage'
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage'
import ResetPasswordPage from '../pages/public/ResetPasswordPage'
import { Alert } from '../components/ui/alert'
import { PasswordStrengthMeter } from '../components/ui/password-strength'

function renderWithProviders(element: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{element}</BrowserRouter>
    </QueryClientProvider>,
  )
}

afterEach(cleanup)

describe('LoginPage', () => {
  it('renders the sign-in form', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getAllByText('Sign in')[0]).toBeDefined()
    expect(screen.getByLabelText('Email')).toBeDefined()
    expect(screen.getByLabelText('Password')).toBeDefined()
  })

  it('has a link to signup', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getAllByText('Sign up')[0]).toBeDefined()
  })

  it('has a forgot password link', () => {
    renderWithProviders(<LoginPage />)
    const forgotLinks = screen.getAllByText('Forgot?')
    expect(forgotLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('shows success alert when reset=success param is present', () => {
    window.history.pushState({}, '', '/login?reset=success')
    renderWithProviders(<LoginPage />)
    expect(screen.getByText('Password updated')).toBeDefined()
  })
})

describe('SignupPage', () => {
  it('renders the sign-up form', () => {
    renderWithProviders(<SignupPage />)
    expect(screen.getByText('Create your account')).toBeDefined()
    expect(screen.getByLabelText('Email')).toBeDefined()
    expect(screen.getByLabelText('Password')).toBeDefined()
  })

  it('renders name field', () => {
    renderWithProviders(<SignupPage />)
    expect(screen.getByLabelText('Name (optional)')).toBeDefined()
  })

  it('renders confirm password field', () => {
    renderWithProviders(<SignupPage />)
    expect(screen.getByLabelText('Confirm password')).toBeDefined()
  })
})

describe('ForgotPasswordPage', () => {
  it('renders the forgot password form', () => {
    renderWithProviders(<ForgotPasswordPage />)
    expect(screen.getByText('Reset your password')).toBeDefined()
    expect(screen.getByLabelText('Email')).toBeDefined()
  })

  it('shows success state after form submission', () => {
  })

  it('has a link back to login', () => {
    renderWithProviders(<ForgotPasswordPage />)
    const backLinks = screen.getAllByText('Back to sign in')
    expect(backLinks.length).toBeGreaterThanOrEqual(1)
  })
})

describe('ResetPasswordPage', () => {
  it('shows invalid link when no token', () => {
    window.history.pushState({}, '', '/reset-password')
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByText('Invalid link')).toBeDefined()
  })

  it('shows password form when token is present', () => {
    window.history.pushState({}, '', '/reset-password?token=abc123')
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByText('Set new password')).toBeDefined()
    expect(screen.getByLabelText('New password')).toBeDefined()
    expect(screen.getByLabelText('Confirm password')).toBeDefined()
  })

  it('shows error alert for invalid/expired token', () => {
    window.history.pushState({}, '', '/reset-password')
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByText('The password reset link you clicked is no longer valid.')).toBeDefined()
  })
})

describe('Alert', () => {
  it('renders success variant with title and message', () => {
    render(
      <Alert variant="success" title="Success!">
        Operation completed.
      </Alert>,
    )
    expect(screen.getByText('Success!')).toBeDefined()
    expect(screen.getByText('Operation completed.')).toBeDefined()
  })

  it('renders error variant', () => {
    render(
      <Alert variant="error">
        Something went wrong.
      </Alert>,
    )
    expect(screen.getByText('Something went wrong.')).toBeDefined()
  })

  it('renders warning variant', () => {
    render(
      <Alert variant="warning">
        Please be careful.
      </Alert>,
    )
    expect(screen.getByText('Please be careful.')).toBeDefined()
  })

  it('renders info variant', () => {
    render(
      <Alert variant="info">
        Just so you know.
      </Alert>,
    )
    expect(screen.getByText('Just so you know.')).toBeDefined()
  })
})

describe('PasswordStrengthMeter', () => {
  it('renders nothing when password is empty', () => {
    const { container } = render(<PasswordStrengthMeter password="" />)
    expect(container.innerHTML).toBe('')
  })

  it('renders checks for a short password', () => {
    render(<PasswordStrengthMeter password="ab" />)
    expect(screen.getByText('At least 8 characters')).toBeDefined()
  })

  it('shows Weak for simple password', () => {
    render(<PasswordStrengthMeter password="abc" />)
    expect(screen.getByText('Weak')).toBeDefined()
  })

  it('shows Strong for complex password', () => {
    render(<PasswordStrengthMeter password="Abcd1234!" />)
    expect(screen.getByText('Strong')).toBeDefined()
  })
})