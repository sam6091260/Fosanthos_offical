'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { adminFetch, adminUpload } from '../../_lib/api'
import styles from './PostEditor.module.css'

const CATEGORIES = [
  { value: 'student', label: '學員奇蹟分享' },
  { value: 'course', label: '近期課程推廣' },
  { value: 'teacher', label: '寶老師短文' },
  { value: 'teacher-course', label: '寶老師課程' },
  { value: 'video', label: '影音分享' },
]

const IMAGE_MAX = 10 * 1024 * 1024   // 10 MB
const VIDEO_MAX = 500 * 1024 * 1024  // 500 MB
const GALLERY_MAX = 5

// ── Markdown 工具列按鈕定義 ────────────────────────────────
const TOOLBAR = [
  { label: 'H2', insert: (s) => `## ${s || '標題'}` },
  { label: 'H3', insert: (s) => `### ${s || '小標題'}` },
  { label: 'B', insert: (s) => `**${s || '粗體'}**` },
  { label: 'I', insert: (s) => `*${s || '斜體'}*` },
  { label: '引言', insert: (s) => s
    ? s.split('\n').map((l) => `> ${l}`).join('\n')
    : '> 引言文字'
  },
  { label: '清單', insert: (s) => s
    ? s.split('\n').filter((l) => l.trim()).map((l) => `- ${l.trim()}`).join('\n')
    : '- 項目一\n- 項目二\n- 項目三'
  },
  { label: '分隔線', insert: () => `\n---\n` },
]

// ── 工具函式 ────────────────────────────────────────────────
function isVideoUrl(url) {
  if (!url) return false
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')
}

function formatDateTW() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const d = now.getDate()
  return `${y} 年 ${m} 月 ${d} 日`
}

function generateId(title, category) {
  const prefix = category || 'post'
  // 只保留 ASCII 字母數字，避免中文字造成 URL 編碼問題
  const asciiSlug = title
    .replace(/[^\x00-\x7F]/g, '')   // 移除非 ASCII（中文等）
    .replace(/[^\w]/g, '-')            // 非字母數字轉橫線
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20)
    .toLowerCase()
  const ts = Date.now()
  return asciiSlug ? `${prefix}-${ts}-${asciiSlug}` : `${prefix}-${ts}`
}

export default function PostEditor({ initialData = {}, onSuccess }) {
  const isEdit = !!initialData.id
  const router = useRouter()

  const [form, setForm] = useState({
    id: initialData.id || '',
    title: initialData.title || '',
    excerpt: initialData.excerpt || '',
    content: initialData.content || '',
    category: initialData.category || 'course',
    categoryLabel: initialData.categoryLabel || '近期課程推廣',
    author: initialData.author || '心光卉團隊',
    date: initialData.date || '',
    image: initialData.image || '',
    gallery: initialData.gallery || [],
    featured: initialData.featured || false,
    status: initialData.status || 'draft',
  })

  const contentRef = useRef(null)  // 宣告在使用它的函式之前
  const [tab, setTab] = useState('edit')  // 'edit' | 'preview'

  // 切換到預覽時從 ref 同步內容（textarea 非受控，不套用 form.content）
  function handleTabChange(newTab) {
    if (newTab === 'preview' && contentRef.current) {
      setForm((f) => ({ ...f, content: contentRef.current.value }))
    }
    setTab(newTab)
  }

  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formCollapsed, setFormCollapsed] = useState(false)

  // ── 工具列插入 ──────────────────────────────────────────
  function insertMarkdown(insertFn) {
    const el = contentRef.current
    if (!el) return
    el.focus()
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = el.value.slice(start, end)
    const inserted = insertFn(selected)

    // execCommand 保留原生 undo 歷史（已廢棄但對 textarea 仍全面支援）
    const ok = document.execCommand('insertText', false, inserted)
    if (!ok) {
      // fallback：直接操作值（會清掉 undo，但至少功能正常）
      const newValue = el.value.slice(0, start) + inserted + el.value.slice(end)
      el.value = newValue
      const cursor = start + inserted.length
      el.setSelectionRange(cursor, cursor)
    }
  }

  // ── 表單 ────────────────────────────────────────────────
  function handleChange(field, value) {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      if (field === 'category') {
        const cat = CATEGORIES.find((c) => c.value === value)
        updated.categoryLabel = cat?.label || value
      }
      return updated
    })
  }

  // ── 封面圖上傳 ───────────────────────────────────────────
  async function handleCoverUpload(file) {
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const limit = isVideo ? VIDEO_MAX : IMAGE_MAX
    if (file.size > limit) {
      alert(`檔案超過限制（${isVideo ? '500MB' : '10MB'}）`)
      return
    }
    setUploadingCover(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const endpoint = isVideo ? '/api/upload/video' : '/api/upload/image'
      const res = await adminUpload(endpoint, fd)
      if (!res.ok) throw new Error((await res.json()).error)
      const { url } = await res.json()
      setForm((f) => ({ ...f, image: url }))
    } catch (err) {
      alert(`上傳失敗：${err.message}`)
    } finally {
      setUploadingCover(false)
    }
  }

  // ── Gallery 上傳 ─────────────────────────────────────────
  async function handleGalleryUpload(files) {
    const remaining = GALLERY_MAX - form.gallery.length
    if (remaining <= 0) {
      alert(`Gallery 最多 ${GALLERY_MAX} 個檔案`)
      return
    }
    const toUpload = Array.from(files).slice(0, remaining)
    setUploadingGallery(true)
    const urls = []
    try {
      for (const file of toUpload) {
        const isVideo = file.type.startsWith('video/')
        const limit = isVideo ? VIDEO_MAX : IMAGE_MAX
        if (file.size > limit) {
          alert(`「${file.name}」超過限制（${isVideo ? '500MB' : '10MB'}），已跳過`)
          continue
        }
        const fd = new FormData()
        fd.append('file', file)
        const endpoint = isVideo ? '/api/upload/video' : '/api/upload/image'
        const res = await adminUpload(endpoint, fd)
        if (!res.ok) throw new Error((await res.json()).error)
        const { url } = await res.json()
        urls.push(url)
      }
      setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }))
    } catch (err) {
      alert(`上傳失敗：${err.message}`)
    } finally {
      setUploadingGallery(false)
    }
  }

  function removeGallery(index) {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }))
  }

  // ── 儲存 ────────────────────────────────────────────────
  async function handleSave(status) {
    setError('')
    setSuccess('')
    // 從 ref 取內容（textarea 非受控）
    const currentContent = contentRef.current?.value ?? form.content
    if (!form.title.trim()) { setError('請填寫標題'); return }
    if (!currentContent.trim()) { setError('請填寫內容'); return }

    setSaving(true)
    try {
      const payload = {
        ...form,
        content: currentContent,
        status,
        id: isEdit ? form.id : generateId(form.title, form.category),
        publishDate: status === 'published' ? new Date().toISOString() : undefined,
        date: form.date || formatDateTW(),
      }

      const res = isEdit
        ? await adminFetch(`/api/posts/${encodeURIComponent(form.id)}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await adminFetch('/api/posts', { method: 'POST', body: JSON.stringify(payload) })

      if (!res.ok) throw new Error((await res.json()).error)
      setSuccess(status === 'published' ? '文章已發布！' : '草稿已儲存')
      if (onSuccess) onSuccess(status)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.editor}>

      {/* ── 左欄：表單 ── */}
      <div className={`${styles.formCol} ${formCollapsed ? styles.formColCollapsed : ''}`}>

        {/* 收折按鈕 bar */}
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setFormCollapsed((c) => !c)}
          title={formCollapsed ? '展開設定面板' : '收起設定面板'}
        >
          <span className={styles.collapseBtnLabel}>設定面板</span>
          <span className={`${styles.collapseBtnArrow} ${!formCollapsed ? styles.collapseBtnArrowUp : ''}`}>
            ▼
          </span>
        </button>

        {/* formBody 永遠渲染；手機收起時由 CSS 隐藏 */}
        <div className={styles.formBody}>

            {/* 基本資料 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>基本資料</h2>

              <label className={styles.label}>標題 *</label>
              <input
                className={styles.input}
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="文章標題"
              />

              <label className={styles.label}>摘要</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                rows={2}
                value={form.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="簡短描述，顯示於列表頁"
              />

              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label}>分類</label>
                  <select
                    className={styles.input}
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.col}>
                  <label className={styles.label}>作者</label>
                  <input
                    className={styles.input}
                    value={form.author}
                    onChange={(e) => handleChange('author', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label}>日期（留空自動填入）</label>
                  <input
                    className={styles.input}
                    value={form.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    placeholder="2026 年 5 月 18 日"
                  />
                </div>
                <div className={styles.col}>
                  <label className={styles.label}>設定</label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => handleChange('featured', e.target.checked)}
                    />
                    精選文章（顯示於列表頂部）
                  </label>
                </div>
              </div>
            </section>

            {/* 封面媒體 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>封面媒體</h2>
              <p className={styles.hint}>圖片限 10MB，影片限 500MB</p>
              <DropZone
                accept="image/*,video/*"
                loading={uploadingCover}
                preview={form.image}
                onFile={handleCoverUpload}
                onClear={() => setForm((f) => ({ ...f, image: '' }))}
                label="拖曳或點擊上傳封面圖片 / 影片"
              />
            </section>

            {/* Gallery */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Gallery（{form.gallery.length}/{GALLERY_MAX}）
              </h2>
              <p className={styles.hint}>每個圖片限 10MB，影片限 500MB，最多 {GALLERY_MAX} 個</p>

              {form.gallery.length < GALLERY_MAX && (
                <DropZone
                  accept="image/*,video/*"
                  multiple
                  loading={uploadingGallery}
                  onFile={(file, files) => handleGalleryUpload(files || [file])}
                  label="拖曳或點擊新增 Gallery 媒體"
                />
              )}

              {form.gallery.length > 0 && (
                <div className={styles.galleryGrid}>
                  {form.gallery.map((url) => (
                    <div key={url} className={styles.galleryItem}>
                      {isVideoUrl(url) ? (
                        <video src={url} className={styles.galleryThumb} muted />
                      ) : (
                        <img src={url} className={styles.galleryThumb} alt="" />
                      )}
                      <button
                        className={styles.galleryRemove}
                        onClick={() => removeGallery(form.gallery.indexOf(url))}
                        type="button"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </section>

        </div>

      </div>

      {/* ── 右欄：內容編輯 ── */}
      <div className={styles.contentCol}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>文章內容 *</h2>

          {/* Tab 切換 */}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'edit' ? styles.tabActive : ''}`}
              onClick={() => handleTabChange('edit')}
            >編輯</button>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'preview' ? styles.tabActive : ''}`}
              onClick={() => handleTabChange('preview')}
            >預覽</button>
          </div>

          {tab === 'edit' ? (
            <>
              {/* Markdown 工具列 */}
              <div className={styles.toolbar}>
                {TOOLBAR.map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    className={styles.toolbarBtn}
                    onClick={() => insertMarkdown(btn.insert)}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <textarea
                ref={contentRef}
                className={`${styles.input} ${styles.contentArea}`}
                defaultValue={form.content}
                placeholder="請使用 Markdown 格式撰寫文章…

# 標題
## 小標
**粗體** *斜體*
> 引言
- 列表"
              />
            </>
          ) : (
            <div className={styles.preview}>
              <ReactMarkdown>{form.content || '*（無內容）*'}</ReactMarkdown>
            </div>
          )}
        </section>

        {/* 操作區 */}
        {error && <p className={styles.errorMsg}>{error}</p>}
        {success && <p className={styles.successMsg}>{success}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.push('/admin')}
            disabled={saving}
          >
            取消
          </button>
          <div className={styles.actionsRight}>
            <button
              type="button"
              className={styles.draftBtn}
              onClick={() => handleSave('draft')}
              disabled={saving}
            >
              儲存草稿
            </button>
            <button
              type="button"
              className={styles.publishBtn}
              onClick={() => handleSave('published')}
              disabled={saving}
            >
              {saving ? '處理中…' : '發布文章'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── DropZone 元件 ─────────────────────────────────────────
function DropZone({ accept, multiple, loading, preview, onFile, onClear, label }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const files = e.dataTransfer.files
    if (!files.length) return
    if (multiple) {
      onFile(null, files)
    } else {
      onFile(files[0])
    }
  }, [multiple, onFile])

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
