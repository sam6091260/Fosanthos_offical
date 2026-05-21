'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './Philosophy.module.css'

const quotes = [
  {
    text: '你不需要改變自己，\n你只需要更了解自己。',
    attr: '心光卉',
  },
  {
    text: '內在的穩定，\n不是沒有風，而是風中的樹根。',
    attr: '心光卉',
  },
]

export default function Philosophy() {
  const sectionRef = useRef(null)
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.2 }
    )
    const reveals = sectionRef.current?.querySelectorAll('.reveal')
    reveals?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // 每 4 秒自動切換語錄
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const q = quotes[quoteIndex]

  return (
    <section id="philosophy" className={`${styles.philosophy} section`} ref={sectionRef} aria-label="品牌哲學">
      <div className={styles.bgPattern} aria-hidden="true" />

      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <span className={`section-label reveal`}>品牌哲學</span>
          <h2 className={`${styles.heading} reveal reveal-delay-1`}>我們相信的事</h2>
        </div>

        {/* Main Quote */}
        <div className={`${styles.mainQuote} reveal reveal-delay-2`}>
          <span className={styles.quoteSymbol} aria-hidden="true">"</span>
          <blockquote className={styles.mainQuoteText}>
            靈性不在遠方的山頂，
            <br />
            它就藏在你每一次安靜呼吸之間，
            <br />
            <em>等待被你聽見。</em>
          </blockquote>
          <span className={`${styles.quoteSymbol} ${styles.quoteSymbolRight}`} aria-hidden="true">"</span>
        </div>

        {/* Gold Divider */}
        <span className={`gold-line reveal reveal-delay-3`} style={{ width: '100px' }} aria-hidden="true" />

        {/* Principles */}
        <div className={styles.principles}>
          {[
            {
              icon: '◌',
              title: '慢節奏',
              desc: '在快節奏的世界裡，我們選擇慢下來。因為只有在靜止中，你才能真正聽見自己想要什麼。',
            },
            {
              icon: '◈',
              title: '非宗教',
              desc: '靈性探索不屬於任何宗教框架。我們歡迎每一個人，無論你的信仰背景是什麼。',
            },
            {
              icon: '◇',
              title: '深度陪伴',
              desc: '我們不提供快速解方，而是陪你慢慢走進自己的內心，一步一步，找到屬於你的節奏。',
            },
            {
              icon: '◉',
              title: '自然為師',
              desc: '花、植物、土地，都是最古老的療癒智慧。我們學習大自然的語言，回應人的內在需求。',
            },
          ].map((p, i) => (
            <div key={p.title} className={`${styles.principle} reveal reveal-delay-${i + 1}`}>
              <span className={styles.principleIcon} aria-hidden="true">{p.icon}</span>
              <h3 className={styles.principleTitle}>{p.title}</h3>
              <p className={styles.principleDesc}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Secondary Quote — 單一輪播卡片 */}
        <div className={`${styles.secondaryQuote} reveal reveal-delay-1`}>
          <p key={quoteIndex} className={styles.secondaryQuoteText}>
            {q.text.split('\n').map((line, j) => (
              <span key={j}>{line}<br /></span>
            ))}
          </p>
          <span className={styles.secondaryQuoteAttr}>{q.attr}</span>

          {/* 圓點指示器 */}
          <div className={styles.quoteDots} role="tablist" aria-label="語錄切換">
            {quotes.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === quoteIndex}
                aria-label={`第 ${i + 1} 則語錄`}
                className={`${styles.quoteDot} ${i === quoteIndex ? styles.quoteDotActive : ''}`}
                onClick={() => setQuoteIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
