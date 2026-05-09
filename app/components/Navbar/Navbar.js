'use client'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Navbar.module.css'

const navLinks = [
  { label: '關於我們', href: '/#about', sectionId: 'about' },
  { label: '服務內容', href: '/#services', sectionId: 'services' },
  { label: '部落格', href: '/blog', sectionId: null },
  { label: '品牌哲學', href: '/#philosophy', sectionId: 'philosophy' },
  { label: '聯絡我們', href: '/#contact', sectionId: 'contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  // 偵測滾動位置
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
      // 回到頂部時清除 active
      if (window.scrollY < 200) setActiveSection('')
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer：偵測目前可見的 section（僅首頁）
  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection('')
      return
    }

    const sectionIds = navLinks
      .filter((l) => l.sectionId)
      .map((l) => l.sectionId)

    const observer = new IntersectionObserver(
      (entries) => {
        // 找出目前最可見的 section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] }
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [pathname])

  // 鎖定頁面滾動
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleLinkClick = useCallback(() => setMenuOpen(false), [])

  // 判斷連結是否 active
  const isActive = (link) => {
    if (link.href === '/blog') return pathname === '/blog'
    if (link.sectionId && pathname === '/') {
      return activeSection === link.sectionId
    }
    return false
  }

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} role="navigation" aria-label="主要導航">
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="心光卉首頁">
          <Image
            src="/logo.png"
            alt="心光卉 Fosanthos"
            width={50}
            height={30}
            priority
            className={styles.logoImage}
          />
        </Link>

        {/* Desktop Links */}
        <ul className={styles.links} role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.link} ${isActive(link) ? styles.linkActive : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href="/#contact" className={styles.cta} id="navbar-cta">
          開始探索
        </Link>

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
              <Link
                href={link.href}
                className={`${styles.mobileLink} ${isActive(link) ? styles.mobileLinkActive : ''}`}
                onClick={handleLinkClick}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/#contact" className={styles.mobileCta} onClick={handleLinkClick}>
              開始探索
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
