import { useQuery } from '@tanstack/react-query'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  contentHtml: string
  category: string
  imageUrl: string | null
  author: string
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export function useBlogPosts(category?: string) {
  return useQuery({
    queryKey: ['blog-posts', category],
    queryFn: async () => {
      const url = category
        ? `/api/blog?category=${encodeURIComponent(category)}`
        : '/api/blog'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch blog posts')
      return res.json() as Promise<BlogPost[]>
    },
  })
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`)
      if (!res.ok) throw new Error('Failed to fetch blog post')
      return res.json() as Promise<BlogPost>
    },
    enabled: !!slug,
  })
}