'use client'
import { useState, useEffect, useRef } from 'react'
import styles from './About.module.css'

const aboutCarousel = [
  {
    image: '/about_meditation.png',
    alt: '靜心冥想的女性，感受自然療癒力量',
    quote: <>「靜下來，<br />才能聽見內心真正的聲音。」</>
  },
  {
    image: '/flower_essence.png',
    alt: '花波精油，喚醒內在',
    quote: <>「自然的力量，<br />總是溫柔而堅定。」</>
  },
  {
    image: '/blog_teacher.png',
    alt: '靈性陪伴與療癒',
    quote: <>「療癒，<br />從接納不完美的自己開始。」</>
  }
]

export default function About() {
  const sectionRef = useRef(null)
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % aboutCarousel.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )
    const reveals = sectionRef.current?.querySelectorAll('.reveal')
    reveals?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className={`${styles.about} section`} ref={sectionRef} aria-label="關於心光卉">
      <div className="container">
        <div className={styles.grid}>
          {/* Text Side */}
          <div className={styles.textSide}>
            <span className={`section-label reveal`}>關於我們</span>
            <h2 className={`${styles.heading} reveal reveal-delay-1`}>
              陪伴，不是給你答案
              <br />
              <em>而是讓你聽見自己</em>
            </h2>
            <span className="gold-line" style={{ margin: '28px 0' }} aria-hidden="true" />

            <p className={`${styles.body} reveal reveal-delay-2`}>
              心光卉，取自「心中有光，卉木欣然」的意象。我們相信，療癒不是一個目的地，而是一種持續進行的日常練習。
            </p>
            <p className={`${styles.body} reveal reveal-delay-2`} style={{ marginTop: '20px' }}>
              透過身心靈整合的視角，我們連結古老的印度智慧與現代生活，引導每一位探索者在自己的節奏中，慢慢找到那份內在的穩定與清晰。
            </p>
            <p className={`${styles.body} reveal reveal-delay-2`} style={{ marginTop: '20px' }}>
              我們不說教，不給框架。只是靜靜地，在你身旁。
            </p>

            {/* Stats / Values */}
            <div className={`${styles.values} reveal reveal-delay-3`}>
              {[
                { num: '靈性', desc: '不分宗教，回歸本質' },
                { num: '自然', desc: '以萬物為師' },
                { num: '陪伴', desc: '你不是一個人' },
              ].map((v) => (
                <div key={v.num} className={styles.valueItem}>
                  <span className={styles.valueNum}>{v.num}</span>
                  <span className={styles.valueDesc}>{v.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Side */}
          <div className={`${styles.imageSide} reveal reveal-delay-1`}>
            <div className={styles.imageWrapper}>
              <img
                key={`img-${carouselIndex}`}
                src={aboutCarousel[carouselIndex].image}
                alt={aboutCarousel[carouselIndex].alt}
                className={`${styles.image} ${styles.carouselAnim}`}
              />
              {/* Decorative frame */}
              <div className={styles.imageFrame} aria-hidden="true" />
              {/* Quote card */}
              <div className={styles.quoteCard}>
                <p key={`quote-${carouselIndex}`} className={`${styles.quoteText} ${styles.carouselAnim}`}>
                  {aboutCarousel[carouselIndex].quote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
