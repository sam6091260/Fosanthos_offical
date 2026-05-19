import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request) {
  const { pathname } = request.nextUrl

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
  matcher: ['/admin', '/admin/:path*'],
}
