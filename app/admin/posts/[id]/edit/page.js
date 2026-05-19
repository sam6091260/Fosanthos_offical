'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostEditor from '../../../_components/PostEditor/PostEditor'
import { adminFetch } from '../../../_lib/api'
import styles from '../../new/new.module.css'

export default function EditPostPage({ params }) {
  const router = useRouter()
  const { id: rawId } = params
  const id = decodeURIComponent(rawId)  // 解碼 URL 編碼（含中文 ID）
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await adminFetch(`/api/admin/posts`)
        if (!res.ok) throw new Error('無法取得文章列表')
        const posts = await res.json()
        const found = posts.find((p) => p.id === id)
        if (!found) throw new Error('文章不存在')
        setPost(found)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function handleSuccess() {
    setTimeout(() => router.push('/admin'), 1500)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>編輯文章</h1>
      </div>
      {loading ? (
        <div style={{ padding: '60px', color: 'rgba(250,247,240,0.4)', fontFamily: 'var(--font-sans)' }}>
          載入中…
        </div>
      ) : error ? (
        <div style={{ padding: '60px', color: '#e07070', fontFamily: 'var(--font-sans)' }}>
          {error}
        </div>
      ) : (
        <PostEditor initialData={post} onSuccess={handleSuccess} />
      )}
    </div>
  )
}
