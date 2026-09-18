interface SEOProps {
  title: string
  description: string
  ogImage?: string
  ogType?: string
  canonical?: string
}

export function updateMeta({ title, description, ogImage, ogType, canonical }: SEOProps) {
  document.title = `${title} | ScoreLift`

  const setMeta = (name: string, content: string, property = false) => {
    const attr = property ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  setMeta('description', description)
  setMeta('og:title', title, true)
  setMeta('og:description', description, true)
  setMeta('og:type', ogType ?? 'website', true)
  setMeta('og:image', ogImage ?? '/og-default.png', true)

  const baseUrl = 'https://scorelift.credit'
  if (canonical) {
    setMeta('og:url', `${baseUrl}${canonical}`, true)
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', `${baseUrl}${canonical}`)
  }

  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', title)
  setMeta('twitter:description', description)
}