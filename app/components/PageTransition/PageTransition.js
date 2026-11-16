'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import styles from './PageTransition.module.css'

const isAdminPath = (path) => path === '/admin' || (path || '').startsWith('/admin/')

export default function PageTransition({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  // 初始為 true：第一次進頁面時從白色淡出
  const [visible, setVisible] = useState(true)
  const navigatingRef = useRef(false)
  const timerRef = useRef(null)

  // 新頁面 pathname 確定後 → 80ms 緩衝讓畫面渲染，再淡出白色遮罩
  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      navigatingRef.current = false
    }, 80)
    return () => clearTimeout(timerRef.current)
  }, [pathname])

  // 攔截所有站內連結點擊
  useEffect(() => {
    const handleClick = (e) => {
      // 後台不套用前台的白色轉場：深色介面會閃白，且每次換頁多等 450ms
      if (isAdminPath(window.location.pathname)) return

      // 正在轉場中，忽略重複點擊
      if (navigatingRef.current) return

      const anchor = e.target.closest('a[href]')
      if (!anchor) return

      const href = anchor.getAttribute('href')

      // 過濾外部連結、email、電話
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) return

      // 解析目標路徑，若與目前路徑相同（只是錨點跳轉）則跳過
      try {
        const url = new URL(href, window.location.origin)
        if (url.pathname === window.location.pathname) return
      } catch {
        return
      }

      e.preventDefault()
      navigatingRef.current = true

      // 白色遮罩淡入
      setVisible(true)

      // 等動畫完成後再換頁
      timerRef.current = setTimeout(() => {
        router.push(href)
      }, 450)
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      clearTimeout(timerRef.current)
    }
  }, [router])

  // 後台：不渲染遮罩（後台有自己的深色載入畫面 app/admin/loading.js）
  if (isAdminPath(pathname)) return <>{children}</>

  return (
    <>
      <div
        aria-hidden="true"
        className={`${styles.overlay} ${visible ? styles.overlayVisible : styles.overlayHidden}`}
      />
      {children}
    </>
  )
}
