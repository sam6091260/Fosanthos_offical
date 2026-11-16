'use client'

import { useEffect, useRef, useState } from 'react'
import adminStyles from '../../admin.module.css'
import editorStyles from '../PostEditor/PostEditor.module.css'
import styles from './CourseEditor.module.css'

/**
 * 刪除課程確認視窗：必須輸入完整課程名稱才能刪除
 * @param {boolean}  open
 * @param {object}   course          - 要刪除的課程（含 sessions）
 * @param {number|null} linkedPosts  - 連到這門課的文章數（null = 計算中／取得失敗）
 * @param {boolean}  deleting
 * @param {Function} onCancel
 * @param {Function} onConfirm
 */
export default function DeleteCourseDialog({ open, course, linkedPosts, deleting, onCancel, onConfirm }) {
  const dialogRef = useRef(null)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setTyped('')
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const sessionCount = (course?.sessions || []).length
  const matches = typed.trim() === (course?.title || '').trim()

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="delete-course-title"
      // Esc 關閉時同步狀態
      onCancel={(e) => { e.preventDefault(); if (!deleting) onCancel() }}
    >
      <form
        method="dialog"
        onSubmit={(e) => { e.preventDefault(); if (matches && !deleting) onConfirm() }}
      >
        <h2 id="delete-course-title" className={`${styles.panelTitle} ${styles.dangerTitle}`}>刪除課程</h2>

        <p className={styles.dialogText}>
          你即將永久刪除「<strong>{course?.title}</strong>」，<strong>無法復原</strong>。
        </p>
        <ul className={styles.dialogList}>
          <li>課程資料、封面與介紹會刪除（雲端圖片檔不會刪）</li>
          <li>它的 <strong>{sessionCount}</strong> 個梯次會一起刪除</li>
          <li>
            {linkedPosts === null
              ? '正在計算連到這門課的文章…'
              : linkedPosts > 0
                ? <>有 <strong>{linkedPosts}</strong> 篇文章連到這門課；文章不會刪，但文末的報名卡會消失</>
                : '沒有文章連到這門課'}
          </li>
        </ul>

        <label htmlFor="delete-course-confirm" className={editorStyles.label}>
          請輸入課程名稱「{course?.title}」確認
        </label>
        <input
          id="delete-course-confirm"
          className={editorStyles.input}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          autoFocus
        />

        <div className={styles.dialogActions}>
          <button type="button" className={editorStyles.cancelBtn} onClick={onCancel} disabled={deleting}>
            取消
          </button>
          <button type="submit" className={adminStyles.deleteBtn} disabled={!matches || deleting}>
            {deleting ? '刪除中…' : '永久刪除'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
