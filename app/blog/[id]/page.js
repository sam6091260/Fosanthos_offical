import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ScrollToTop from '../../components/ScrollToTop'
import { blogPosts } from '../../components/Blog/blogData'
import styles from './Article.module.css'

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    id: post.id,
  }))
}

export function generateMetadata({ params }) {
  const post = blogPosts.find((p) => p.id === params.id)
  if (!post) return { title: '文章未找到 | 心光卉' }
  return {
    title: `${post.title} | 心光卉`,
    description: post.excerpt,
  }
}

export default function ArticlePage({ params }) {
  const post = blogPosts.find((p) => p.id === params.id)
  
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

          <div className={styles.content}>
            {post.content.split('\n').map((line, i) => (
              line.trim() === ''
                ? <br key={i} />
                : <p key={i}>{line}</p>
            ))}
          </div>

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
