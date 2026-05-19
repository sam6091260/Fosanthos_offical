'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '登入失敗')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('網路錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>✦</div>
        <h1 className={styles.title}>心光卉後台</h1>
        <p className={styles.subtitle}>請輸入管理員密碼</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密碼"
            className={styles.input}
            autoFocus
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? '登入中…' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}
