'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * 共用滾動顯示 hook — 使用 GSAP ScrollTrigger
 * 取代手寫的 IntersectionObserver + .reveal CSS class 模式
 *
 * 用法：
 *   在元件中傳入容器 ref，並在 JSX 中使用 data-reveal 標記需要動畫的元素
 *   可選 data-reveal-delay="1|2|3" 來設定延遲（每級 0.15s）
 *
 * @param {React.RefObject} containerRef - 動畫範圍的容器 ref
 */
export default function useScrollReveal(containerRef) {
  useEffect(() => {
    if (!containerRef.current) return

    // 尊重使用者的減少動態偏好設定
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        const delay = parseFloat(el.dataset.revealDelay || '0') * 0.15

        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 0.9,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [containerRef])
}
