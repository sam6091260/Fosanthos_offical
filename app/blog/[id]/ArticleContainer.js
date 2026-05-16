'use client'
import { useState } from 'react'
import styles from './Article.module.css'
import MarkdownContent from './MarkdownContent'
import Gallery from './Gallery'
import Link from 'next/link'

export default function ArticleContainer({ post }) {
  const [fontSize, setFontSize] = useState('medium') // small, medium, large
  const [isExpanded, setIsExpanded] = useState(false)

  const fontSizes = {
    small: '0.95rem',
    medium: '1.15rem',
    large: '1.4rem'
  }

  const handleSizeSelect = (size) => {
    setFontSize(size)
    setIsExpanded(false) // 選擇後自動縮回
  }

  return (
    <div
      className={styles.articleWrapper}
      style={{ '--content-font-size': fontSizes[fontSize] }}
    >
      {/* Font Size Controller (Fab Style) */}
      <div className={styles.fontSizeControl}>
        {/* 主按鈕 */}
        <button
          className={styles.mainFab}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="調整文字大小"
          title="調整文字大小"
        >
          {fontSize === 'small' ? 'A-' : fontSize === 'large' ? 'A+' : 'A'}
        </button>

        {/* 展開後的選單 */}
        <div className={`${styles.optionsMenu} ${isExpanded ? styles.optionsVisible : ''}`}>
          <button
            onClick={() => handleSizeSelect('large')}
            className={`${styles.sizeBtn} ${fontSize === 'large' ? styles.sizeBtnActive : ''}`}
            title="較大文字"
          >
            A+
          </button>
          <button
            onClick={() => handleSizeSelect('medium')}
            className={`${styles.sizeBtn} ${fontSize === 'medium' ? styles.sizeBtnActive : ''}`}
            title="預設文字"
          >
            A
          </button>
          <button
            onClick={() => handleSizeSelect('small')}
            className={`${styles.sizeBtn} ${fontSize === 'small' ? styles.sizeBtnActive : ''}`}
            title="較小文字"
          >
            A-
          </button>
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

        <div className={styles.ctaContainer}>
          <Link href="/#contact" className={styles.ctaButton}>
            了解更多課程資訊 <span className={styles.ctaIcon}>→</span>
          </Link>
        </div>

        <Link href="/#blog" className={styles.backBtn}>
          <span className={styles.arrow}>←</span> 回到文章列表
        </Link>
      </div>
    </div>
  )
}
