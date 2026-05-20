import { NextResponse } from 'next/server'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent'

const SYSTEM_PROMPT = `你是一位繁體中文文章的 Markdown 格式化助手，專門為身心靈品牌網站整理文章。

請依照以下規則處理輸入的文章：
1. **段落標題**：識別段落主題，加上 ## 或 ###（不要用 #，那是文章標題層級）
2. **重要詞彙 / 課程名稱**：用 **粗體** 標示
3. **金句、體悟、引言**：用 > 引言格式單獨呈現
4. **條列式內容**（步驟、好處、特色等）：整理成 - 清單
5. **段落之間**：若主題明顯切換，加入 --- 分隔線
6. **保留原文**：不要改寫、刪減或翻譯文字，只添加 Markdown 標記
7. **換行處理**：段落之間保留一個空白行

只回傳格式化後的 Markdown 文字，不要包含任何解釋或說明文字。`

export async function POST(request) {
  // ── 認證：只允許已登入管理員呼叫 ──────────────────────
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: '未授權：需要管理員登入' }, { status: 401 })
  }

  // 動態 import jsonwebtoken（避免 Edge runtime 相容問題）
  const jwt = (await import('jsonwebtoken')).default
  try {
    jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return NextResponse.json({ error: '未授權：Token 無效或已過期' }, { status: 401 })
  }

  try {
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '內容不能為空' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: '未設定 GEMINI_API_KEY' }, { status: 500 })
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\n---\n\n以下是需要格式化的文章內容：\n\n${content}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,       // 低溫度，穩定輸出
          maxOutputTokens: 8192,
        },
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const msg = errData?.error?.message || `Gemini API 錯誤（${response.status}）`
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    const data = await response.json()
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!result) {
      return NextResponse.json({ error: 'AI 回傳內容為空，請稍後再試' }, { status: 502 })
    }

    return NextResponse.json({ result })
  } catch (err) {
    console.error('[AI format-markdown]', err)
    return NextResponse.json({ error: err.message || '伺服器錯誤' }, { status: 500 })
  }
}
