'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Blog.module.css'
import { API_BASE_URL, categories, CATEGORY_LABELS } from './blogData'
import CategoryFromQuery from './CategoryFromQuery'
import LazyVideo from './LazyVideo'

// ─── 圖片元件（含 Skeleton 過渡） ──────────
// 外層 .imageWrapper 是 position: relative，所以用 fill 讓 next/image 自動轉檔並填滿容器
function BlogImage({ src, alt, className, sizes = '(max-width: 768px) 100vw, 480px', priority = false }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`${className} ${styles.imageWrapper}`}>
      {!loaded && <div className={styles.skeleton} />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
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

// sidebar：由 Server Component 傳入的側邊欄內容（例：近期開課）
// 桌機在文章列表右側（捲動時黏住）；手機排在文章列表下方，不擠壓文章
// 一般文章每次顯示幾篇（精選文章另計）；捲到底自動再顯示一批
const PAGE_SIZE = 8

export default function Blog({ sidebar = null }) {
  // Server 與 Client 初次 render 保持一致（'all'），mount 後再從 sessionStorage 還原
  const [activeCategory, setActiveCategory] = useState('all')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef(null)

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

  // 已顯示篇數：從文章頁「上一頁」回來時還原，不會又縮回 8 篇
  useEffect(() => {
    const saved = Number(sessionStorage.getItem('blog_visible'))
    if (saved > PAGE_SIZE) setVisibleCount(saved)
  }, [])

  useEffect(() => {
    sessionStorage.setItem('blog_visible', String(visibleCount))
  }, [visibleCount])

  // 切換分類：從頭顯示 8 篇
  const selectCategory = (key) => {
    setActiveCategory(key)
    setVisibleCount(PAGE_SIZE)
  }

  const filteredPosts =
    activeCategory === 'all'
      ? posts
      : posts.filter((p) => p.category === activeCategory)

  // 找出精選文章（第一篇 featured）
  const featuredPost = filteredPosts.find((p) => p.featured)
  const regularPosts = filteredPosts.filter((p) => p !== featuredPost)
  const visiblePosts = regularPosts.slice(0, visibleCount)
  const remaining = regularPosts.length - visiblePosts.length

  // 列表底部的觀察點進入畫面附近 → 再顯示一批。
  // 每次篇數變動都重新觀察：若觀察點仍在範圍內會再觸發，直到填滿畫面或沒有更多。
  useEffect(() => {
    if (loading || remaining <= 0) return
    const el = sentinelRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((c) => c + PAGE_SIZE)
      },
      { rootMargin: '400px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [loading, remaining, visibleCount])

  return (
    <section id="blog" className={styles.blog} aria-label="部落格分享">
      {/* 網址 ?category=xxx 的處理隔離在自己的 Suspense 內，不影響本區塊的 SSR */}
      <Suspense fallback={null}>
        <CategoryFromQuery onCategory={setActiveCategory} />
      </Suspense>

      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <span className="section-label">部落格分享</span>
          <h1 className={styles.heading}>
            每一段故事，都是一束光
          </h1>
          <p className={styles.subheading}>
            學員的轉變、課程的溫度、寶老師的日常觀察，在這裡慢慢讀。
          </p>
        </div>

        <div className={styles.layout}>
        <div className={styles.mainCol}>
        {/* Category Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="文章分類">
          {categories.map((cat) => (
            <button
              key={cat.key}
              role="tab"
              aria-selected={activeCategory === cat.key}
              className={`${styles.tab} ${activeCategory === cat.key ? styles.tabActive : ''}`}
              onClick={() => selectCategory(cat.key)}
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
                  <LazyVideo src={featuredPost.image} />
                ) : (
                  // 精選圖是列表第一眼看到的大圖（LCP）：優先載入，不要 lazy
                  <BlogImage
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className={styles.featuredImageInner}
                    sizes="(max-width: 768px) 100vw, 360px"
                    priority
                  />
                )}
                <div className={styles.featuredImageOverlay} />
              </div>
            )}
            <div className={styles.featuredBody}>
              <span className={styles.categoryBadge} data-category={featuredPost.category}>
                {CATEGORY_LABELS[featuredPost.category] || featuredPost.categoryLabel}
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
            {visiblePosts.map((post) => (
              <article
                key={post.id}
                className={styles.card}
                id={`blog-card-${post.id}`}
              >
                {post.image ? (
                  <div className={styles.cardImage}>
                    {post.image.endsWith('.mp4') ? (
                      <LazyVideo src={post.image} />
                    ) : (
                      <BlogImage
                        src={post.image}
                        alt={post.title}
                        className={styles.cardImageInner}
                        sizes="(max-width: 768px) 100vw, 240px"
                      />
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
                    {CATEGORY_LABELS[post.category] || post.categoryLabel}
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

        {/* 還有更多文章：觀察點（捲到附近自動載入）＋ 手動按鈕（備用、鍵盤可操作） */}
        {!loading && remaining > 0 && (
          <div ref={sentinelRef} className={styles.loadMore}>
            <button
              type="button"
              className={styles.loadMoreBtn}
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              顯示更多文章（還有 {remaining} 篇）
            </button>
          </div>
        )}
        </div>{/* /mainCol */}

        {/* 側邊欄（近期開課）：內容為空時由 CSS :empty 隱藏，文章列表自動佔滿 */}
        {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}
        </div>{/* /layout */}

        {/* Back to Home */}
        <div className={styles.viewAll}>
          <Link href="/" className={styles.viewAllBtn} id="blog-back-home">
            回到首頁
            <span className={styles.readMoreArrow}>→</span>
          </Link>
        </div>
      </div>
    </section >
  )
}
