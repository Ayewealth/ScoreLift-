import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send, Clock, MessageCircle, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { updateMeta } from '../../lib/seo'
import { useScrollReveal, useStaggerReveal, usePageEnter } from '../../hooks/useAnimations'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const responseTimes = [
  {
    icon: Clock,
    title: 'Same day',
    description: 'Most messages get a reply within 24 hours during business days.',
  },
  {
    icon: MessageCircle,
    title: 'Priority support',
    description: 'Pro and Annual Pro members get priority response — usually within 2 hours.',
  },
  {
    icon: Mail,
    title: 'Weekend replies',
    description: 'Messages sent on weekends are answered first thing Monday.',
  },
]

const contactMethods = [
  {
    title: 'Email us directly',
    description: 'Prefer a direct email? Reach out to hello@scorelift.credit and we will get back to you.',
    action: 'Send an email',
    href: 'mailto:hello@scorelift.credit',
  },
  {
    title: 'Follow us',
    description: 'Stay updated on tips, features, and credit education content.',
    action: 'Follow @scorelift',
    href: '#',
  },
]

export default function ContactPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const responseRef = useRef<HTMLDivElement>(null)
  const methodsRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    updateMeta({
      title: 'Contact Us — Get in Touch',
      description: 'Have a question or feedback? Contact the ScoreLift team. We respond within 24 hours on business days.',
      canonical: '/contact',
    })
  }, [])

  usePageEnter(pageRef)

  useScrollReveal(responseRef)
  useStaggerReveal(responseRef, '.response-card', { stagger: 0.12 })
  useScrollReveal(methodsRef)
  useStaggerReveal(methodsRef, '.method-card', { stagger: 0.1 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSubmitted(true)
      if (successRef.current) {
        gsap.from(successRef.current, { autoAlpha: 0, scale: 0.9, duration: 0.6, ease: 'power2.out' })
      }
    } catch {
      setError('Something went wrong. Please try again or email us directly at hello@scorelift.credit.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div ref={pageRef}>
        <section ref={successRef} className="py-16 md:py-24">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <Mail className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 font-heading text-4xl text-foreground md:text-5xl">
              Message sent
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Thank you for reaching out. We will get back to you as soon as
              possible — typically within 24 hours on business days.
            </p>
            <div className="mt-8">
              <Button render={<Link to="/" />}>
                Back to home
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div ref={pageRef}>
      <section ref={formRef} className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-heading text-4xl text-foreground md:text-5xl">
              Contact us
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground">
              Have a question, feedback, or just want to say hello? We would love
              to hear from you.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 rounded-xl border border-border bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)] space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                />
              </div>
              {error && (
                <div className="rounded-lg border border-[#c0392b]/20 bg-[#fae8e8] p-3 font-body text-sm text-[#c0392b]" role="alert">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={submitting}>
                <Send className="h-4 w-4" />
                {submitting ? 'Sending...' : 'Send message'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section ref={responseRef} className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              How quickly we respond
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              We aim to reply to every message as fast as possible.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {responseTimes.map((item) => (
              <div
                key={item.title}
                className="response-card rounded-xl bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-moss">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-xl text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 font-body text-base text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={methodsRef} className="bg-[#eaf0e8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-foreground">
              Other ways to reach us
            </h2>
            <p className="mt-2 font-body text-base text-muted-foreground">
              Not a fan of forms? Here are other ways to get in touch.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="method-card rounded-xl bg-card p-8 shadow-[0_2px_24px_rgba(74,124,89,0.08)]"
              >
                <h3 className="font-heading text-xl text-foreground">
                  {method.title}
                </h3>
                <p className="mt-2 font-body text-base text-muted-foreground">
                  {method.description}
                </p>
                <div className="mt-4">
                  <a
                    href={method.href}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-2 font-body text-sm font-medium text-foreground transition-colors hover:bg-moss"
                  >
                    {method.action}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}