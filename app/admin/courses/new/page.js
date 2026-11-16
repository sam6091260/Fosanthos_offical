'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CourseForm from '../../_components/CourseEditor/CourseForm'
import useUnsavedChangesWarning from '../../_lib/useUnsavedChangesWarning'
import adminStyles from '../../admin.module.css'
import styles from '../../_components/CourseEditor/CourseEditor.module.css'

export default function NewCoursePage() {
  const router = useRouter()
  const [dirty, setDirty] = useState(false)

  // 填到一半離開前先詢問
  useUnsavedChangesWarning(dirty)

  // 建好後直接進編輯頁，接著新增梯次
  function handleSaved(course) {
    router.push(`/admin/courses/${encodeURIComponent(course.slug)}`)
  }

  return (
    <div className={adminStyles.page} style={{ maxWidth: 1000 }}>
      <div className={adminStyles.header}>
        <div>
          <h1 className={adminStyles.pageTitle}>新增課程</h1>
          <p className={adminStyles.pageSubtitle}>建立後會進入編輯頁，再新增梯次</p>
        </div>
        <Link href="/admin/courses" className={styles.ghostBtn}>← 回課程列表</Link>
      </div>
      <CourseForm onSaved={handleSaved} onDirtyChange={setDirty} />
    </div>
  )
}
