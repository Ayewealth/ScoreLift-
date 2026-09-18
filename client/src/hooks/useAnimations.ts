import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal(ref: React.RefObject<Element | null>, options?: {
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  threshold?: number
}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 40, ...options?.from },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: `top ${options?.threshold ?? 85}%`,
            toggleActions: 'play none none reverse',
          },
          ...options?.to,
        },
      )
    })

    return () => ctx.revert()
  }, [ref, options])
}

export function useStaggerReveal(
  containerRef: React.RefObject<Element | null>,
  selector: string,
  options?: {
    from?: gsap.TweenVars
    stagger?: number
  },
) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        selector,
        { autoAlpha: 0, y: 30, ...options?.from },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: options?.stagger ?? 0.12,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [containerRef, selector, options])
}

export function useCountUp(
  ref: React.RefObject<Element | null>,
  targetValue: number,
  options?: { duration?: number; prefix?: string; suffix?: string },
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obj = { value: 0 }
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        value: targetValue,
        duration: options?.duration ?? 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (el) {
            el.textContent = `${options?.prefix ?? ''}${Math.round(obj.value)}${options?.suffix ?? ''}`
          }
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      })
    })

    return () => ctx.revert()
  }, [ref, targetValue, options])
}

export function usePageEnter(ref: React.RefObject<Element | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.from(el, {
        autoAlpha: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out',
      })
    })

    return () => ctx.revert()
  }, [ref])
}

export function useHoverScale(ref: React.RefObject<Element | null>, scale = 1.03) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () => {
        gsap.to(el, { scale, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      })
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      })
    })

    return () => ctx.revert()
  }, [ref, scale])
}