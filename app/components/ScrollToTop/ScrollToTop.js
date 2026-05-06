'use client'
import { useState, useEffect } from 'react'
import styles from './ScrollToTop.module.css'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      className={`${styles.btn} ${visible ? styles.visible : ''}`}
      onClick={handleClick}
      aria-label="回到頂部"
      id="scroll-to-top"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
