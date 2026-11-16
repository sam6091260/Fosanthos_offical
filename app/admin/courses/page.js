'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { adminFetch } from '../_lib/api'
import { COURSE_TYPE_LABELS, SESSION_STATUS_LABELS } from '../../types/course'
import { filterUpcomingSessions, todayInTaipei } from '../../lib/courses'
import { formatFullDate, formatSessionRange } from '../../lib/courseDates'
import adminStyles from '../admin.module.css'
import AdminLoading from '../_components/AdminLoading/AdminLoading'
import styles from '../_components/CourseEditor/CourseEditor.module.css'

function nextLabel(course, today) {
  const upcoming = filterUpcomingSessions(course.sessions || [], today)
  const next = upcoming[0]
  if (!next) return { text: '無未來梯次', muted: true }
  if (course.type === 'annual') return { text: `全年・至 ${formatFullDate(next.endDate)}` }
  return { text: `${formatSessionRange(next)}・${SESSION_STATUS_LABELS[next.status]}` }
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/courses')
      if (!res.ok) throw new Error('無法取得課程')
      setCourses(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // 刪除課程只放在編輯頁最下方（需輸入課程名稱確認），列表不提供，避免誤點
  const today = todayInTaipei()

  return (
    <div className={adminStyles.page}>
      <div className={adminStyles.header}>
        <div>
          <h1 className={adminStyles.pageTitle}>課程管理</h1>
          <p className={adminStyles.pageSubtitle}>共 {courses.length} 門課程・一門課一筆資料，每一梯在課程裡新增</p>
        </div>
        <Link href="/admin/courses/new" className={adminStyles.newBtn}>＋ 新增課程</Link>
      </div>

      {loading ? (
        <AdminLoading withHeader={false} padded={false} rows={4} />
      ) : error ? (
        <div className={adminStyles.empty} style={{ color: '#e07070' }}>{error}</div>
      ) : courses.length === 0 ? (
        <div className={adminStyles.empty}>
          <p>還沒有課程</p>
          <Link href="/admin/courses/new" className={adminStyles.newBtn}>建立第一門課</Link>
        </div>
      ) : (
        <div className={adminStyles.table}>
          <div className={styles.courseHeader}>
            <span />
            <span>課程</span>
            <span>類型</span>
            <span>下一梯</span>
            <span>梯次數</span>
            <span>操作</span>
          </div>
          {courses.map((c) => {
            const next = nextLabel(c, today)
            return (
              <div key={c.slug} className={styles.courseRow}>
                {c.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.coverImage} alt="" className={styles.thumb} />
                ) : (
                  <span className={styles.thumb} />
                )}
                <div style={{ minWidth: 0 }}>
                  <span className={styles.courseTitle}>{c.title}</span>
                  <span className={styles.courseSlug}>/courses/{c.slug}</span>
                </div>
                <span>{COURSE_TYPE_LABELS[c.type] || c.type}</span>
                <span className={next.muted ? styles.muted : undefined}>{next.text}</span>
                <span>{(c.sessions || []).length}</span>
                <div className={adminStyles.actions}>
                  <Link href={`/admin/courses/${encodeURIComponent(c.slug)}`} className={adminStyles.editBtn}>編輯</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
