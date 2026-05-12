# 新增前端元件

## 觸發條件
當使用者要求新增頁面區塊或 UI 元件時使用。

## 步驟

1. 在 `app/components/` 下建立新資料夾，結構如下：
   ```
   app/components/元件名/
   ├── 元件名.js          # 元件主檔
   ├── 元件名.module.css  # 樣式檔
   └── index.js           # export default
   ```

2. 元件規範：
   - 使用 CSS Modules（不使用 Tailwind）
   - 若需要互動性（useState、事件監聽），在檔案頂部加 `'use client'`
   - 若是靜態內容，使用 Server Component（預設，不加 `'use client'`）
   - 引用全域 CSS 變數（定義在 `globals.css`）

3. 設計風格：
   - 配色：米色 `--color-cream`、金色 `--color-gold`、鼠尾草綠 `--color-sage`
   - 字體：`--font-serif`（標題）、`--font-sans`（內文）
   - 圓角：`--radius-md`
   - 陰影：`--shadow-soft`、`--shadow-medium`
   - 動畫：`--transition-base`、`--transition-slow`

4. `index.js` 內容固定格式：
   ```js
   export { default } from './元件名'
   ```

5. 在 `app/page.js` 中 import 並加入該元件。

## 響應式設計
- 使用 `@media (max-width: 768px)` 進行手機適配
- 手機版確保文字可讀、按鈕可點擊、圖片等比縮放
