'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { adminFetch } from '../../_lib/api'
import styles from './MediaPicker.module.css'

const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'image', label: '圖片' },
  { value: 'video', label: '影片' },
]

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

/**
 * 雲端媒體庫選擇器 — 從 R2 已上傳的檔案中挑選，避免重複上傳
 * @param {boolean}  open      - 是否顯示
 * @param {string}   accept    - 'all' | 'image' | 'video'，限制可選類型
 * @param {boolean}  multiple  - 是否可複選
 * @param {number}   maxSelect - 複選上限（multiple 時生效）
 * @param {string[]} existing  - 本篇已使用的網址（顯示「已加入」且不可重複選）
 * @param {Function} onSelect  - 確認回呼，參數為選取的 url 陣列
 * @param {Function} onClose   - 關閉回呼
 */
export default function MediaPicker({
  open,
  accept = 'all',
  multiple = false,
  maxSelect = Infinity,
  existing = [],
  onSelect,
  onClose,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState(accept === 'all' ? 'all' : accept)
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState([])
  const [totalSize, setTotalSize] = useState(0)
  const [deletingKey, setDeletingKey] = useState('')

  const existingSet = useMemo(() => new Set(existing), [existing])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminFetch('/api/admin/media')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '載入失敗')
      setItems(data.items || [])
      setTotalSize(data.totalSize || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // 開啟時載入清單並重置選取狀態
  useEffect(() => {
    if (!open) return
    setSelected([])
    setKeyword('')
    setFilter(accept === 'all' ? 'all' : accept)
    load()
  }, [open, accept, load])

  // Esc 關閉
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const visible = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return items
      .filter((m) => (accept === 'all' ? true : m.type === accept))
      .filter((m) => (filter === 'all' ? true : m.type === filter))
      .filter((m) => (kw ? m.name.toLowerCase().includes(kw) : true))
  }, [items, accept, filter, keyword])

  if (!open) return null

  function toggle(media) {
    if (existingSet.has(media.url)) return
    if (!multiple) {
      onSelect([media.url])
      onClose()
      return
    }
    setSelected((prev) => {
      if (prev.includes(media.url)) return prev.filter((u) => u !== media.url)
      if (prev.length >= maxSelect) {
        alert(`最多只能再選 ${maxSelect} 個`)
        return prev
      }
      return [...prev, media.url]
    })
  }

  function confirm() {
    if (!selected.length) return
    onSelect(selected)
    onClose()
  }

  async function handleDelete(media, e) {
    e.stopPropagation()
    if (media.inUse) return
    if (!window.confirm(`確定要從雲端永久刪除「${media.name}」？此操作無法復原。`)) return
    setDeletingKey(media.key)
    try {
      const res = await adminFetch('/api/admin/media', {
        method: 'DELETE',
        body: JSON.stringify({ key: media.key }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '刪除失敗')
      setItems((prev) => prev.filter((m) => m.key !== media.key))
      setSelected((prev) => prev.filter((u) => u !== media.url))
    } catch (err) {
      alert(`刪除失敗：${err.message}`)
    } finally {
      setDeletingKey('')
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* 標題列 */}
        <div className={styles.header}>
          <h3 className={styles.title}>雲端媒體庫</h3>
          <span className={styles.meta}>
            {loading ? '載入中…' : `${visible.length} 個檔案・共 ${formatSize(totalSize)}`}
          </span>
          <button type="button" className={styles.refreshBtn} onClick={load} disabled={loading}>
            重新整理
          </button>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="關閉">✕</button>
        </div>

        {/* 篩選列 */}
        <div className={styles.toolbar}>
          {accept === 'all' && (
            <div className={styles.filters}>
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`${styles.filterBtn} ${filter === f.value ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          <input
            className={styles.search}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜尋檔名…"
          />
        </div>

        {/* 內容區 */}
        <div className={styles.body}>
          {error && <p className={styles.error}>⚠ {error}</p>}
          {!loading && !error && visible.length === 0 && (
            <p className={styles.empty}>目前沒有符合條件的雲端媒體</p>
          )}
          <div className={styles.grid}>
            {visible.map((media) => {
              const isExisting = existingSet.has(media.url)
              const isSelected = selected.includes(media.url)
              return (
                <div
                  key={media.key}
                  className={`${styles.item} ${isSelected ? styles.itemSelected : ''} ${isExisting ? styles.itemDisabled : ''}`}
                  onClick={() => toggle(media)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(media)}
                  role="button"
                  tabIndex={0}
                  title={media.name}
                >
                  {media.type === 'video' ? (
                    <video src={media.url} className={styles.thumb} muted preload="metadata" />
                  ) : (
                    <img src={media.url} className={styles.thumb} alt={media.name} loading="lazy" />
                  )}

                  {media.type === 'video' && <span className={styles.videoBadge}>影片</span>}
                  {isExisting && <span className={styles.usedBadge}>已加入</span>}
                  {!isExisting && isSelected && <span className={styles.checkBadge}>✓</span>}

                  {!media.inUse && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={(e) => handleDelete(media, e)}
                      disabled={deletingKey === media.key}
                      title="從雲端刪除（未被任何文章使用）"
                    >
                      {deletingKey === media.key ? '…' : '🗑'}
                    </button>
                  )}

                  <div className={styles.info}>
                    <span className={styles.infoName}>{media.name}</span>
                    <span className={styles.infoMeta}>
                      {formatSize(media.size)}・{formatDate(media.lastModified)}
                      {media.inUse ? '・使用中' : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 底部操作 */}
        <div className={styles.footer}>
          <span className={styles.footerHint}>
            {multiple ? `已選 ${selected.length} 個${maxSelect !== Infinity ? `（最多 ${maxSelect}）` : ''}` : '點擊圖片即可選用'}
          </span>
          <div className={styles.footerActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>取消</button>
            {multiple && (
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={confirm}
                disabled={!selected.length}
              >
                加入 {selected.length || ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
