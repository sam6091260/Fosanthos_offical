# Fosanthos 心光卉 — 專案上下文

## 專案概述
心光卉（Fosanthos）是一個身心靈整合品牌的官方網站，提供課程推廣、文章分享、聯絡表單等功能。
採用前後端分離架構，部署於 Zeabur 雲端平台。

## 技術架構

### 前端（根目錄）
- **框架**: Next.js 13 (App Router)
- **語言**: JavaScript (JSX)
- **樣式**: CSS Modules (`.module.css`)
- **部署**: Zeabur → `fosanthos.zeabur.app`

### 後端（`/server` 目錄）
- **框架**: Express.js
- **資料庫**: MongoDB Atlas (Mongoose ODM)
- **檔案儲存**: Cloudflare R2 (S3 相容)
- **部署**: Zeabur → `fosanthos-api.zeabur.app`

## 目錄結構

```
xinguanghui/
├── app/                      # Next.js App Router
│   ├── api/contact/route.js  # 聯絡表單 API (Gmail SMTP)
│   ├── blog/[id]/page.js     # 文章詳情頁 (Server Component)
│   ├── components/           # UI 元件
│   │   ├── About/            # 關於我們
│   │   ├── Blog/             # 部落格列表 (Client Component, 從 API 取資料)
│   │   ├── Contact/          # 聯絡表單
│   │   ├── Footer/           # 頁尾
│   │   ├── Hero/             # 首頁主視覺
│   │   ├── Navbar/           # 導航列
│   │   ├── Philosophy/       # 品牌哲學
│   │   ├── ScrollToTop/      # 回到頂部按鈕
│   │   └── Services/         # 服務項目
│   ├── globals.css           # 全域樣式與 CSS 變數
│   ├── layout.js             # 根 Layout
│   └── page.js               # 首頁（組合所有區塊）
├── server/                   # Express 後端
│   ├── index.js              # API 路由與伺服器入口
│   ├── models/Post.js        # Mongoose Post Schema
│   ├── seed.js               # 資料庫初始化腳本（會清空重建）
│   └── Dockerfile            # 後端容器化
├── public/                   # 靜態資源（Logo、固定圖片）
├── Dockerfile                # 前端容器化
├── CONTENT_GUIDE.md          # 內容管理操作手冊
└── .env.local                # 前端環境變數（不進版控）
```

## 重要約定

### 樣式規範
- 所有元件使用 CSS Modules（`元件名.module.css`）
- 全域 CSS 變數定義在 `globals.css`（如 `--color-gold`, `--color-cream`, `--font-serif`）
- 設計風格：溫暖、柔和、靈性品牌調性（米色、金色、鼠尾草綠）
- 響應式斷點：`768px`（手機）

### API 配置
- API 網址統一由 `NEXT_PUBLIC_API_URL` 環境變數管理
- 集中定義於 `app/components/Blog/blogData.js` 的 `API_BASE_URL`
- 所有需要 API 的檔案都從 `blogData.js` import

### 文章資料結構
```json
{
  "id": "唯一識別碼",
  "category": "student | course | teacher | teacher-course | video",
  "categoryLabel": "學員奇蹟分享 | 近期課程推廣 | 寶老師短文 | 寶老師課程 | 影音分享",
  "title": "標題",
  "excerpt": "摘要",
  "content": "完整內容（\n 換行）",
  "date": "YYYY 年 M 月 D 日",
  "author": "作者",
  "image": "圖片路徑或 R2 完整網址",
  "gallery": ["圖片陣列"],
  "featured": true/false
}
```

### 部署流程
- `git push origin main` → Zeabur 自動部署前後端
- 前端 Root Directory：空（根目錄）
- 後端 Root Directory：`server`

## 環境變數

### 前端（`.env.local` / Zeabur）
- `NEXT_PUBLIC_API_URL` — 後端 API 網址
- `GMAIL_USER` — 聯絡表單寄件信箱
- `GMAIL_APP_PASSWORD` — Gmail 應用程式密碼

### 後端（`server/.env` / Zeabur）
- `PORT` — 伺服器 Port（Zeabur 用 8080）
- `MONGO_URI` — MongoDB Atlas 連線字串
- `R2_ENDPOINT`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` — Cloudflare R2 設定
