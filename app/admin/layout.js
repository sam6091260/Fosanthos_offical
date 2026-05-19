'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './AdminLayout.module.css'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const navItems = [
    { href: '/admin', label: '文章管理', icon: '📄' },
    { href: '/admin/posts/new', label: '新增文章', icon: '✏️' },
  ]

  // 登入頁不顯示後台 layout
  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.brandIcon}>✦</span>
          <span className={styles.brandName}>心光卉後台</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span>↩</span> 登出
        </button>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
