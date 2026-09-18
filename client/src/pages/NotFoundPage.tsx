import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f2] px-4">
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

        <h1 className="font-heading text-5xl font-bold text-[#2d3a2a]">404</h1>
        <p className="mt-2 font-heading text-2xl italic text-[#4a7c59]">Page not found</p>
        <p className="mt-3 text-sm leading-relaxed text-[#6a7a65]">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-block rounded-lg bg-[#4a7c59] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d6b4d]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}