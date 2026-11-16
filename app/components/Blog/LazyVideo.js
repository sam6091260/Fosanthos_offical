'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 捲到才載入、看得到才播放的封面影片（靜音、循環）
 *
 * 為什麼：部落格列表有多支影片封面（合計上百 MB），原本 autoPlay 會在開頁時
 * 全部開始下載。這裡改成：
 * - 進入畫面附近（rootMargin）才掛上 src 開始載入
 * - 在畫面內才播放，離開就暫停，捲回來繼續播
 * - 使用者偏好「減少動態效果」或開啟省流量模式 → 不自動播放，只顯示第一格畫面
 *
 * @param {string} src
 * @param {string} className
 * @param {string} rootMargin - 提前多少距離開始載入
 */
export default function LazyVideo({ src, className, rootMargin = '200px 0px' }) {
  const ref = useRef(null)
  const visibleRef = useRef(false)
  const allowPlayRef = useRef(true)
  const [active, setActive] = useState(false)   // 已掛上 src
  const [allowPlay, setAllowPlay] = useState(true)

  // 在畫面內且允許播放時才播；被瀏覽器擋自動播放時靜默
  const tryPlay = () => {
    const el = ref.current
    if (!el || !allowPlayRef.current || !visibleRef.current || !el.currentSrc) return
    const p = el.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = !!navigator.connection?.saveData
    allowPlayRef.current = !reduceMotion && !saveData
    setAllowPlay(allowPlayRef.current)

    const el = ref.current
    if (!el) return
    // 舊瀏覽器沒有 IntersectionObserver：直接載入
    if (!('IntersectionObserver' in window)) {
      visibleRef.current = true
      setActive(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          setActive(true)   // 第一次：掛上 src，載好後 onCanPlay 會播放
          tryPlay()         // 之後：捲回畫面時繼續播
        } else {
          el.pause()
        }
      },
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
    // tryPlay 只讀 ref，不需列為依賴
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootMargin])

  // 不能自動播放時，用 #t=0.1 讓瀏覽器顯示第一格畫面
  const videoSrc = active ? (allowPlay ? src : `${src}#t=0.1`) : undefined

  return (
    <video
      ref={ref}
      className={className}
      src={videoSrc}
      muted
      loop
      playsInline
      preload={active ? (allowPlay ? 'auto' : 'metadata') : 'none'}
      onCanPlay={tryPlay}
      aria-hidden="true"
    />
  )
}
