import styles from './Footer.module.css'

const footerLinks = [
  { label: '關於我們', href: '/#about' },
  { label: '服務內容', href: '/#services' },
  { label: '部落格', href: '/blog' },
  { label: '品牌哲學', href: '/#philosophy' },
  { label: '聯絡我們', href: '/#contact' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer} role="contentinfo">
      {/* Top Section */}
      <div className={styles.top}>
        <div className="container">
          <div className={styles.topGrid}>
            {/* Brand */}
            <div className={styles.brand}>
              <div className={styles.brandLogo}>
                <span className={styles.logoZh}>心光卉</span>
                <span className={styles.logoEn}>Fosanthos Co., Ltd.</span>
              </div>
              <p className={styles.brandTagline}>
                在日常中，陪伴你走向<br />更穩定與清晰的自己。
              </p>
              <div className={styles.socialLinks}>
                {['Instagram', 'Facebook', 'LINE'].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className={styles.socialLink}
                    aria-label={s}
                    id={`footer-social-${s.toLowerCase()}`}
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className={styles.nav}>
              <h3 className={styles.navTitle}>網站導覽</h3>
              <ul className={styles.navList} role="list">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={styles.navLink}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className={styles.nav}>
              <h3 className={styles.navTitle}>服務項目</h3>
              <ul className={styles.navList} role="list">
                {['印度課程代理', '寶老師課程', '花波精油諮詢'].map((s) => (
                  <li key={s}>
                    <a href="#services" className={styles.navLink}>{s}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quote */}
            <div className={styles.quoteBlock}>
              <blockquote className={styles.quote}>
                "靈性不在遠方，<br />它就在你下一次的呼吸裡。"
              </blockquote>
              <span className={styles.quoteAttr}>— 心光卉</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gold Divider */}
      <div className={styles.goldDivider} aria-hidden="true" />

      {/* Bottom Section */}
      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              © {currentYear} 心光卉有限公司. All rights reserved.
            </p>
            <p className={styles.madeWith}>
              以愛與誠意，在台灣製作。
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
