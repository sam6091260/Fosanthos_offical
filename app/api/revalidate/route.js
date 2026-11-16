import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
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
  let courseSlug = null
  try {
    const body = await request.json()
    postId = body?.postId || null
    courseSlug = body?.courseSlug || null
  } catch {
    // 沒帶 body 也可以，就只更新列表頁
  }

  const revalidated = ['/', '/blog', '/sitemap.xml', '/courses']
  if (postId) revalidated.push(`/blog/${postId}`)
  if (courseSlug) revalidated.push(`/courses/${courseSlug}`)

  for (const path of revalidated) {
    revalidatePath(path)
  }

  // 課程資料快取（lib/courses.ts 的 fetch 都帶這個 tag）：
  // 課程頁、部落格「近期開課」、文末報名卡都會一起更新。
  // 文章異動也一併清除，因為課程頁的「相關心得文章」來自文章。
  revalidateTag('courses')

  return NextResponse.json({ revalidated, tags: ['courses'] })
}
