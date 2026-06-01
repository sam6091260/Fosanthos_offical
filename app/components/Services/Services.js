'use client'
import { useRef } from 'react'
import styles from './Services.module.css'
import useScrollReveal from '../../hooks/useScrollReveal'

const services = [
  {
    id: 'india-course',
    icon: '☽',
    badge: '印度課程',
    title: '連結古老智慧',
    subtitle: '從身體開始，認識自己',
    image: '/india_course.jpg',
    imageAlt: '印度療癒課程',
    desc: '我們精選來自印度的正統課程，從火供、療癒、冥想到共振，引導你用身體的語言，踏上一場向內的旅程。不需要任何基礎，只需要一份好奇心。',
    tags: ['火供', '療癒', '冥想', '共振'],
    cta: '了解課程',
    ctaHref: '/blog?category=course',
  },
  {
    id: 'university-course',
    icon: '◎',
    badge: '寶老師課程',
    title: '在生活中，覺知身心',
    subtitle: '探索身心整合的可能',
    image: '/teacher.jpg',
    imageAlt: '寶老師',
    desc: '透過寶老師的專業引導，將身心靈知識帶入生活。讓每個重視自我成長的人，在日常中認識自我調節與情緒療癒的科學與藝術。',
    tags: ['心理健康', '壓力調節', '光的呼吸'],
    cta: '查看課程',
    ctaHref: '/blog?category=teacher-course',
    featured: true,
  },
  {
    id: 'flower-essence',
    icon: '❋',
    badge: '彩光花波',
    title: '自然的語言',
    subtitle: '細膩調整內在狀態',
    image: 'https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_video/flower_essence.png',
    imageAlt: '彩光花波與野花',
    desc: '彩光花波，是大自然對情緒的溫柔回應。我們提供專業諮詢與推薦，幫助你找到最適合當下狀態的花波配方，無需消費，先理解自己。',
    tags: ['彩光花波', '情緒平衡'],
    cta: '預約諮詢',
    ctaHref: '#contact',
  },
]

export default function Services() {
  const sectionRef = useRef(null)

  useScrollReveal(sectionRef)

  return (
    <section id="services" className={`${styles.services} section`} ref={sectionRef} aria-label="服務內容">
      {/* Background decoration */}
      <div className={styles.bgDecor} aria-hidden="true" />

      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <span className="section-label" data-reveal>我們的服務</span>
          <h2 className={styles.heading} data-reveal data-reveal-delay="1">
            三個面向，陪你探索自己
          </h2>
          <p className={styles.subheading} data-reveal data-reveal-delay="2">
            無論你從哪個門走進來，我們都在這裡等你。
          </p>
        </div>

        {/* Cards */}
        <div className={styles.cards}>
          {services.map((service, index) => (
            <article
              key={service.id}
              id={`service-${service.id}`}
              className={`${styles.card} ${service.featured ? styles.featured : ''}`}
              data-reveal
              data-reveal-delay={index + 1}
              aria-label={service.badge}
            >
              {/* Card Image */}
              {service.image ? (
                <div className={styles.cardImage}>
                  <img src={service.image} alt={service.imageAlt} />
                  <div className={styles.cardImageOverlay} />
                </div>
              ) : (
                <div className={styles.cardImagePlaceholder}>
                  <div className={styles.placeholderInner}>
                    <span className={styles.placeholderIcon}>{service.icon}</span>
                    <span className={styles.placeholderText}>身心靈整合</span>
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className={styles.cardBody}>
                <div className={styles.cardBadge}>
                  <span className={styles.cardIcon}>{service.icon}</span>
                  {service.badge}
                  {service.featured && <span className={styles.featuredTag}>推薦</span>}
                </div>

                <h3 className={styles.cardTitle}>
                  {service.title}
                  <br />
                  <em>{service.subtitle}</em>
                </h3>

                <p className={styles.cardDesc}>{service.desc}</p>

                {/* Tags */}
                <div className={styles.tags}>
                  {service.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>

                {/* CTA */}
                <a
                  href={service.ctaHref}
                  className={`${styles.cardCta} ${service.featured ? styles.cardCtaFeatured : ''}`}
                  id={`service-cta-${service.id}`}
                >
                  {service.cta}
                  <span className={styles.arrow}>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
