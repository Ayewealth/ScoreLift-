import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useBlogPosts } from '../../hooks/useBlog'
import { useStaggerReveal } from '../../hooks/useAnimations'
import { updateMeta } from '../../lib/seo'
import { Button } from '../../components/ui/button'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const categories = [
  'All',
  'Score Building & Credit',
  'Debt',
  'Mortgages',
  'Credit Cards',
  'Financial Habits',
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BlogIndexPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const { data: posts, isLoading } = useBlogPosts(
    activeCategory === 'All' ? undefined : activeCategory,
  )

  useEffect(() => {
    updateMeta({
      title: 'Credit Blog — Tips, Guides & Advice',
      description: 'Expert advice on credit scores, utilisation, dispute letters, mortgages, and more. Practical guides to help you build better credit.',
      canonical: '/blog',
    })
  }, [])

  useGSAP(() => {
    const h1 = pageRef.current?.querySelector('h1')
    const p = pageRef.current?.querySelector('p')
    if (h1) gsap.from(h1, { autoAlpha: 0, y: 30, duration: 0.7, ease: 'power2.out' })
    if (p) gsap.from(p, { autoAlpha: 0, y: 20, duration: 0.5, delay: 0.2, ease: 'power2.out' })
  }, { scope: pageRef })

  useStaggerReveal(gridRef, '.blog-card', { stagger: 0.12 })

  return (
    <div ref={pageRef}>
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl italic leading-tight text-foreground md:text-5xl">
              ScoreLift Blog
            </h1>
            <p className="mt-4 font-body text-base text-muted-foreground md:text-lg">
              Expert advice, practical tips, and in-depth guides to help you
              understand and improve your credit.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                variant={activeCategory === cat ? 'default' : 'outline'}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-card"
                >
                  <div className="h-48 rounded-t-xl bg-moss" />
                  <div className="space-y-3 p-6">
                    <div className="h-4 w-24 rounded bg-moss" />
                    <div className="h-5 w-full rounded bg-moss" />
                    <div className="h-4 w-3/4 rounded bg-moss" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-body text-lg text-muted-foreground">
                No posts found in this category.
              </p>
            </div>
          ) : (
            <div ref={gridRef} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts?.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="blog-card group rounded-xl bg-card shadow-[0_2px_24px_rgba(74,124,89,0.08)] transition-shadow hover:shadow-[0_4px_32px_rgba(74,124,89,0.15)]"
                >
                  <div className="aspect-[16/9] overflow-hidden rounded-t-xl">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-moss">
                        <span className="font-heading text-2xl text-muted-foreground">
                          ScoreLift
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="inline-block rounded-full bg-moss px-3 py-1 font-body text-xs text-foreground">
                      {post.category}
                    </span>
                    <h3 className="mt-3 font-heading text-lg text-foreground group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mt-2 font-body text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishedAt)}
                      </div>
                      <span className="flex items-center gap-1 font-body text-xs font-medium text-primary">
                        Read more
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}