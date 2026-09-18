import { Router } from 'express'
import { db } from '../db/client'
import { blogPosts } from '@shared/schema'
import { eq, desc } from 'drizzle-orm'

const router = Router()

router.get('/api/blog', async (req, res) => {
  try {
    const category = req.query.category as string | undefined
    const query = db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt))

    const results = category
      ? await query.where(eq(blogPosts.category, category))
      : await query

    res.json(results)
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

router.get('/api/blog/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1)

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' })
    }

    res.json(post)
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    res.status(500).json({ error: 'Failed to fetch blog post' })
  }
})

export default router