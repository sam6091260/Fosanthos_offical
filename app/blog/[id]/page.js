import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ScrollToTop from '../../components/ScrollToTop'
import { API_BASE_URL } from '../../components/Blog/blogData'
import Gallery from './Gallery'
import MarkdownContent from './MarkdownContent'
import styles from './Article.module.css'

async function getPost(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
      cache: 'no-store', // 每次都取最新資料
    })
    if (!res.ok) return null
    return res.json()
  } catch (err) {
    console.error('無法取得文章:', err)
    return null
  }
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.id)
  if (!post) return { title: '文章未找到 | 心光卉' }

  const pageUrl = `https://fosanthos.com/blog/${post.id}`
  // 影片文章用 logo 作為預覽圖
  const ogImage = post.image && !post.image.endsWith('.mp4')
    ? post.image
    : 'https://fosanthos.com/logo_square.png'

  return {
    title: `${post.title} | 心光卉`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: pageUrl,
      siteName: '心光卉 Fosanthos',
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
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: [ogImage],
    },
  }
}

export default async function ArticlePage({ params }) {
  const post = await getPost(params.id)
  
  if (!post) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className={styles.article}>
        {post.image && !post.image.endsWith('.mp4') ? (
          <div className={styles.heroImage}>
            <img src={post.image} alt={post.title} />
            <div className={styles.heroImageOverlay} />
          </div>
        ) : (
          <div className={styles.noImageContainer} />
        )}

        <div className={styles.container}>
          <span className={styles.categoryBadge} data-category={post.category}>
            {post.categoryLabel}
          </span>
          <h1 className={styles.title}>{post.title}</h1>
          
          <div className={styles.meta}>
            <span className={styles.author}>{post.author}</span>
            <span className={styles.dot}>·</span>
            <span className={styles.date}>{post.date}</span>
          </div>

          <div className={styles.divider} />

          {post.image && post.image.endsWith('.mp4') && (
            <div className={styles.videoPlayerContainer}>
              <video 
                src={post.image} 
                controls 
                playsInline 
                className={styles.videoPlayer}
              />
            </div>
          )}

          <MarkdownContent content={post.content} />

          <Gallery images={post.gallery} title={post.title} />

          {(post.category === 'course' || post.category === 'teacher-course') && (
            <div className={styles.ctaContainer}>
              <Link href="/#contact" className={styles.ctaButton}>
                立即報名諮詢
                <span className={styles.ctaIcon}>✦</span>
              </Link>
            </div>
          )}

          <Link href="/blog" className={styles.backBtn}>
            <span className={styles.arrow}>←</span>
            回到部落格列表
          </Link>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
