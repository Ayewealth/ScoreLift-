import { Component, type ReactNode } from 'react'
import gsap from 'gsap'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (!prevState.hasError && this.state.hasError) {
      const container = document.getElementById('error-fallback')
      if (container) {
        gsap.from(container.children, {
          autoAlpha: 0,
          y: 20,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.1,
        })
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          id="error-fallback"
          className="flex min-h-screen items-center justify-center bg-[#faf8f2] px-4"
        >
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 flex items-center justify-center gap-2">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 4C14.5 4 8 10 8 18C8 26 16 36 20 36C24 36 32 26 32 18C32 10 25.5 4 20 4Z" fill="rgba(74,124,89,0.15)" stroke="#4a7c59" strokeWidth="2"/>
                <path d="M20 12V24" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
                <path d="M14 18H26" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="font-heading text-2xl italic text-[#2d3a2a]">
                Score<span className="text-[#4a7c59]">Lift</span>
              </span>
            </div>

            <h1 className="font-heading text-3xl font-bold text-[#2d3a2a]">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#6a7a65]">
              We encountered an unexpected error. Please try again or contact us if the problem
              persists.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={this.handleReset}
                className="rounded-lg bg-[#4a7c59] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d6b4d]"
              >
                Try again
              </button>
              <a
                href="/contact"
                className="text-sm font-medium text-[#6a7a65] underline-offset-4 transition-colors hover:text-[#4a7c59] hover:underline"
              >
                Contact support
              </a>
            </div>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 rounded-lg bg-[#2d3a2a] p-4 text-left text-xs text-[#faf8f2]">
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}