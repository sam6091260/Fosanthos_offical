import { notFound } from 'next/navigation'
import Image from 'next/image'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop'
import { API_BASE_URL } from '../../components/Blog/blogData'
import JsonLd from '../../components/JsonLd'
import { SITE_URL, SITE_NAME, absoluteUrl } from '../../lib/site'
import styles from './Article.module.css'
import ArticleContainer from './ArticleContainer'

// ISR：文章靜態化，最多 60 秒後自動更新。
// 後台儲存文章時會另外呼叫 /api/revalidate 立即更新，不用等這 60 秒。
export const revalidate = 60

async function getPost(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch (err) {
    console.error('無法取得文章:', err)
    return null
  }
}

// build 時預先產生所有已發布文章的靜態頁面；
// 新文章不在清單內也能正常運作（dynamicParams 預設為 true）
export async function generateStaticParams() {
  if (!API_BASE_URL) return []
  try {
    const res = await fetch(`${API_BASE_URL}/api/posts`, { cache: 'no-store' })
    if (!res.ok) return []
    const posts = await res.json()
    if (!Array.isArray(posts)) return []
    return posts.filter((p) => p?.id).map((p) => ({ id: String(p.id) }))
  } catch (err) {
    // 後端暫時無法連線時不要讓 build 失敗，改為全部走 on-demand 產生
    console.error('generateStaticParams 無法取得文章:', err)
    return []
  }
}

// 找出可用的縮圖：優先用非 mp4 的主圖，其次找 gallery 裡的靜態圖，最後用 logo
function pickOgImage(post) {
  const isVideo = (url) => url && url.endsWith('.mp4')
  const galleryImages = (post.gallery || []).filter((img) => !isVideo(img))
  return !isVideo(post.image)
    ? post.image
    : galleryImages.length > 0
    ? galleryImages[0]
    : '/logo_square.png'  // 相對路徑，Next.js 會自動套用 metadataBase
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.id)
  if (!post) {
    return { title: '文章未找到 | 心光卉', robots: { index: false, follow: true } }
  }

  const pageUrl = `${SITE_URL}/blog/${post.id}`
  const ogImage = pickOgImage(post)

  return {
    title: `${post.title} | 心光卉`,
    description: post.excerpt || post.title,
    alternates: {
      canonical: `/blog/${post.id}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: pageUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      locale: 'zh_TW',
      publishedTime: post.publishDate,
      authors: [post.author],
      section: post.categoryLabel,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: [ogImage],
    },
  }
}

function buildArticleSchema(post) {
  const pageUrl = `${SITE_URL}/blog/${post.id}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    headline: post.title,
    description: post.excerpt || post.title,
    image: [absoluteUrl(pickOgImage(post))],
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    articleSection: post.categoryLabel,
    inLanguage: 'zh-TW',
    author: {
      '@type': 'Person',
      name: post.author || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo_square.png'),
      },
    },
  }
}

function buildBreadcrumbSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '部落格分享', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.id}` },
    ],
  }
}

export default async function ArticlePage({ params }) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  return (
    <>
      <JsonLd data={[buildArticleSchema(post), buildBreadcrumbSchema(post)]} />
      <Navbar />
      <main className={styles.article}>
        {post.image && !post.image.endsWith('.mp4') ? (
          <div className={styles.heroImage}>
            {/* 文章頁的 LCP 元素：priority 讓它優先載入，不要 lazy */}
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="100vw"
              priority
            />
            <div className={styles.heroImageOverlay} />
          </div>
        ) : (
          <div className={styles.noImageContainer} />
        )}

        <ArticleContainer post={post} />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
