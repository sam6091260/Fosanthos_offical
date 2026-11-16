// ─── 梯次日期顯示 ──────────
// 輸入都是 'YYYY-MM-DD'（台北日曆日）。只做字串與 UTC 運算，
// 不受伺服器或瀏覽器時區影響。

import type { IsoDate, Session } from '../types/course'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function parts(date: IsoDate) {
  const [y, m, d] = date.split('-').map(Number)
  return { y, m, d }
}

/** '2026-10-28' → '三' */
export function weekdayOf(date: IsoDate): string {
  const { y, m, d } = parts(date)
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
}

/** '2026-10-28' → '10/28（三）'；withYear → '2026/10/28（三）' */
export function formatDayWithWeekday(date: IsoDate, withYear = false): string {
  const { y, m, d } = parts(date)
  return `${withYear ? `${y}/` : ''}${m}/${d}（${weekdayOf(date)}）`
}

/** '2027-05-31' → '2027/5/31' */
export function formatFullDate(date: IsoDate): string {
  const { y, m, d } = parts(date)
  return `${y}/${m}/${d}`
}

/**
 * 完整區間：'10/28（三）– 11/1（日）'；單日：'8/11（二）'
 * currentYear 有給、且梯次不在該年時，開頭加上年份。
 */
export function formatSessionRange(
  session: Pick<Session, 'startDate' | 'endDate'>,
  currentYear?: number
): string {
  const withYear = currentYear !== undefined && parts(session.startDate).y !== currentYear
  const start = formatDayWithWeekday(session.startDate, withYear)
  if (session.endDate === session.startDate) return start
  const endWithYear = parts(session.endDate).y !== parts(session.startDate).y
  // 全形括號後直接接破折號：'10/28（三）– 11/1（日）'
  return `${start}– ${formatDayWithWeekday(session.endDate, endWithYear)}`
}

/** 精簡區間：同月 '12/9-11'、跨月 '10/28-11/1'、單日 '8/11' */
export function formatSessionShort(session: Pick<Session, 'startDate' | 'endDate'>): string {
  const s = parts(session.startDate)
  const e = parts(session.endDate)
  if (session.startDate === session.endDate) return `${s.m}/${s.d}`
  if (s.y === e.y && s.m === e.m) return `${s.m}/${s.d}-${e.d}`
  return `${s.m}/${s.d}-${e.m}/${e.d}`
}

/** 'M/D'，用在按鈕文字（例：報名 10/28 梯次） */
export function formatMonthDay(date: IsoDate): string {
  const { m, d } = parts(date)
  return `${m}/${d}`
}
