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

export async function adminFetch(path, options = {}) {
  const token = await getToken()
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
}

export async function adminUpload(path, formData) {
  const token = await getToken()
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
}
