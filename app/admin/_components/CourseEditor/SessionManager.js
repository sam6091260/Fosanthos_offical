'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { adminFetch } from '../../_lib/api'
import { SESSION_STATUS_LABELS } from '../../../types/course'
import { todayInTaipei } from '../../../lib/courses'
import { formatSessionRange } from '../../../lib/courseDates'
import adminStyles from '../../admin.module.css'
import styles from './CourseEditor.module.css'

const STATUS_OPTIONS = Object.entries(SESSION_STATUS_LABELS)
const EMPTY_NEW = { startDate: '', endDate: '', timeNote: '', status: 'open' }

function validate(s) {
  if (!s.startDate) return '請選開始日'
  if (!s.endDate) return '請選結束日'
  if (s.endDate < s.startDate) return '結束日不可早於開始日'
  return ''
}

function pickEditable(s) {
  return { startDate: s.startDate, endDate: s.endDate, timeNote: s.timeNote || '', status: s.status }
}

// ── 單一梯次（可直接改，改了才出現「儲存」） ─────────────
function SessionRow({ session, isPast, onSaved, onDeleted, onDirtyChange }) {
  const [draft, setDraft] = useState(() => pickEditable(session))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const original = pickEditable(session)
  const dirty = Object.keys(draft).some((k) => draft[k] !== original[k])
  useEffect(() => {
    onDirtyChange(session._id, dirty)
    return () => onDirtyChange(session._id, false)   // 列被移除（刪除／重新載入）時清掉
  }, [dirty, session._id, onDirtyChange])
  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  async function save() {
    const msg = validate(draft)
    if (msg) { setError(msg); return }
    setBusy(true)
    setError('')
    try {
      const res = await adminFetch(`/api/admin/sessions/${session._id}`, { method: 'PUT', body: JSON.stringify(draft) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '儲存失敗')
      onSaved(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm(`確定要刪除 ${formatSessionRange(session)} 這一梯？此操作無法復原。`)) return
    setBusy(true)
    try {
      const res = await adminFetch(`/api/admin/sessions/${session._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || '刪除失敗')
      onDeleted(session._id)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className={`${styles.sessionRow} ${isPast ? styles.sessionRowPast : ''} ${dirty ? styles.sessionRowDirty : ''}`}>
      <input type="date" aria-label="開始日" className={styles.sessionInput} value={draft.startDate} onChange={set('startDate')} />
      <input type="date" aria-label="結束日" className={styles.sessionInput} value={draft.endDate} onChange={set('endDate')} />
      <input aria-label="時間說明" className={styles.sessionInput} value={draft.timeNote} onChange={set('timeNote')} placeholder="每晚 19:30-21:30" />
      <select
        aria-label="狀態"
        className={`${styles.sessionInput} ${styles.statusSelect}`}
        data-status={draft.status}
        value={draft.status}
        onChange={set('status')}
      >
        {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <div className={styles.rowActions}>
        {isPast && <span className={styles.pastLabel}>已結束</span>}
        <button type="button" className={styles.smallBtn} onClick={save} disabled={!dirty || busy}>
          {busy && dirty ? '…' : '儲存'}
        </button>
        <button type="button" className={adminStyles.deleteBtn} onClick={remove} disabled={busy}>
          刪除
        </button>
      </div>
      {error && <p className={styles.rowError}>{error}</p>}
    </div>
  )
}

/**
 * 梯次管理
 * @param {string}   courseSlug
 * @param {object[]} initialSessions
 */
export default function SessionManager({ courseSlug, initialSessions = [], onDirtyChange }) {
  const [sessions, setSessions] = useState(initialSessions)
  // 後台預設顯示全部（含已結束），可收合
  const [showPast, setShowPast] = useState(true)
  const [newSession, setNewSession] = useState(EMPTY_NEW)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  // 哪些梯次列有未儲存的修改
  const [dirtyRows, setDirtyRows] = useState(() => new Set())
  const handleRowDirty = useCallback((id, isDirty) => {
    setDirtyRows((prev) => {
      if (prev.has(id) === isDirty) return prev
      const next = new Set(prev)
      isDirty ? next.add(id) : next.delete(id)
      return next
    })
  }, [])
  // 「新增梯次」那一列有填東西也算未儲存
  const newRowDirty = Object.keys(EMPTY_NEW).some((k) => newSession[k] !== EMPTY_NEW[k])
  const anyDirty = dirtyRows.size > 0 || newRowDirty
  useEffect(() => { onDirtyChange?.(anyDirty) }, [anyDirty, onDirtyChange])

  const today = todayInTaipei()
  const sorted = useMemo(
    () => [...sessions].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [sessions]
  )
  const upcoming = sorted.filter((s) => s.endDate >= today)
  // 已結束：最近結束的排最前面
  const past = sorted.filter((s) => s.endDate < today).reverse()

  const renderRow = (s) => (
    <SessionRow
      key={`${s._id}-${s.updatedAt || ''}`}
      session={s}
      isPast={s.endDate < today}
      onSaved={(saved) => setSessions((list) => list.map((x) => (x._id === saved._id ? saved : x)))}
      onDeleted={(id) => setSessions((list) => list.filter((x) => x._id !== id))}
      onDirtyChange={handleRowDirty}
    />
  )

  const setNew = (field) => (e) =>
    setNewSession((s) => {
      const next = { ...s, [field]: e.target.value }
      // 選了開始日、結束日還空著 → 先帶入同一天
      if (field === 'startDate' && !s.endDate) next.endDate = e.target.value
      return next
    })

  async function add() {
    const msg = validate(newSession)
    if (msg) { setAddError(msg); return }
    setAdding(true)
    setAddError('')
    try {
      const res = await adminFetch(`/api/admin/courses/${encodeURIComponent(courseSlug)}/sessions`, {
        method: 'POST',
        body: JSON.stringify(newSession),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '新增失敗')
      setSessions((list) => [...list, data])
      setNewSession(EMPTY_NEW)
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>梯次</h2>
      <p className={styles.panelHint}>
        改日期、時間或狀態後按該列的「儲存」。已結束的梯次會自動從網站的「開課梯次」移到「過往梯次」。
        年度方案請建一筆涵蓋整年的梯次（例：2026-06-01 ～ 2027-05-31）。
      </p>

      <h3 className={styles.groupTitle}>未來梯次（{upcoming.length}）</h3>
      <div className={styles.sessionHeader}>
        <span>開始日</span>
        <span>結束日</span>
        <span>時間說明</span>
        <span>狀態</span>
        <span />
      </div>

      {upcoming.length === 0 && (
        <p className={styles.panelHint} style={{ padding: '16px 0' }}>
          目前沒有未來梯次，網站會顯示「新梯次規劃中」。在下方新增一梯即可。
        </p>
      )}
      {upcoming.map(renderRow)}

      <div className={styles.sessionNew}>
        <input type="date" aria-label="新梯次開始日" className={styles.sessionInput} value={newSession.startDate} onChange={setNew('startDate')} />
        <input type="date" aria-label="新梯次結束日" className={styles.sessionInput} value={newSession.endDate} onChange={setNew('endDate')} />
        <input aria-label="新梯次時間說明" className={styles.sessionInput} value={newSession.timeNote} onChange={setNew('timeNote')} placeholder="時間說明（選填）" />
        <select aria-label="新梯次狀態" className={`${styles.sessionInput} ${styles.statusSelect}`} data-status={newSession.status} value={newSession.status} onChange={setNew('status')}>
          {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div className={styles.rowActions}>
          <button type="button" className={styles.smallBtn} onClick={add} disabled={adding}>
            {adding ? '新增中…' : '＋ 新增梯次'}
          </button>
        </div>
        {addError && <p className={styles.rowError}>{addError}</p>}
      </div>

      {/* ── 已結束的梯次（歷史紀錄，預設展開，可收合） ── */}
      {past.length > 0 && (
        <>
          <div className={styles.groupHeader}>
            <h3 className={styles.groupTitle}>已結束的梯次（{past.length}）</h3>
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowPast((v) => !v)}
              aria-expanded={showPast}
            >
              {showPast ? '收合 ▲' : '展開 ▼'}
            </button>
          </div>
          {showPast && past.map(renderRow)}
        </>
      )}
    </section>
  )
}
