// ─── 站台層級設定（SEO 唯一來源） ──────────
// canonical、sitemap、robots、JSON-LD 全部以此為基準，不要在各頁面硬寫網域。
// 若正式網域變更，只要改 NEXT_PUBLIC_SITE_URL 環境變數即可。

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fosanthos.com').replace(/\/$/, '')

export const SITE_NAME = '心光卉 Fosanthos'

export const SITE_DESCRIPTION =
  '心光卉 Fosanthos 致力於身心靈整合，提供印度課程代理、寶老師課程及彩光花波服務，陪伴人們在日常中找到內在的穩定與清晰。'

// 社群連結（Organization JSON-LD 的 sameAs）
export const SOCIAL_LINKS = [
  'https://www.instagram.com/__ssspirit/',
  'https://www.facebook.com/saranilu?locale=zh_TW',
]

export const CONTACT_EMAIL = 'hello@xinguanghui.com'

// 相對路徑 → 絕對網址（OG 圖片、JSON-LD 需要絕對網址）
export function absoluteUrl(path = '/') {
  if (!path) return SITE_URL
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}
