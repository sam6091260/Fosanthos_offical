import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

// 後台新增／編輯／刪除文章後呼叫，讓前台 ISR 頁面立即更新（不必等 60 秒）。
// 需要有效的 admin_token cookie，避免被外部濫用。
export async function POST(request) {
  const token = cookies().get('admin_token')?.value
  if (!token) {
    return NextResponse.json({ error: '未登入' }, { status: 401 })
  }

  try {
    await jwtVerify(token, JWT_SECRET)
  } catch {
    return NextResponse.json({ error: 'token 無效' }, { status: 401 })
  }

  let postId = null
  try {
    const body = await request.json()
    postId = body?.postId || null
  } catch {
    // 沒帶 body 也可以，就只更新列表頁
  }

  const revalidated = ['/', '/blog', '/sitemap.xml']
  if (postId) revalidated.push(`/blog/${postId}`)

  for (const path of revalidated) {
    revalidatePath(path)
  }

  return NextResponse.json({ revalidated })
}
