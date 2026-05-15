'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './Gallery.module.css'

const isVideo = (url) => url && /\.(mp4|webm|mov|ogg)$/i.test(url)

export default function Gallery({ images = [], title }) {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const openLightbox = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedIndex(index)
  }

  const closeLightbox = useCallback((e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setSelectedIndex(null)
  }, [])

  const nextImage = useCallback((e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!images?.length) return
    setSelectedIndex((prev) => (prev + 1) % images.length)
  }, [images?.length])

  const prevImage = useCallback((e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!images?.length) return
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images?.length])

  // Handle body scroll locking
  useEffect(() => {
    if (selectedIndex !== null) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [selectedIndex])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, closeLightbox, nextImage, prevImage])

  if (!images || images.length === 0) return null

  const lightbox = selectedIndex !== null && mounted ? (
    <div 
      className={styles.lightboxOverlay} 
      onClick={closeLightbox}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <button 
        className={styles.closeButton} 
        onClick={closeLightbox}
        aria-label="關閉"
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button 
            className={`${styles.navButton} ${styles.prevButton}`} 
            onClick={prevImage}
            aria-label="上一張"
          >
            ←
          </button>
          <button 
            className={`${styles.navButton} ${styles.nextButton}`} 
            onClick={nextImage}
            aria-label="下一張"
          >
            →
          </button>
          <div className={styles.counter}>
            {selectedIndex + 1} / {images.length}
          </div>
        </>
      )}

      <div className={styles.lightboxContent} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        {isVideo(images[selectedIndex]) ? (
          <video
            key={images[selectedIndex]}
            src={images[selectedIndex]}
            controls
            autoPlay
            playsInline
            className={styles.lightboxVideo}
          />
        ) : (
          <img 
            src={images[selectedIndex]} 
            alt={`${title} zoomed ${selectedIndex + 1}`} 
            className={styles.lightboxImage}
            loading="eager"
          />
        )}
      </div>
    </div>
  ) : null

  return (
    <>
      <div className={styles.gallery}>
        {images.map((img, index) => (
          <div 
            key={index} 
            className={`${styles.galleryItem} ${isVideo(img) ? styles.galleryVideoItem : ''}`}
            onClick={(e) => openLightbox(e, index)}
            role="button"
            aria-label={isVideo(img) ? `播放第 ${index + 1} 個影片` : `查看第 ${index + 1} 張圖片`}
          >
            {isVideo(img) ? (
              <>
                <video
                  src={img}
                  muted playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.1 }}
                  className={styles.galleryVideoThumb}
                />
                <div className={styles.playIcon}>▶</div>
              </>
            ) : (
              <img src={img} alt={`${title} gallery ${index + 1}`} loading="lazy" />
            )}
          </div>
        ))}
      </div>

      {mounted && createPortal(lightbox, document.body)}
    </>
  )
}
