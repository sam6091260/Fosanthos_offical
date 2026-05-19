# 程式碼審查流程

## 觸發條件
當使用者要求「檢查程式碼品質」、「code review」、「clean code」時使用。

## 審查範圍

### 前端（Next.js）
- `app/` 下所有 `.js` / `.jsx` 檔案
- `app/admin/` 後台邏輯
- `app/components/` 公開元件

### 後端（Express）
- `server/index.js` — 路由與 Middleware
- `server/models/` — Mongoose Schema

## 審查清單

### 🔴 安全性（優先修復）
- [ ] API 路由是否需要 `authMiddleware`？公開路由是否誤設為受保護？
- [ ] CORS `origin` 是否限制為已知前端網域？
- [ ] JWT_SECRET 是否在前後端一致？
- [ ] 環境變數是否洩漏？`.env*` 是否已加入 `.gitignore`？

### 🟡 功能性（Bug 層級）
- [ ] URL 參數（`params.id`、`post.id`）是否套用 `encodeURIComponent` / `decodeURIComponent`？
- [ ] 非受控 textarea 存取是否透過 `ref.current?.value`？
- [ ] API 錯誤是否正確捕獲並顯示給使用者？
- [ ] `res.json()` 是否只呼叫一次（response body 只能讀取一次）？

### 🟢 程式碼品質（Clean Code）
- [ ] `useRef` / `useState` / `useCallback` 宣告順序：hooks 在最頂層，工具函式其次，事件處理器再其次
- [ ] `Array.map()` 的 `key` 不使用 index，使用穩定唯一值（id / url）
- [ ] 重複邏輯是否抽取為工具函式？（如日期格式化、影片判斷）
- [ ] 元件是否過大？超過 300 行考慮拆分子元件
- [ ] `DropZone` 等通用元件是否獨立到自己的檔案？

### 🔵 一致性（Style Guide）
- [ ] 樣式使用 CSS Modules，不使用 inline style（除非動態值）
- [ ] CSS 變數使用 `--color-gold`、`--font-serif` 等全域變數
- [ ] 互動元件加 `'use client'`，靜態元件不加
- [ ] 非同步函式統一使用 `async/await`，不混用 `.then()`

## 修復優先順序
1. 安全性漏洞（立即修）
2. 功能性 Bug（當 sprint 修）
3. 程式碼品質（下次迭代）

## 修復後
執行 `deploy.md` 流程將修復推上線。
