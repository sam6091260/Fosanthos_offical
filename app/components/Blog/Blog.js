'use client'
import { useState, useEffect, useCallback } from 'react'
import styles from './Blog.module.css'
import { blogPosts, categories } from './blogData'

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedPost, setSelectedPost] = useState(null)

  const filteredPosts =
    activeCategory === 'all'
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory)

  // 找出精選文章（第一篇 featured）
  const featuredPost = filteredPosts.find((p) => p.featured)
  const regularPosts = filteredPosts.filter((p) => p !== featuredPost)

  // 關閉 Dialog
  const closeDialog = useCallback(() => setSelectedPost(null), [])

  // ESC 關閉
  useEffect(() => {
    if (!selectedPost) return
    const handleKey = (e) => { if (e.key === 'Escape') closeDialog() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [selectedPost, closeDialog])

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

        {/* Featured Post */}
        {featuredPost && (
          <article className={styles.featured} id={`blog-featured-${featuredPost.id}`}>
            {featuredPost.image && (
              <div className={styles.featuredImage}>
                <img src={featuredPost.image} alt={featuredPost.title} />
                <div className={styles.featuredImageOverlay} />
              </div>
            )}
            <div className={styles.featuredBody}>
              <span className={styles.categoryBadge} data-category={featuredPost.category}>
                {featuredPost.categoryLabel}
              </span>
              <h3 className={styles.featuredTitle}>{featuredPost.title}</h3>
              <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>
              <div className={styles.postMeta}>
                <span className={styles.postAuthor}>{featuredPost.author}</span>
                <span className={styles.postDot}>·</span>
                <span className={styles.postDate}>{featuredPost.date}</span>
              </div>
              <button
                className={styles.readMore}
                onClick={() => setSelectedPost(featuredPost)}
                id={`blog-read-${featuredPost.id}`}
              >
                閱讀全文
                <span className={styles.readMoreArrow}>→</span>
              </button>
            </div>
          </article>
        )}

        {/* Regular Posts Grid */}
        <div className={styles.grid}>
          {regularPosts.map((post) => (
            <article
              key={post.id}
              className={styles.card}
              id={`blog-card-${post.id}`}
            >
              {post.image ? (
                <div className={styles.cardImage}>
                  <img src={post.image} alt={post.title} />
                  <div className={styles.cardImageOverlay} />
                </div>
              ) : (
                <div className={styles.cardImagePlaceholder} data-category={post.category}>
                  <span className={styles.placeholderIcon}>
                    {post.category === 'student' ? '✦' : post.category === 'course' ? '◎' : '✎'}
                  </span>
                </div>
              )}
              <div className={styles.cardBody}>
                <span className={styles.categoryBadge} data-category={post.category}>
                  {post.categoryLabel}
                </span>
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.cardExcerpt}>{post.excerpt}</p>
                <div className={styles.postMeta}>
                  <span className={styles.postAuthor}>{post.author}</span>
                  <span className={styles.postDot}>·</span>
                  <span className={styles.postDate}>{post.date}</span>
                </div>
                <button
                  className={styles.readMore}
                  onClick={() => setSelectedPost(post)}
                  id={`blog-read-${post.id}`}
                >
                  閱讀全文
                  <span className={styles.readMoreArrow}>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Back to Home */}
        <div className={styles.viewAll}>
          <a href="/" className={styles.viewAllBtn} id="blog-back-home">
            回到首頁
            <span className={styles.readMoreArrow}>→</span>
          </a>
        </div>
      </div>

      {/* ─── Article Dialog ─── */}
      {selectedPost && (
        <div className={styles.dialogOverlay} onClick={closeDialog} aria-modal="true" role="dialog">
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            {/* Dialog Header */}
            {selectedPost.image && (
              <div className={styles.dialogImage}>
                <img src={selectedPost.image} alt={selectedPost.title} />
                <div className={styles.dialogImageOverlay} />
              </div>
            )}

            {/* Close Button */}
            <button className={styles.dialogClose} onClick={closeDialog} aria-label="關閉">
              ✕
            </button>

            <div className={styles.dialogBody}>
              <span className={styles.categoryBadge} data-category={selectedPost.category}>
                {selectedPost.categoryLabel}
              </span>
              <h2 className={styles.dialogTitle}>{selectedPost.title}</h2>
              <div className={styles.postMeta}>
                <span className={styles.postAuthor}>{selectedPost.author}</span>
                <span className={styles.postDot}>·</span>
                <span className={styles.postDate}>{selectedPost.date}</span>
              </div>
              <div className={styles.dialogDivider} />
              <div className={styles.dialogContent}>
                {selectedPost.content.split('\n').map((line, i) => (
                  line.trim() === ''
                    ? <br key={i} />
                    : <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
