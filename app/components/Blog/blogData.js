// ─── API 設定 ──────────
// 後端 API 網址（本地開發用 localhost，生產環境用 Zeabur 網址）
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fosanthos-api.zeabur.app'

// ─── 文章分類（靜態資料） ──────────
export const categories = [
  { key: 'all', label: '全部文章' },
  { key: 'student', label: '學員奇蹟分享' },
  { key: 'course', label: '近期課程推廣' },
  { key: 'teacher-course', label: '寶老師課程' },
  { key: 'teacher', label: '寶老師短文' },
  { key: 'video', label: '影音分享' },
]
