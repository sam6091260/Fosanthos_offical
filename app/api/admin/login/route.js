import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: '密碼錯誤' }, { status: 401 })
    }

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
