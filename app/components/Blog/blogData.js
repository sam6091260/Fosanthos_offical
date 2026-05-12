// ─── API 設定 ──────────
// 後端 API 網址由環境變數 NEXT_PUBLIC_API_URL 統一管理
// - 本地開發: 設定在 .env.local
// - 生產環境: 設定在 Zeabur 環境變數
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// ─── 文章分類（靜態資料） ──────────
export const categories = [
  { key: 'all', label: '全部文章' },
  { key: 'student', label: '學員奇蹟分享' },
  { key: 'course', label: '近期課程推廣' },
  { key: 'teacher-course', label: '寶老師課程' },
  { key: 'teacher', label: '寶老師短文' },
  { key: 'video', label: '影音分享' },
]
