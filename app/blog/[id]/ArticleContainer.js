'use client'
import { useState, useEffect } from 'react'
import styles from './Article.module.css'
import MarkdownContent from './MarkdownContent'
import Gallery from './Gallery'
import Link from 'next/link'

import { CATEGORY_LABELS, API_BASE_URL } from '../../components/Blog/blogData'

// ── 相關文章卡片區塊 ─────────────────────────────────────
function RelatedPosts({ currentPost }) {
  const [related, setRelated] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts`)
        if (!res.ok) return
        const all = await res.json()

        // 同分類、排除當前文章、按最新排序、最多取 3 篇
        const filtered = all
          .filter((p) => p.category === currentPost.category && p.id !== currentPost.id)
          .sort((a, b) => new Date(b.publishDate || b.createdAt) - new Date(a.publishDate || a.createdAt))
          .slice(0, 3)

        setRelated(filtered)
      } catch {
        // 靜默失敗，不影響主文章渲染
      }
    }
    load()
  }, [currentPost.id, currentPost.category])

  // 同分類只有當前這篇（或無其他文章）→ 不顯示
  if (related.length === 0) return null

  return (
    <div className={styles.relatedSection}>
      <div className={styles.relatedHeader}>
        <span className={styles.relatedTitle}>
          探索更多 {CATEGORY_LABELS[currentPost.category]}
        </span>
        <Link
          href={`/blog?category=${currentPost.category}`}
          className={styles.relatedViewAll}
        >
          查看全部 →
        </Link>
      </div>

      <div className={styles.relatedGrid}>
        {related.map((p) => {
          const isVideo = p.image?.endsWith('.mp4')
          const thumb = isVideo ? null : p.image
          return (
            <Link key={p.id} href={`/blog/${encodeURIComponent(p.id)}`} className={styles.relatedCard}>
              {thumb ? (
                <img src={thumb} alt={p.title} className={styles.relatedThumb} />
              ) : (
                <div className={styles.relatedThumbPlaceholder}>
                  {isVideo ? '▶' : '✦'}
                </div>
              )}
              <div className={styles.relatedBody}>
                <span className={styles.relatedDate}>{p.date}</span>
                <p className={styles.relatedCardTitle}>{p.title}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ── 主元件 ──────────────────────────────────────────────
export default function ArticleContainer({ post }) {
  // Server 與 Client 初次 render 保持一致（'medium'），mount 後再從 localStorage 還原
  const [fontSize, setFontSize] = useState('medium')
  const [isExpanded, setIsExpanded] = useState(false)

  // mount 後從 localStorage 還原（避免 SSR hydration mismatch）
  useEffect(() => {
    const saved = localStorage.getItem('article_fontSize')
    if (saved) setFontSize(saved)
  }, [])

  const fontSizes = {
    small: '0.95rem',
    medium: '1.15rem',
    large: '1.4rem',
  }

  const handleSizeSelect = (size) => {
    setFontSize(size)
    setIsExpanded(false)
    localStorage.setItem('article_fontSize', size)
  }

  return (
    <div
      className={styles.articleWrapper}
      style={{ '--content-font-size': fontSizes[fontSize] }}
    >
      {/* Font Size Controller (Fab Style) */}
      <div className={styles.fontSizeControl}>
        <button
          className={styles.mainFab}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="調整文字大小"
          title="調整文字大小"
        >
          {fontSize === 'small' ? 'A-' : fontSize === 'large' ? 'A+' : 'A'}
        </button>

        <div className={`${styles.optionsMenu} ${isExpanded ? styles.optionsVisible : ''}`}>
          <button
            onClick={() => handleSizeSelect('large')}
            className={`${styles.sizeBtn} ${fontSize === 'large' ? styles.sizeBtnActive : ''}`}
            title="較大文字"
          >A+</button>
          <button
            onClick={() => handleSizeSelect('medium')}
            className={`${styles.sizeBtn} ${fontSize === 'medium' ? styles.sizeBtnActive : ''}`}
            title="預設文字"
          >A</button>
          <button
            onClick={() => handleSizeSelect('small')}
            className={`${styles.sizeBtn} ${fontSize === 'small' ? styles.sizeBtnActive : ''}`}
            title="較小文字"
          >A-</button>
        </div>
      </div>

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

        <Gallery images={post.gallery} />

        {(post.category === 'course' || post.category === 'teacher-course') && (
          <div className={styles.ctaContainer}>
            <Link href="/#contact" className={styles.ctaButton}>
              了解更多課程資訊 <span className={styles.ctaIcon}>→</span>
            </Link>
          </div>
        )}

        {/* 探索更多同分類文章（最新 3 篇，不含當前文章） */}
        <RelatedPosts currentPost={post} />

        <Link href="/blog" className={styles.backBtn}>
          <span className={styles.arrow}>←</span> 回到文章列表
        </Link>
      </div>
    </div>
  )
}
