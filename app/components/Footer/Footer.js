import styles from './Footer.module.css'
import Link from 'next/link'
import Image from 'next/image'

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
    <footer className={styles.footer}>
      {/* Top Section */}
      <div className={styles.top}>
        <div className="container">
          <div className={styles.topGrid}>
            {/* Brand */}
            <div className={styles.brand}>
              <div className={styles.brandLogo}>
                <Image
                  src="/logo_full.png"
                  alt="心光卉 Fosanthos"
                  width={160}
                  height={140}
                  priority
                  className={styles.logoImage}
                />
              </div>
              <p className={styles.brandTagline}>
                在日常中，陪伴你走向<br />更穩定與清晰的自己
              </p>
              <div className={styles.socialLinks}>
                {['Instagram', 'Facebook'].map((s) => (

                  s === "Instagram" ? <a
                    key={s}
                    href="https://www.instagram.com/__ssspirit/"
                    target="_blank"
                    className={styles.socialLink}
                    aria-label={s}
                    id={`footer-social-${s.toLowerCase()}`}
                  >
                    {s}
                  </a> : s === "Facebook" ? <a
                    key={s}
                    href="https://www.facebook.com/saranilu?locale=zh_TW"
                    target="_blank"
                    className={styles.socialLink}
                    aria-label={s}
                    id={`footer-social-${s.toLowerCase()}`}
                  >
                    {s}
                  </a>
                    : null
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className={styles.nav}>
              <h3 className={styles.navTitle}>網站導覽</h3>
              <ul className={styles.navList}>
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.navLink}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className={styles.nav}>
              <h3 className={styles.navTitle}>服務項目</h3>
              <ul className={styles.navList}>
                {['印度課程代理', '寶老師課程', '彩光花波諮詢'].map((s) => (
                  <li key={s}>
                    <Link href="#services" className={styles.navLink}>{s}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quote */}
            <div className={styles.quoteBlock}>
              <blockquote className={styles.quote}>
                "靈性不在遠方，<br />它就在你下一次的呼吸裡"
              </blockquote>
              <span className={styles.quoteAttr}>· 心光卉</span>
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
