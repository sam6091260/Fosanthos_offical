// 從 cookie 取 token，用於後台 API 請求
export function getAdminHeaders() {
  // 瀏覽器端無法讀取 httpOnly cookie，由 Next.js Server Action 或後台 fetch 帶 cookie header
  // 此輔助函式用於 Client Component fetch，透過 credentials: 'include' 讓 cookie 自動附上
  return {
    'Content-Type': 'application/json',
  }
}

export const API_BASE = process.env.NEXT_PUBLIC_API_URL

// 取得後台用 JWT（從 /api/admin/token 中繼取得，避免 httpOnly 限制）
let _cachedToken = null

export async function getToken() {
  if (_cachedToken) return _cachedToken
  const res = await fetch('/api/admin/token')
  if (!res.ok) return null
  const { token } = await res.json()
  _cachedToken = token
  return token
}

export function clearTokenCache() {
  _cachedToken = null
}

// 文章異動後通知前台清除 ISR 快取，讓改動立即可見
async function notifyRevalidate(path, method = 'GET') {
  if (method.toUpperCase() === 'GET') return
  if (!path.startsWith('/api/posts')) return

  const match = path.match(/^\/api\/posts\/([^/?]+)/)
  const postId = match && match[1] !== 'batch' ? decodeURIComponent(match[1]) : null

  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
  } catch {
    // 前台快取更新失敗不該影響後台操作，最慢 60 秒後仍會自動更新
  }
}

export async function adminFetch(path, options = {}) {
  const token = await getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  if (res.ok) await notifyRevalidate(path, options.method || 'GET')

  return res
}

export async function adminUpload(path, formData) {
  const token = await getToken()
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
}
