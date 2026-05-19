'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './Blog.module.css'
import { API_BASE_URL, categories } from './blogData'

// ─── 圖片元件（含 Skeleton 過渡） ──────────
function BlogImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`${className} ${styles.imageWrapper}`}>
      {!loaded && <div className={styles.skeleton} />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={loaded ? styles.imageLoaded : styles.imageLoading}
      />
    </div>
  )
}

// ─── Skeleton 卡片佔位元件 ──────────
function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={`${styles.cardImage} ${styles.skeleton}`} />
      <div className={styles.cardBody}>
        <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonText}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonText}`} />
      </div>
    </div>
  )
}

function SkeletonFeatured() {
  return (
    <div className={styles.featured}>
      <div className={`${styles.featuredImage} ${styles.skeleton}`} />
      <div className={styles.featuredBody}>
        <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonText}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonText}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} style={{ marginTop: '12px' }} />
      </div>
    </div>
  )
}

export default function Blog() {
  const searchParams = useSearchParams()
  // Server 與 Client 初次 render 保持一致（'all'），mount 後再從 sessionStorage 還原
  const [activeCategory, setActiveCategory] = useState('all')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // 從 API 取得文章資料
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/api/posts`)
        if (!res.ok) throw new Error('API 請求失敗')
        const data = await res.json()
        setPosts(data)
      } catch (err) {
        console.error('無法取得文章:', err)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // mount 後從 sessionStorage 還原（避免 SSR hydration mismatch）
  useEffect(() => {
    const saved = sessionStorage.getItem('blog_category')
    if (saved && categories.some(c => c.key === saved)) {
      setActiveCategory(saved)
    }
  }, [])

  // 分類變化時儲存到 sessionStorage
  useEffect(() => {
    sessionStorage.setItem('blog_category', activeCategory)
  }, [activeCategory])

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat && categories.some(c => c.key === cat)) {
      setActiveCategory(cat)
      // Scroll to the blog section if on the same page
      const blogSection = document.getElementById('blog')
      if (blogSection) {
        blogSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [searchParams])

  const filteredPosts =
    activeCategory === 'all'
      ? posts
      : posts.filter((p) => p.category === activeCategory)

  // 找出精選文章（第一篇 featured）
  const featuredPost = filteredPosts.find((p) => p.featured)
  const regularPosts = filteredPosts.filter((p) => p !== featuredPost)

  return (
    <section id="blog" className={styles.blog} aria-label="部落格分享">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <span className="section-label">部落格分享</span>
          <h2 className={styles.heading}>
            每一段故事，都是一束光
          </h2>
          <p className={styles.subheading}>
            學員的轉變、課程的溫度、寶老師的日常觀察 — 在這裡慢慢讀。
          </p>
        </div>

        {/* Category Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="文章分類">
          {categories.map((cat) => (
            <button
              key={cat.key}
              role="tab"
              aria-selected={activeCategory === cat.key}
              className={`${styles.tab} ${activeCategory === cat.key ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory(cat.key)}
              id={`blog-tab-${cat.key}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skeleton Loading State */}
        {loading && (
          <>
            <SkeletonFeatured />
            <div className={styles.grid}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className={styles.loading}>
            <p>目前沒有文章</p>
          </div>
        )}

        {/* Featured Post */}
        {!loading && featuredPost && (
          <article className={styles.featured} id={`blog-featured-${featuredPost.id}`}>
            {featuredPost.image && (
              <div className={styles.featuredImage}>
                {featuredPost.image.endsWith('.mp4') ? (
                  <video
                    src={featuredPost.image}
                    autoPlay loop muted playsInline
                    preload="metadata"
                    onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.1 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <BlogImage src={featuredPost.image} alt={featuredPost.title} className={styles.featuredImageInner} />
                )}
                <div className={styles.featuredImageOverlay} />
              </div>
            )}
            <div className={styles.featuredBody}>
              <span className={styles.categoryBadge} data-category={featuredPost.category}>
                {featuredPost.categoryLabel}
              </span>
              <Link href={`/blog/${featuredPost.id}`} className={styles.featuredTitleLink}>
                <h3 className={styles.featuredTitle}>{featuredPost.title}</h3>
              </Link>
              <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>
              <div className={styles.postMeta}>
                <span className={styles.postAuthor}>{featuredPost.author}</span>
                <span className={styles.postDot}>·</span>
                <span className={styles.postDate}>{featuredPost.date}</span>
              </div>
              <Link
                href={`/blog/${featuredPost.id}`}
                className={styles.readMore}
                id={`blog-read-${featuredPost.id}`}
              >
                閱讀全文
                <span className={styles.readMoreArrow}>→</span>
              </Link>
            </div>
          </article>
        )}

        {/* Regular Posts Grid */}
        {!loading && (
          <div className={styles.grid}>
            {regularPosts.map((post) => (
              <article
                key={post.id}
                className={styles.card}
                id={`blog-card-${post.id}`}
              >
                {post.image ? (
                  <div className={styles.cardImage}>
                    {post.image.endsWith('.mp4') ? (
                      <video src={post.image} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <BlogImage src={post.image} alt={post.title} className={styles.cardImageInner} />
                    )}
                    <div className={styles.cardImageOverlay} />
                  </div>
                ) : (
                  <div className={styles.cardImagePlaceholder} data-category={post.category}>
                    <span className={styles.placeholderIcon}>
                      {post.category === 'student' ? '✦' :
                        post.category === 'course' ? '◎' :
                          post.category === 'teacher-course' ? '✧' :
                            post.category === 'video' ? '▸' : '✎'}
                    </span>
                  </div>
                )}
                <div className={styles.cardBody}>
                  <span className={styles.categoryBadge} data-category={post.category}>
                    {post.categoryLabel}
                  </span>
                  <Link href={`/blog/${post.id}`} className={styles.cardTitleLink}>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                  </Link>
                  <p className={styles.cardExcerpt}>{post.excerpt}</p>
                  <div className={styles.postMeta}>
                    <span className={styles.postAuthor}>{post.author}</span>
                    <span className={styles.postDot}>·</span>
                    <span className={styles.postDate}>{post.date}</span>
                  </div>
                  <Link
                    href={`/blog/${post.id}`}
                    className={styles.readMore}
                    id={`blog-read-${post.id}`}
                  >
                    閱讀全文
                    <span className={styles.readMoreArrow}>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className={styles.viewAll}>
          <a href="/" className={styles.viewAllBtn} id="blog-back-home">
            回到首頁
            <span className={styles.readMoreArrow}>→</span>
          </a>
        </div>
      </div>
    </section >
  )
}
