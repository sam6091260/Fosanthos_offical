# 技能：程式碼規範 & Clean Code

## 本專案的撰寫慣例

### React / Next.js

#### Hooks 宣告順序（固定）
```js
// 1. ref
const contentRef = useRef(null)

// 2. state（依邏輯群組）
const [form, setForm] = useState({})
const [tab, setTab] = useState('edit')
const [saving, setSaving] = useState(false)
const [error, setError] = useState('')

// 3. callback（useCallback 包裝）
const fetchPosts = useCallback(async () => { ... }, [])

// 4. effects
useEffect(() => { fetchPosts() }, [fetchPosts])

// 5. 工具函式（純函式，不依賴 hook）
function handleSave() { ... }
```

#### 非受控 Textarea 模式（保留 Ctrl+Z）
```js
// ✅ 使用 defaultValue + ref
<textarea ref={contentRef} defaultValue={form.content} />

// 取值時從 ref 讀取
const content = contentRef.current?.value ?? form.content

// ❌ 不使用受控模式（會清除 undo stack）
<textarea value={form.content} onChange={...} />
```

#### List key 規範
```js
// ✅ 使用穩定唯一值
posts.map((post) => <div key={post.id}>)
gallery.map((url) => <div key={url}>)

// ❌ 不使用 index
posts.map((post, i) => <div key={i}>)
```

#### URL 安全
```js
// ✅ 路由跳轉前 encode
href={`/admin/posts/${encodeURIComponent(post.id)}/edit`}

// ✅ 取得 params 後 decode
const id = decodeURIComponent(params.id)

// ✅ fetch 時 encode
adminFetch(`/api/posts/${encodeURIComponent(form.id)}`, ...)
```

### 工具函式抽取原則（SOLID / DRY）

```js
// ✅ 影片 URL 判斷 → 統一工具函式
function isVideoUrl(url) {
  if (!url) return false
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')
}

// ✅ 日期格式化 → 統一工具函式
function formatDateTW() {
  const now = new Date()
  return `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`
}

// ❌ 不內嵌複雜邏輯
date: new Date().toLocaleDateString('zh-TW', {...}).replace(...).replace(...)
```

### Express / 後端

#### 路由安全規則
```js
// 公開 API（任何人都可以讀）
app.get('/api/posts', ...)

// ✅ 管理 API 必須加 authMiddleware
app.post('/api/posts', authMiddleware, ...)
app.put('/api/posts/:id', authMiddleware, ...)
app.delete('/api/posts/:id', authMiddleware, ...)
app.post('/api/posts/batch', authMiddleware, ...)  // ← batch 也要！
```

#### CORS 限制
```js
// ✅ 限制為已知前端來源
app.use(cors({
  origin: (origin, callback) => {
    const allowed = ['https://fosanthos.com', 'https://backend.fosanthos.com', 'http://localhost:3000']
    if (!origin || allowed.includes(origin)) callback(null, true)
    else callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))

// ❌ 不允許所有來源
app.use(cors())
```

#### 錯誤處理一致性
```js
// ✅ 統一格式
try {
  const result = await SomeModel.find()
  res.json(result)
} catch (err) {
  res.status(500).json({ error: err.message })
}

// ✅ 404 先回傳再繼續
if (!post) return res.status(404).json({ error: '文章不存在' })
```

### CSS Modules 規範
```css
/* ✅ 使用全域 CSS 變數 */
color: var(--color-gold);
font-family: var(--font-serif);
transition: all var(--transition-base);

/* ✅ 響應式斷點統一 */
@media (max-width: 768px) { ... }

/* ❌ 不寫魔法數字顏色 */
color: #c9a96e;
```

## SOLID 應用指引

| 原則 | 在本專案的體現 |
|---|---|
| **S** 單一職責 | `DropZone` 只負責上傳互動，不含業務邏輯 |
| **O** 開放封閉 | `TOOLBAR` 陣列新增按鈕不需改 `insertMarkdown` |
| **L** 里氏替換 | `onFile` prop 統一簽名 `(file, files?)` |
| **I** 介面隔離 | `adminFetch` / `adminUpload` 分離，不混用 |
| **D** 依賴反轉 | API URL 由 `NEXT_PUBLIC_API_URL` env 控制，不硬編碼 |
