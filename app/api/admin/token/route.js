import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// 讓 Client Component 透過此路由取得 JWT token（server-side 讀 httpOnly cookie）
export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) {
    return NextResponse.json({ error: '未登入' }, { status: 401 })
  }
  return NextResponse.json({ token })
}
