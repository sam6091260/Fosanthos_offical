'use client'

import { useState, useCallback, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { adminFetch, adminUpload } from '../../_lib/api'
import { COURSE_FORMAT_LABELS, COURSE_TYPE_LABELS } from '../../../types/course'
import DropZone from '../PostEditor/DropZone'
import MediaPicker from '../PostEditor/MediaPicker'
import editorStyles from '../PostEditor/PostEditor.module.css'
import styles from './CourseEditor.module.css'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const IMAGE_MAX = 10 * 1024 * 1024
const VIDEO_MAX = 500 * 1024 * 1024
const GALLERY_MAX = 20
const isVideoUrl = (url) => /\.(mp4|webm|mov|ogg)$/i.test(url || '')

function toForm(c = {}) {
  return {
    slug: c.slug || '',
    title: c.title || '',
    subtitle: c.subtitle || '',
    coverImage: c.coverImage || '',
    description: c.description || '',
    format: c.format || 'online',
    duration: c.duration || '',
    teacher: c.teacher || '',
    gallery: Array.isArray(c.gallery) ? c.gallery : [],
    type: c.type || 'recurring',
    order: c.order ?? 0,
  }
}

/**
 * 課程基本資料表單（新增／編輯共用）
 * @param {object}   initialData - 編輯時傳入課程；新增時省略
 * @param {Function} onSaved     - 存檔成功回呼，參數為存好的課程
 * @param {Function} onDirtyChange - 有沒有未儲存修改改變時呼叫（true / false）
 */
export default function CourseForm({ initialData, onSaved, onDirtyChange }) {
  const isEdit = !!initialData?.slug
  const [form, setForm] = useState(() => toForm(initialData))
  // 上次儲存（或載入）時的內容，用來判斷有沒有未儲存的修改
  const [baseline, setBaseline] = useState(() => JSON.stringify(toForm(initialData)))
  const dirty = JSON.stringify(form) !== baseline
  useEffect(() => { onDirtyChange?.(dirty) }, [dirty, onDirtyChange])
  const [tab, setTab] = useState('edit')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [picker, setPicker] = useState(null)   // null | 'cover' | 'gallery'
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleCoverUpload(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('封面只接受圖片'); return }
    if (file.size > IMAGE_MAX) { alert('圖片超過 10MB'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await adminUpload('/api/upload/image', fd)
      if (!res.ok) throw new Error((await res.json()).error)
      const { url } = await res.json()
      setForm((f) => ({ ...f, coverImage: url }))
    } catch (err) {
      alert(`上傳失敗：${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handlePick = useCallback((urls) => {
    if (picker === 'cover' && urls?.[0]) {
      setForm((f) => ({ ...f, coverImage: urls[0] }))
    }
    if (picker === 'gallery' && urls?.length) {
      setForm((f) => ({ ...f, gallery: [...new Set([...f.gallery, ...urls])].slice(0, GALLERY_MAX) }))
    }
    setPicker(null)
  }, [picker])
  const closePicker = useCallback(() => setPicker(null), [])

  async function handleGalleryUpload(files) {
    const remaining = GALLERY_MAX - form.gallery.length
    if (remaining <= 0) { alert(`圖片集最多 ${GALLERY_MAX} 個檔案`); return }
    const valid = Array.from(files).slice(0, remaining).filter((file) => {
      const isVid = file.type.startsWith('video/')
      if (file.size > (isVid ? VIDEO_MAX : IMAGE_MAX)) {
        alert(`「${file.name}」超過限制（${isVid ? '500MB' : '10MB'}），已跳過`)
        return false
      }
      return true
    })
    if (!valid.length) return
    setUploadingGallery(true)
    try {
      const urls = await Promise.all(valid.map(async (file) => {
        const fd = new FormData()
        fd.append('file', file)
        const res = await adminUpload(file.type.startsWith('video/') ? '/api/upload/video' : '/api/upload/image', fd)
        if (!res.ok) throw new Error((await res.json()).error)
        return (await res.json()).url
      }))
      setForm((f) => ({ ...f, gallery: [...new Set([...f.gallery, ...urls])].slice(0, GALLERY_MAX) }))
    } catch (err) {
      alert(`上傳失敗：${err.message}`)
    } finally {
      setUploadingGallery(false)
    }
  }

  const removeGalleryItem = (url) => setForm((f) => ({ ...f, gallery: f.gallery.filter((u) => u !== url) }))
  const moveGalleryItem = (index, dir) =>
    setForm((f) => {
      const list = [...f.gallery]
      const to = index + dir
      if (to < 0 || to >= list.length) return f
      ;[list[index], list[to]] = [list[to], list[index]]
      return { ...f, gallery: list }
    })

  async function handleSave() {
    setError('')
    setSuccess('')
    if (!isEdit && !SLUG_PATTERN.test(form.slug)) {
      setError('代號只能用小寫英文、數字和「-」，例如 miracle-5-day')
      return
    }
    if (!isEdit && form.slug === 'new') {
      setError('「new」是保留字，請換一個代號')
      return
    }
    if (!form.title.trim()) { setError('請填寫課程名稱'); return }

    setSaving(true)
    try {
      const { slug, ...fields } = form
      const res = isEdit
        ? await adminFetch(`/api/admin/courses/${encodeURIComponent(initialData.slug)}`, {
            method: 'PUT',
            body: JSON.stringify(fields),
          })
        : await adminFetch('/api/admin/courses', {
            method: 'POST',
            body: JSON.stringify({ slug, ...fields }),
          })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '儲存失敗')
      setBaseline(JSON.stringify(form))
      setSuccess('已儲存，網站已更新')
      if (onSaved) onSaved(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>基本資料</h2>

        <div className={styles.grid2}>
          <div>
            <label htmlFor="course-title" className={editorStyles.label}>
              課程名稱<span className={styles.required}>*</span>
            </label>
            <input id="course-title" className={editorStyles.input} value={form.title} onChange={set('title')} placeholder="奇蹟五日課" />
          </div>
          <div>
            <label htmlFor="course-slug" className={editorStyles.label}>
              網址代號{!isEdit && <span className={styles.required}>*</span>}
            </label>
            {isEdit ? (
              <p className={styles.slugFixed}>/courses/{form.slug}（建立後不可修改）</p>
            ) : (
              <input
                id="course-slug"
                className={editorStyles.input}
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
                placeholder="miracle-5-day"
              />
            )}
          </div>
        </div>

        <label htmlFor="course-subtitle" className={editorStyles.label}>一句話簡介</label>
        <input id="course-subtitle" className={editorStyles.input} value={form.subtitle} onChange={set('subtitle')} placeholder="顯示在課程卡片與分享預覽" />

        <div className={styles.grid3}>
          <div>
            <label htmlFor="course-type" className={editorStyles.label}>類型</label>
            <select id="course-type" className={editorStyles.input} value={form.type} onChange={set('type')}>
              {Object.entries(COURSE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="course-format" className={editorStyles.label}>形式</label>
            <select id="course-format" className={editorStyles.input} value={form.format} onChange={set('format')}>
              {Object.entries(COURSE_FORMAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="course-duration" className={editorStyles.label}>時長</label>
            <input id="course-duration" className={editorStyles.input} value={form.duration} onChange={set('duration')} placeholder="5 日" />
          </div>
        </div>

        <div className={styles.grid2}>
          <div>
            <label htmlFor="course-teacher" className={editorStyles.label}>授課老師</label>
            <input id="course-teacher" className={editorStyles.input} value={form.teacher} onChange={set('teacher')} />
          </div>
          <div>
            <label htmlFor="course-order" className={editorStyles.label}>排序（數字小的在前）</label>
            <input id="course-order" type="number" className={editorStyles.input} value={form.order} onChange={set('order')} />
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>封面圖片</h2>
        <p className={styles.panelHint}>限圖片、10MB 以內</p>
        <DropZone
          accept="image/*"
          loading={uploading}
          preview={form.coverImage}
          onFile={handleCoverUpload}
          onClear={() => setForm((f) => ({ ...f, coverImage: '' }))}
          label="拖曳或點擊上傳封面圖片"
        />
        <div className={styles.coverRow}>
          <button type="button" className={editorStyles.libraryBtn} onClick={() => setPicker('cover')}>
            ☁ 從雲端媒體庫選擇
          </button>
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>圖片集（{form.gallery.length}/{GALLERY_MAX}）</h2>
        <p className={styles.panelHint}>海報、活動照片、介紹影片等，顯示在課程頁「課程內容」下方。圖片限 10MB、影片限 500MB。</p>
        {form.gallery.length < GALLERY_MAX && (
          <>
            <DropZone
              accept="image/*,video/*"
              multiple
              loading={uploadingGallery}
              onFile={(file, files) => handleGalleryUpload(files || [file])}
              label="拖曳或點擊新增圖片／影片"
            />
            <div className={styles.coverRow}>
              <button type="button" className={editorStyles.libraryBtn} onClick={() => setPicker('gallery')}>
                ☁ 從雲端媒體庫選擇
              </button>
            </div>
          </>
        )}
        {form.gallery.length > 0 && (
          <div className={editorStyles.galleryGrid}>
            {form.gallery.map((url, i) => (
              <div key={url} className={editorStyles.galleryItem}>
                {isVideoUrl(url) ? (
                  <video src={url} className={editorStyles.galleryThumb} muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} className={editorStyles.galleryThumb} alt="" />
                )}
                <div className={editorStyles.galleryActions}>
                  <button type="button" className={editorStyles.galleryInsert} onClick={() => moveGalleryItem(i, -1)} disabled={i === 0} title="往前移" aria-label="往前移">←</button>
                  <button type="button" className={editorStyles.galleryInsert} onClick={() => moveGalleryItem(i, 1)} disabled={i === form.gallery.length - 1} title="往後移" aria-label="往後移">→</button>
                  {/* 放在按鈕組裡（右上角）；放在外面會被 .galleryItem 的 overflow:hidden 裁掉 */}
                  <button type="button" className={editorStyles.galleryRemove} onClick={() => removeGalleryItem(url)} title="從圖片集移除" aria-label="從圖片集移除">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>課程介紹</h2>
        <p className={styles.panelHint}>使用 Markdown，寫法與文章內文相同。梯次日期請到下方「梯次」管理，不要寫在這裡。</p>
        <div className={editorStyles.tabs}>
          <button type="button" className={`${editorStyles.tab} ${tab === 'edit' ? editorStyles.tabActive : ''}`} onClick={() => setTab('edit')}>編輯</button>
          <button type="button" className={`${editorStyles.tab} ${tab === 'preview' ? editorStyles.tabActive : ''}`} onClick={() => setTab('preview')}>預覽</button>
        </div>
        {tab === 'edit' ? (
          <textarea
            aria-label="課程介紹"
            className={`${editorStyles.input} ${editorStyles.textarea} ${styles.descArea}`}
            value={form.description}
            onChange={set('description')}
          />
        ) : (
          <div className={`${editorStyles.preview} ${styles.previewBox}`}>
            <ReactMarkdown remarkPlugins={[remarkBreaks]} rehypePlugins={[rehypeRaw]}>
              {form.description || '（尚無內容）'}
            </ReactMarkdown>
          </div>
        )}
      </section>

      {error && <p className={editorStyles.errorMsg}>{error}</p>}
      {success && <p className={editorStyles.successMsg}>{success}</p>}
      <div className={styles.formActions}>
        <button type="button" className={editorStyles.publishBtn} onClick={handleSave} disabled={saving || uploading || uploadingGallery}>
          {saving ? '儲存中…' : isEdit ? '儲存課程資料' : '建立課程'}
        </button>
      </div>

      <MediaPicker
        open={picker !== null}
        accept={picker === 'gallery' ? 'all' : 'image'}
        multiple={picker === 'gallery'}
        maxSelect={picker === 'gallery' ? GALLERY_MAX - form.gallery.length : 1}
        existing={picker === 'gallery' ? form.gallery : []}
        onSelect={handlePick}
        onClose={closePicker}
      />
    </>
  )
}
