import { API_BASE_URL } from './components/Blog/blogData'
import { SITE_URL } from './lib/site'

// 每小時重新產生一次，新文章最慢 1 小時內會出現在 sitemap
export const revalidate = 3600

async function getPosts() {
  if (!API_BASE_URL) return []
  try {
    const res = await fetch(`${API_BASE_URL}/api/posts`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (err) {
    // sitemap 不該因為後端暫時異常就讓整個 build 失敗
    console.error('sitemap 無法取得文章:', err)
    return []
  }
}

export default async function sitemap() {
  const posts = await getPosts()

  const staticRoutes = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  const postRoutes = posts
    .filter((post) => post?.id)
    .map((post) => ({
      url: `${SITE_URL}/blog/${post.id}`,
      lastModified: post.publishDate ? new Date(post.publishDate) : undefined,
      changeFrequency: 'monthly',
      priority: post.featured ? 0.8 : 0.6,
    }))

  return [...staticRoutes, ...postRoutes]
}
