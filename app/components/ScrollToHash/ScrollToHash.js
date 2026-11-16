'use client'

import { useEffect } from 'react'

// 進入頁面時若網址帶 #錨點（例如 /#contact），在版面穩定後捲到該區塊。
//
// 為什麼需要：整頁載入時瀏覽器會在 HTML 解析途中就嘗試跳到錨點，
// 但首頁的影片、圖片、字型與 GSAP 入場動畫會在之後改變版面，
// 加上 html { scroll-behavior: smooth }，原生跳轉常被打斷而停在 Hero。
// 這裡在載入後補捲幾次校正；使用者自己開始捲動就停止，不和使用者搶。
export default function ScrollToHash() {
  useEffect(() => {
    const raw = window.location.hash.slice(1)
    if (!raw) return
    let id
    try {
      id = decodeURIComponent(raw)
    } catch {
      return
    }

    let stopped = false
    const scroll = () => {
      if (stopped) return
      const el = document.getElementById(id)
      // instant：避開全域 smooth scroll 被版面變動打斷
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
    const stop = () => { stopped = true }

    const timers = [setTimeout(scroll, 60), setTimeout(scroll, 500), setTimeout(scroll, 1200)]
    window.addEventListener('load', scroll, { once: true })
    // 使用者自己捲動或按鍵 → 不再校正
    window.addEventListener('wheel', stop, { passive: true, once: true })
    window.addEventListener('touchmove', stop, { passive: true, once: true })
    window.addEventListener('keydown', stop, { once: true })

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('load', scroll)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchmove', stop)
      window.removeEventListener('keydown', stop)
    }
  }, [])

  return null
}
