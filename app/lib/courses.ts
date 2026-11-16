// ─── 課程資料存取 ──────────
// 資料來源與部落格相同：Express 後端（MongoDB）→ NEXT_PUBLIC_API_URL。
// 失敗時不丟錯，回傳空陣列 / null，與 app/blog 的作法一致。

import { API_BASE_URL } from '../components/Blog/blogData'
import type { Course, IsoDate, RelatedPost, Session } from '../types/course'

// 課程與梯次每小時更新一次。
// 「是否過期」是在頁面重新產生時用當下的台北日期判斷，所以過期梯次最慢 1 小時內消失。
export const COURSE_REVALIDATE_SECONDS = 3600
const REVALIDATE_SECONDS = COURSE_REVALIDATE_SECONDS
export const COURSES_CACHE_TAG = 'courses'

async function fetchJson<T>(path: string): Promise<T | null> {
  if (!API_BASE_URL) return null
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      // tags：後台改課程時 /api/revalidate 會 revalidateTag，讓頁面立即更新
      next: { revalidate: REVALIDATE_SECONDS, tags: [COURSES_CACHE_TAG] },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch (err) {
    console.error(`無法取得 ${path}:`, err)
    return null
  }
}

// ─── 日期工具（純函式，方便測試） ──────────

const TAIPEI_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** 台北時間的「今天」，格式 YYYY-MM-DD。伺服器在哪個時區都一樣。 */
export function todayInTaipei(now: Date = new Date()): IsoDate {
  return TAIPEI_DATE_FORMAT.format(now)
}

/**
 * 只留下還沒結束的梯次（endDate >= today），依 startDate 由早到晚排序。
 * 日期都是 YYYY-MM-DD，字串比較就等於日期比較。
 */
export function filterUpcomingSessions(
  sessions: Session[],
  today: IsoDate,
  limit?: number
): Session[] {
  const upcoming = sessions
    .filter((s) => typeof s.endDate === 'string' && s.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  return typeof limit === 'number' ? upcoming.slice(0, Math.max(0, limit)) : upcoming
}

// ─── 對外 API ──────────

/** 所有課程，依 order 由小到大 */
export async function getAllCourses(): Promise<Course[]> {
  const data = await fetchJson<Course[]>('/api/courses')
  if (!Array.isArray(data)) return []
  return [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/** 單一課程；找不到回傳 null */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  if (!slug) return null
  return fetchJson<Course>(`/api/courses/${encodeURIComponent(slug)}`)
}

/** 某門課的所有梯次（含已結束），依開課日由早到晚 */
export async function getSessions(courseSlug: string): Promise<Session[]> {
  if (!courseSlug) return []
  const data = await fetchJson<Session[]>(
    `/api/courses/${encodeURIComponent(courseSlug)}/sessions`
  )
  if (!Array.isArray(data)) return []
  return [...data].sort((a, b) => a.startDate.localeCompare(b.startDate))
}

/** 某門課還沒結束的梯次（台北時間），依開課日由早到晚 */
export async function getUpcomingSessions(
  courseSlug: string,
  limit?: number
): Promise<Session[]> {
  const sessions = await getSessions(courseSlug)
  return filterUpcomingSessions(sessions, todayInTaipei(), limit)
}

/** 某門課最近的一梯（還沒結束的）；沒有就回傳 null */
export async function getNextSession(courseSlug: string): Promise<Session | null> {
  const [next] = await getUpcomingSessions(courseSlug, 1)
  return next ?? null
}

/** 已結束的梯次，最近結束的排前面 */
export function filterPastSessions(sessions: Session[], today: IsoDate): Session[] {
  return sessions
    .filter((s) => typeof s.endDate === 'string' && s.endDate < today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
}

// ─── 課程列表（含梯次） ──────────

export interface CourseWithSessions {
  course: Course
  /** 還沒結束的梯次，依開課日由早到晚 */
  upcoming: Session[]
  next: Session | null
}

/**
 * 排序：
 * 1. 有下一梯的常態課程，開課日越近越前面
 * 2. 年度方案（全年可加入，沒有「下一梯」日期可比）
 * 3. 沒有未來梯次的課程
 * 同一組內依 order。
 */
export function sortCoursesByNextSession(items: CourseWithSessions[]): CourseWithSessions[] {
  const group = (x: CourseWithSessions) => (!x.next ? 2 : x.course.type === 'annual' ? 1 : 0)
  return [...items].sort((a, b) => {
    const g = group(a) - group(b)
    if (g !== 0) return g
    if (group(a) === 0 && a.next && b.next) {
      const d = a.next.startDate.localeCompare(b.next.startDate)
      if (d !== 0) return d
    }
    return (a.course.order ?? 0) - (b.course.order ?? 0)
  })
}

/** 所有課程與各自的未來梯次，已依「最近開課」排序 */
export async function getCoursesWithSessions(): Promise<CourseWithSessions[]> {
  const courses = await getAllCourses()
  const today = todayInTaipei()
  const items = await Promise.all(
    courses.map(async (course) => {
      const upcoming = filterUpcomingSessions(await getSessions(course.slug), today)
      return { course, upcoming, next: upcoming[0] ?? null }
    })
  )
  return sortCoursesByNextSession(items)
}

// ─── 報名 ──────────

/** 開放報名的狀態 */
export function isRegistrable(session: Session | null | undefined): boolean {
  return !!session && (session.status === 'open' || session.status === 'almost_full')
}

// 所有課程報名一律導到首頁聯絡表單（不使用梯次的 registerUrl）。
// 用站內相對路徑：正式站上即 https://fosanthos.com/#contact；
// 不必整頁重新載入，本機與預覽環境也會留在同一個網域。
export const CONTACT_HREF = '/#contact'

/** 報名連結：統一導到聯絡表單 */
export function registerHref(): string {
  return CONTACT_HREF
}

// ─── 相關心得文章 ──────────

/** 部落格中標記 relatedCourse = slug 的文章（不含舊的梯次公告） */
export async function getRelatedPosts(courseSlug: string, limit = 3): Promise<RelatedPost[]> {
  if (!courseSlug) return []
  const data = await fetchJson<RelatedPost[]>(
    `/api/posts?relatedCourse=${encodeURIComponent(courseSlug)}`
  )
  if (!Array.isArray(data)) return []
  return data.slice(0, limit)
}
