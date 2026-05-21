'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { adminFetch } from './_lib/api'
import { ADMIN_CATEGORIES, CATEGORY_LABELS } from '../components/Blog/blogData'
import styles from './admin.module.css'

const CATEGORIES = ADMIN_CATEGORIES


export default function AdminDashboard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  // 預先筛選後的文章
  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === activeCategory)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/posts')
      if (!res.ok) throw new Error('無法取得文章')
      const data = await res.json()
      setPosts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  async function handleDelete(post) {
    if (!confirm(`確定要刪除「${post.title}」？此操作無法復原。`)) return
    setDeleting(post.id)
    try {
      const res = await adminFetch(`/api/posts/${encodeURIComponent(post.id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('刪除失敗')
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>文章管理</h1>
          <p className={styles.pageSubtitle}>
            {activeCategory === 'all' ? `共 ${posts.length} 篇文章` : `${CATEGORY_LABELS[activeCategory]} · ${filteredPosts.length} 篇`}
          </p>
        </div>
        <Link href="/admin/posts/new" className={styles.newBtn}>
          ✏️ 新增文章
        </Link>
      </div>

      {/* 分類筛選 Tab */}
      <div className={styles.filterBar}>
        {CATEGORIES.map((cat) => {
          const count = cat.key === 'all'
            ? posts.length
            : posts.filter((p) => p.category === cat.key).length
          return (
            <button
              key={cat.key}
              className={`${styles.filterBtn} ${activeCategory === cat.key ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
              <span className={styles.filterCount}>{count}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className={styles.loading}>載入中…</div>
      ) : filteredPosts.length === 0 ? (
        <div className={styles.empty}>
          <p>{activeCategory === 'all' ? '尚無文章' : `尚無「${CATEGORY_LABELS[activeCategory]}」分類的文章`}</p>
          {activeCategory === 'all' && (
            <Link href="/admin/posts/new" className={styles.newBtn}>建立第一篇</Link>
          )}
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>標題</span>
            <span>分類</span>
            <span>狀態</span>
            <span>日期</span>
            <span>操作</span>
          </div>
          {filteredPosts.map((post) => (
            <div key={post._id} className={styles.tableRow}>
              <div className={styles.postTitle}>
                {post.featured && <span className={styles.featuredBadge}>✦</span>}
                <span className={styles.titleText}>{post.title}</span>
              </div>
              <span className={styles.category}>
                {CATEGORY_LABELS[post.category] || post.category}
              </span>
              <span className={`${styles.statusBadge} ${post.status === 'draft' ? styles.statusDraft : styles.statusPublished}`}>
                {post.status === 'draft' ? '草稿' : '已發布'}
              </span>
              <span className={styles.date}>{post.date || '—'}</span>
              <div className={styles.actions}>
                <Link href={`/admin/posts/${encodeURIComponent(post.id)}/edit`} className={styles.editBtn}>
                  編輯
                </Link>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(post)}
                  disabled={deleting === post.id}
                >
                  {deleting === post.id ? '…' : '刪除'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
