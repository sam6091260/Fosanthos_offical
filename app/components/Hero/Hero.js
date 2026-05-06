import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-label="首頁主視覺">
      {/* Background Image */}
      <div className={styles.bg} aria-hidden="true">
        <img
          src="/hero_flower.png"
          alt="柔和花朵背景"
          className={styles.bgImg}
        />
        <div className={styles.overlay} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>身心靈整合 · 靈性陪伴</span>
        </div>

        {/* Brand Name */}
        <h1 className={styles.brandName}>
          <span className={styles.brandZh}>心光卉</span>
          <span className={styles.brandEn}>Fosanthos</span>
        </h1>

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
          <a href="#services" className={styles.btnPrimary} id="hero-explore-btn">
            探索服務
          </a>
          <a href="#about" className={styles.btnSecondary} id="hero-about-btn">
            了解我們
          </a>
        </div>
      </div>
      {/* Scroll Indicator */}
      <a href="#services" className={styles.scrollIndicator} aria-label="向下滾動">
        <div className={styles.scrollLine} />
        <span className={styles.scrollText}>探索</span>
      </a>
    </section>
  )
}