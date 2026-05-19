import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

// 後台專屬網域：直接跳轉到 /admin
const ADMIN_HOSTNAME = 'backend.fosanthos.com'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 若透過 backend.fosanthos.com 存取根路徑 → 導向後台
  if (hostname === ADMIN_HOSTNAME && pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // 以下只處理 /admin 路由
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // 登入頁不需要保護
  if (pathname === '/admin/login') return NextResponse.next()

  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.delete('admin_token')
    return response
  }
}

export const config = {
  // 加入根路徑，讓 backend.fosanthos.com/ 也能被攔截
  matcher: ['/', '/admin', '/admin/:path*'],
}
