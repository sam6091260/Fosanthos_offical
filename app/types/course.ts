// ─── 課程與梯次的型別（與 server/models/Course.js、CourseSession.js 對應） ──────────
//
// 「一門課 = 一筆 Course，每一梯 = Course 底下的一筆 Session」
// Session 透過 courseSlug 連到 Course.slug。

/** 日期字串，格式 YYYY-MM-DD，一律視為台北時間（Asia/Taipei）的日曆日 */
export type IsoDate = string

/** 上課形式：線上 / 實體 / 混合 */
export type CourseFormat = 'online' | 'in_person' | 'hybrid'

/** recurring = 每月常態開課；annual = 年度方案（如 81000 Deeksha Yajna） */
export type CourseType = 'recurring' | 'annual'

/** 報名狀態，由後台手動設定（預設 open） */
export type SessionStatus = 'open' | 'almost_full' | 'full' | 'closed'

export interface Course {
  slug: string
  title: string
  /** 一句話簡介 */
  subtitle?: string
  coverImage?: string
  /** 課程介紹，Markdown 字串（與文章 content 相同，用 react-markdown 顯示） */
  description?: string
  format: CourseFormat
  /** 例：「5 日」 */
  duration?: string
  teacher?: string
  /** 其他圖片／影片（舊文章的海報、介紹影片等），顯示在課程介紹下方 */
  gallery?: string[]
  type: CourseType
  /** 數字越小越前面 */
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface Session {
  _id?: string
  courseSlug: string
  startDate: IsoDate
  endDate: IsoDate
  /** 例：「每晚 19:30-21:30」 */
  timeNote?: string
  status: SessionStatus
  /** 原始報名連結（僅保留紀錄；網站報名按鈕統一導到聯絡表單，不使用此欄位） */
  registerUrl?: string
  createdAt?: string
  updatedAt?: string
}

/** 課程頁「相關心得文章」用到的文章欄位（/api/posts 回傳的子集） */
export interface RelatedPost {
  id: string
  title: string
  excerpt?: string
  image?: string
  date?: string
  category?: string
  relatedCourse?: string | null
}

// ─── 顯示用文字 ──────────
export const COURSE_FORMAT_LABELS: Record<CourseFormat, string> = {
  online: '線上',
  in_person: '實體',
  hybrid: '混合',
}

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  recurring: '每月常態',
  annual: '年度方案',
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  open: '報名中',
  almost_full: '即將額滿',
  full: '已額滿',
  closed: '已截止',
}
