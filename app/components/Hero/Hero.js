'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Hero.module.css'
import Image from 'next/image'

const badgeTexts = [
  "身心靈整合 · 靈性陪伴",
  "印度課程代理 · 原石精油",
  "回到初心 · 找回內在力量"
]

export default function Hero() {
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % badgeTexts.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="hero" className={styles.hero} aria-label="首頁主視覺">
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
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span className={styles.badgeTextWrapper}>
            <span key={textIndex} className={styles.badgeTextAnimation}>
              {badgeTexts[textIndex]}
            </span>
          </span>
        </div>

        {/* Brand Name */}
        <Image src="/logo_full.png" alt="Fosanthos" className={styles.brandName} width={150} height={150} />

        {/* Tagline */}
        <p className={styles.tagline}>
          在日常中，陪伴你走向
          <br />
          <em>更穩定與清晰的自己</em>
        </p>

        {/* Gold line */}
        <span className={styles.divider} aria-hidden="true" />

        {/* Sub text */}
        <p className={styles.subtext}>
          靈性不在遠方，它就藏在你每一次安靜呼吸之間
        </p>

        {/* CTA Buttons */}
        <div className={styles.actions}>
          <Link href="#services" className={styles.btnPrimary} id="hero-explore-btn">
            探索服務
          </Link>
          <Link href="#about" className={styles.btnSecondary} id="hero-about-btn">
            了解我們
          </Link>
        </div>
      </div>
      {/* Scroll Indicator */}
      <Link href="#services" className={styles.scrollIndicator} aria-label="向下滾動">
        <div className={styles.scrollLine} />
        <span className={styles.scrollText}>探索</span>
      </Link>
    </section>
  )
}