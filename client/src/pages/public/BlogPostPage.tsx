import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useBlogPost, useBlogPosts } from '../../hooks/useBlog'
import { useScrollReveal } from '../../hooks/useAnimations'
import { updateMeta } from '../../lib/seo'
import { Button } from '../../components/ui/button'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading, error } = useBlogPost(slug ?? '')
  const { data: allPosts } = useBlogPosts()
  const pageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const relatedPosts = allPosts
    ?.filter((p) => p.slug !== slug && p.category === post?.category)
    .slice(0, 3)

  useEffect(() => {
    if (post) {
      updateMeta({
        title: post.title,
        description: post.excerpt,
        canonical: `/blog/${post.slug}`,
        ogImage: post.imageUrl ?? undefined,
        ogType: 'article',
      })
    }
  }, [post])

  useGSAP(() => {
    const h1 = pageRef.current?.querySelector('h1')
    const meta = pageRef.current?.querySelector('.post-meta')
    if (h1) gsap.from(h1, { autoAlpha: 0, y: 30, duration: 0.7, ease: 'power2.out' })
    if (meta) gsap.from(meta, { autoAlpha: 0, y: 20, duration: 0.5, delay: 0.2, ease: 'power2.out' })
  }, { scope: pageRef })

  useScrollReveal(contentRef)
  useScrollReveal(sidebarRef)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 rounded bg-moss" />
          <div className="h-10 w-3/4 rounded bg-moss" />
          <div className="h-64 w-full rounded-xl bg-moss" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-moss" />
            <div className="h-4 w-5/6 rounded bg-moss" />
            <div className="h-4 w-4/6 rounded bg-moss" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl text-foreground">
          Post not found
        </h1>
        <p className="mt-4 font-body text-muted-foreground">
          The blog post you are looking for does not exist.
        </p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 font-body text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </div>
    )
  }

  return (
    <div ref={pageRef}>
      <article className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_320px]">
            <div>
              {post.imageUrl && (
                <div className="mb-8 overflow-hidden rounded-xl">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full object-cover"
                  />
                </div>
              )}

              <div className="post-meta flex flex-wrap items-center gap-4 font-body text-sm text-muted-foreground">
                <span className="inline-block rounded-full bg-moss px-3 py-1 font-body text-xs text-foreground">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              <h1 className="mt-4 font-heading text-3xl text-foreground md:text-4xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              <div
                ref={contentRef}
                className="mt-8 font-body text-base text-foreground leading-relaxed space-y-4 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />

              <div className="mt-12 rounded-xl border border-border bg-moss p-8 text-center">
                <h3 className="font-heading text-2xl text-foreground">
                  Ready to put these tips into action?
                </h3>
                <p className="mt-2 font-body text-base text-muted-foreground">
                  Get your personalised credit roadmap and start improving your
                  score today.
                </p>
                <div className="mt-6">
                  <Link to="/signup">
                    <Button size="lg">Get started free</Button>
                  </Link>
                </div>
              </div>
            </div>

            <aside ref={sidebarRef}>
              <div className="sticky top-24 space-y-8">
                {relatedPosts && relatedPosts.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-heading text-lg text-foreground">
                      Related posts
                    </h3>
                    <div className="mt-4 space-y-4">
                      {relatedPosts.map((rp) => (
                        <Link
                          key={rp.id}
                          to={`/blog/${rp.slug}`}
                          className="group block"
                        >
                          <p className="font-body text-sm font-medium text-foreground group-hover:text-primary">
                            {rp.title}
                          </p>
                          <p className="mt-1 font-body text-xs text-muted-foreground">
                            {formatDate(rp.publishedAt)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-heading text-lg text-foreground">
                    Free credit tools
                  </h3>
                  <div className="mt-4 space-y-3">
                    <Link to="/calculators/utilisation-ratio" className="block font-body text-sm text-muted-foreground hover:text-primary">
                      Utilisation Calculator
                    </Link>
                    <Link to="/calculators/payment-impact" className="block font-body text-sm text-muted-foreground hover:text-primary">
                      Payment Impact Estimator
                    </Link>
                    <Link to="/calculators/mortgage-readiness" className="block font-body text-sm text-muted-foreground hover:text-primary">
                      Mortgage Readiness
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </div>
  )
}