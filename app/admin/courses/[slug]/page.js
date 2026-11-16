'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminFetch } from '../../_lib/api'
import useUnsavedChangesWarning from '../../_lib/useUnsavedChangesWarning'
import CourseForm from '../../_components/CourseEditor/CourseForm'
import SessionManager from '../../_components/CourseEditor/SessionManager'
import DeleteCourseDialog from '../../_components/CourseEditor/DeleteCourseDialog'
import adminStyles from '../../admin.module.css'
import AdminLoading from '../../_components/AdminLoading/AdminLoading'
import styles from '../../_components/CourseEditor/CourseEditor.module.css'

export default function EditCoursePage({ params }) {
  const router = useRouter()
  const slug = decodeURIComponent(params.slug)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [linkedPosts, setLinkedPosts] = useState(null)
  const [formDirty, setFormDirty] = useState(false)
  const [sessionsDirty, setSessionsDirty] = useState(false)

  // 課程資料或梯次有未儲存的修改 → 離開前先詢問
  useUnsavedChangesWarning((formDirty || sessionsDirty) && !deleting)

  useEffect(() => {
    async function load() {
      try {
        const res = await adminFetch('/api/admin/courses')
        if (!res.ok) throw new Error('無法取得課程')
        const found = (await res.json()).find((c) => c.slug === slug)
        if (!found) throw new Error('課程不存在')
        setCourse(found)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  // 打開刪除視窗：重新抓最新的梯次數，並計算連到這門課的文章（含舊公告與草稿）
  async function openDeleteDialog() {
    setLinkedPosts(null)
    setDialogOpen(true)
    try {
      const [coursesRes, postsRes] = await Promise.all([
        adminFetch('/api/admin/courses'),
        adminFetch('/api/admin/posts'),
      ])
      if (coursesRes.ok) {
        const fresh = (await coursesRes.json()).find((c) => c.slug === slug)
        if (fresh) setCourse((c) => ({ ...c, sessions: fresh.sessions }))
      }
      if (postsRes.ok) {
        const posts = await postsRes.json()
        setLinkedPosts(posts.filter((p) => p.relatedCourse === slug).length)
      }
    } catch {
      // 算不出來就維持「計算中」，不影響刪除
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await adminFetch(`/api/admin/courses/${encodeURIComponent(slug)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || '刪除失敗')
      router.push('/admin/courses')
    } catch (err) {
      alert(err.message)
      setDeleting(false)
      setDialogOpen(false)
    }
  }

  return (
    <div className={adminStyles.page} style={{ maxWidth: 1000 }}>
      <div className={adminStyles.header}>
        <div>
          <h1 className={adminStyles.pageTitle}>{course ? course.title : '編輯課程'}</h1>
          <p className={adminStyles.pageSubtitle}>存檔後網站會立即更新</p>
        </div>
        <div className={styles.headerLinks}>
          <a href={`/courses/${encodeURIComponent(slug)}`} target="_blank" rel="noopener noreferrer" className={styles.ghostBtn}>
            查看前台頁面 ↗
          </a>
          <Link href="/admin/courses" className={styles.ghostBtn}>← 回課程列表</Link>
        </div>
      </div>

      {loading ? (
        <AdminLoading variant="form" withHeader={false} padded={false} />
      ) : error ? (
        <div className={adminStyles.empty} style={{ color: '#e07070' }}>{error}</div>
      ) : (
        <>
          <SessionManager
            courseSlug={course.slug}
            initialSessions={course.sessions || []}
            onDirtyChange={setSessionsDirty}
          />
          <CourseForm
            initialData={course}
            onSaved={(saved) => setCourse((c) => ({ ...c, ...saved }))}
            onDirtyChange={setFormDirty}
          />

          <section className={`${styles.panel} ${styles.danger}`}>
            <h2 className={`${styles.panelTitle} ${styles.dangerTitle}`}>刪除課程</h2>
            <p className={styles.panelHint}>
              課程與它的所有梯次都會刪除，無法復原。需要輸入課程名稱才能刪除。
            </p>
            <button type="button" className={adminStyles.deleteBtn} onClick={openDeleteDialog} disabled={deleting}>
              刪除這門課程…
            </button>
          </section>

          <DeleteCourseDialog
            open={dialogOpen}
            course={course}
            linkedPosts={linkedPosts}
            deleting={deleting}
            onCancel={() => setDialogOpen(false)}
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  )
}
