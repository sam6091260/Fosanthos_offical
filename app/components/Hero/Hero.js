'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './Hero.module.css'
import Image from 'next/image'
import gsap from 'gsap'

const badgeTexts = [
  "身心靈整合 · 靈性陪伴",
  "印度課程代理 · 彩光花波",
  "回到初心 · 找回內在力量"
]

export default function Hero() {
  const [textIndex, setTextIndex] = useState(0)
  const contentRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % badgeTexts.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // GSAP Timeline 入場動畫
  useEffect(() => {
    if (!contentRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.2,
      })

      tl.from('[data-hero="badge"]', { y: 20, opacity: 0, duration: 0.6 })
        .from('[data-hero="brand"]', { y: 30, opacity: 0, duration: 0.8 }, '-=0.3')
        .from('[data-hero="tagline"]', { y: 20, opacity: 0, duration: 0.7 }, '-=0.4')
        .from('[data-hero="divider"]', { scaleX: 0, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('[data-hero="subtext"]', { y: 15, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('[data-hero="actions"]', { y: 20, opacity: 0, duration: 0.6 }, '-=0.2')
        .from('[data-hero="scroll"]', { y: -10, opacity: 0, duration: 0.5 }, '-=0.1')
    }, contentRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="hero" className={styles.hero} ref={contentRef} aria-label="首頁主視覺">
      {/* Background Image */}
      <div className={styles.bg} aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.bgImg}
        >
          <source src="/hero_flower.mp4" type="video/mp4" />
        </video>
        <div className={styles.overlay} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Badge */}
        <div className={styles.badge} data-hero="badge">
          <span className={styles.badgeDot} />
          <span className={styles.badgeTextWrapper}>
            <span key={textIndex} className={styles.badgeTextAnimation}>
              {badgeTexts[textIndex]}
            </span>
          </span>
        </div>

        {/* Brand Name */}
        <Image src="/logo_full.png" alt="Fosanthos" className={styles.brandName} width={150} height={150} data-hero="brand" />

        {/* Tagline */}
        <p className={styles.tagline} data-hero="tagline">
          在日常中，陪伴你走向
          <br />
          <em>更穩定與清晰的自己</em>
        </p>

        {/* Gold line */}
        <span className={styles.divider} aria-hidden="true" data-hero="divider" />

        {/* Sub text */}
        <p className={styles.subtext} data-hero="subtext">
          靈性不在遠方，它就藏在你每一次安靜呼吸之間
        </p>

        {/* CTA Buttons */}
        <div className={styles.actions} data-hero="actions">
          <Link href="#services" className={styles.btnPrimary} id="hero-explore-btn">
            探索服務
          </Link>
          <Link href="#about" className={styles.btnSecondary} id="hero-about-btn">
            了解我們
          </Link>
        </div>
      </div>
      {/* Scroll Indicator */}
      <Link href="#services" className={styles.scrollIndicator} aria-label="向下滾動" data-hero="scroll">
        <div className={styles.scrollLine} />
        <span className={styles.scrollText}>探索</span>
      </Link>
    </section>
  )
}