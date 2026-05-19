import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

// ── Rate Limiting（防暴力破解）─────────────────────────────
// Map<ip, { count: number, resetAt: number }>
const loginAttempts = new Map()
const MAX_ATTEMPTS = 5       // 最多 5 次失敗
const WINDOW_MS = 15 * 60 * 1000  // 15 分鐘窗口

function getRateLimit(ip) {
  const now = Date.now()
  const entry = loginAttempts.get(ip)

  // 窗口已過 → 重置
  if (!entry || now > entry.resetAt) {
    return { count: 0, resetAt: now + WINDOW_MS }
  }
  return entry
}

export async function POST(request) {
  // 取得來源 IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  const limit = getRateLimit(ip)

  // 超過限制 → 直接拒絕
  if (limit.count >= MAX_ATTEMPTS) {
    const waitMin = Math.ceil((limit.resetAt - Date.now()) / 60000)
    return NextResponse.json(
      { error: `登入嘗試次數過多，請 ${waitMin} 分鐘後再試` },
      { status: 429 }
    )
  }

  try {
    const { password } = await request.json()

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      // 記錄失敗次數
      loginAttempts.set(ip, { count: limit.count + 1, resetAt: limit.resetAt })
      const remaining = MAX_ATTEMPTS - limit.count - 1
      return NextResponse.json(
        { error: `密碼錯誤（剩餘 ${remaining} 次機會）` },
        { status: 401 }
      )
    }

    // 登入成功 → 清除失敗記錄
    loginAttempts.delete(ip)

    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return response
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
