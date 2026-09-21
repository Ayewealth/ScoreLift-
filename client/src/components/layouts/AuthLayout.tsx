import { useRef, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

function DecorativePanel() {
  const panelRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (panelRef.current) {
      gsap.from(panelRef.current.children, {
        autoAlpha: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.12,
        delay: 0.3,
      })
    }
  }, { scope: panelRef })

  return (
    <div
      ref={panelRef}
      className="relative hidden h-full flex-col items-center justify-center bg-[#4a7c59] p-12 lg:flex"
    >
      <div className="absolute bottom-0 right-0 text-[80px] opacity-10">🌱</div>
      <div className="absolute left-8 top-8 text-[60px] opacity-10">🌿</div>

      <div className="relative z-10 max-w-md text-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20 4C14.5 4 8 10 8 18C8 26 16 36 20 36C24 36 32 26 32 18C32 10 25.5 4 20 4Z" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2"/>
            <path d="M20 12V24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 18H26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="font-heading text-3xl italic text-white">ScoreLift</span>
        </div>

        <h2 className="font-heading text-4xl italic leading-tight text-white">
          Grow your credit <em className="not-italic">where it's planted</em>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/80">
          Tending your credit is like tending a garden — steady, patient, and deeply rewarding.
          No bank connections, no bureau APIs. Just transparent, explainable scoring.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 font-heading text-lg text-white">
                {['✓', '↑', '★'][i - 1]}
              </div>
            ))}
          </div>
          <span className="text-sm text-white/60">Trusted by thousands</span>
        </div>
      </div>
    </div>
  )
}

export function AuthLayout() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  useGSAP(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.querySelector('.auth-form-area'), {
        autoAlpha: 0,
        y: 12,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.2,
      })
    }
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="grid min-h-screen overflow-hidden lg:grid-cols-2">
      <DecorativePanel />
      <div className="auth-form-area flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-2 flex items-center justify-center gap-2">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 4C14.5 4 8 10 8 18C8 26 16 36 20 36C24 36 32 26 32 18C32 10 25.5 4 20 4Z" fill="rgba(74,124,89,0.2)" stroke="#4a7c59" strokeWidth="2"/>
                <path d="M20 12V24" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
                <path d="M14 18H26" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="font-heading text-xl italic text-[#4a7c59]">ScoreLift</span>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}