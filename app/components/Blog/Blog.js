'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './Blog.module.css'
import { blogPosts, categories } from './blogData'

export default function Blog() {
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')

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
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory)

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

        {/* Featured Post */}
        {featuredPost && (
          <article className={styles.featured} id={`blog-featured-${featuredPost.id}`}>
            {featuredPost.image && (
              <div className={styles.featuredImage}>
                {featuredPost.image.endsWith('.mp4') ? (
                  <video src={featuredPost.image} autoPlay loop muted playsInline style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <img src={featuredPost.image} alt={featuredPost.title} />
                )}
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
                    <video src={post.image} autoPlay loop muted playsInline style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : (
                    <img src={post.image} alt={post.title} />
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
                <h3 className={styles.cardTitle}>{post.title}</h3>
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
