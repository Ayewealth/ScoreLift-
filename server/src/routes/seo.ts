import { Router } from 'express'
import { db } from '../db/client'
import { blogPosts } from '@shared/schema'
import { desc } from 'drizzle-orm'

const router = Router()

router.get('/sitemap.xml', async (_req, res) => {
  const baseUrl = process.env.APP_URL || 'https://scorelift.credit'

  const staticPages = [
    '', '/how-it-works', '/features', '/pricing',
    '/about', '/contact', '/privacy', '/terms',
    '/calculators', '/blog',
    '/calculators/utilisation-ratio', '/calculators/payment-impact',
    '/calculators/score-band', '/calculators/fire-readiness',
    '/calculators/mortgage-readiness',
  ]

  let blogUrls = ''
  try {
    const posts = await db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt))

    blogUrls = posts
      .map((p) => `
  <url>
    <loc>${baseUrl}/blog/${p.slug}</loc>
    <lastmod>${(p.updatedAt ?? new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`)
      .join('')
  } catch {
    // Blog table might not exist yet
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (p) => `
  <url>
    <loc>${baseUrl}${p}</loc>
    <changefreq>${p === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
  ${blogUrls}
</urlset>`

  res.header('Content-Type', 'application/xml')
  res.send(sitemap)
})

router.get('/robots.txt', (_req, res) => {
  const baseUrl = process.env.APP_URL || 'https://scorelift.credit'
  const robots = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Allow: /api/health

Sitemap: ${baseUrl}/sitemap.xml`

  res.header('Content-Type', 'text/plain')
  res.send(robots)
})

export default router