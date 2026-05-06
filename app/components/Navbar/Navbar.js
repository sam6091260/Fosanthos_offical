'use client'
import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'

const navLinks = [
  { label: '關於我們', href: '/#about' },
  { label: '服務內容', href: '/#services' },
  { label: '部落格', href: '/blog' },
  { label: '品牌哲學', href: '/#philosophy' },
  { label: '聯絡我們', href: '/#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLinkClick = () => setMenuOpen(false)

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} role="navigation" aria-label="主要導航">
      <div className={styles.inner}>
        {/* Logo */}
        <a href="/" className={styles.logo} aria-label="心光卉首頁">
          <span className={styles.logoZh}>心光卉</span>
          <span className={styles.logoEn}>Fosanthos</span>
        </a>

        {/* Desktop Links */}
        <ul className={styles.links} role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a href="/#contact" className={styles.cta} id="navbar-cta">
          開始探索
        </a>

        {/* Mobile Hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '關閉選單' : '開啟選單'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`} role="dialog" aria-modal="true">
        <ul role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.mobileLink} onClick={handleLinkClick}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/#contact" className={styles.mobileCta} onClick={handleLinkClick}>
              開始探索
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
