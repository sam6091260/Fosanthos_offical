'use client'

import { useState, useRef, useCallback } from 'react'
import styles from './PostEditor.module.css'

/**
 * 通用檔案拖放上傳區塊
 * @param {string}   accept   - input[accept] 屬性，如 "image/*,video/*"
 * @param {boolean}  multiple - 是否允許多選
 * @param {boolean}  loading  - 上傳中狀態
 * @param {string}   preview  - 已上傳的預覽 URL（有值時顯示預覽）
 * @param {Function} onFile   - 單檔回呼 (file) 或多檔回呼 (null, FileList)
 * @param {Function} onClear  - 清除已上傳檔案
 * @param {string}   label    - 預設提示文字
 */
export default function DropZone({ accept, multiple, loading, preview, onFile, onClear, label }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragging(false)
      const files = e.dataTransfer.files
      if (!files.length) return
      if (multiple) {
        onFile(null, files)
      } else {
        onFile(files[0])
      }
    },
    [multiple, onFile]
  )

  function handleInputChange(e) {
    const files = e.target.files
    if (!files.length) return
    if (multiple) {
      onFile(null, files)
    } else {
      onFile(files[0])
    }
    e.target.value = ''
  }

  if (preview) {
    const isVideo = preview.endsWith('.mp4') || preview.includes('/video/')
    return (
      <div className={styles.previewBox}>
        {isVideo
          ? <video src={preview} className={styles.previewMedia} controls muted />
          : <img src={preview} className={styles.previewMedia} alt="封面" />
        }
        <button type="button" className={styles.clearBtn} onClick={onClear}>移除</button>
      </div>
    )
  }

  return (
    <div
      className={`${styles.dropZone} ${dragging ? styles.dropZoneDragging : ''} ${loading ? styles.dropZoneLoading : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
      onKeyDown={(e) => !loading && (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
      {loading ? (
        <span className={styles.dropLabel}>上傳中…</span>
      ) : (
        <span className={styles.dropLabel}>{label}</span>
      )}
    </div>
  )
}
