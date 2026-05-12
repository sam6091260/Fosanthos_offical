# 新增文章到 MongoDB

## 觸發條件
當使用者要求新增、建立、或上傳文章/內容到部落格時使用。

## 步驟

1. 確認文章資料結構，所有必填欄位：
   - `id`：唯一識別碼（英文+數字，如 `teacher-3`）
   - `category`：必須是 `student` / `course` / `teacher` / `teacher-course` / `video` 之一
   - `categoryLabel`：對應的中文名稱
   - `title`、`excerpt`、`content`、`date`、`author`

2. 如果文章有圖片，確認圖片來源：
   - 已存在 `public/` → 使用 `/檔名.jpg` 路徑
   - 新圖片 → 先上傳到 Cloudflare R2，使用完整 R2 網址

3. 使用後端 API 新增文章：
   ```bash
   POST https://fosanthos-api.zeabur.app/api/posts
   Content-Type: application/json
   
   {
     "id": "...",
     "category": "...",
     "categoryLabel": "...",
     "title": "...",
     "excerpt": "...",
     "content": "...",
     "date": "...",
     "author": "...",
     "image": "...",
     "featured": false
   }
   ```

4. 驗證文章已建立：
   ```bash
   GET https://fosanthos-api.zeabur.app/api/posts/{id}
   ```

## 注意事項
- `id` 必須唯一，不可與現有文章重複
- `category` 和 `categoryLabel` 必須成對使用
- 前端會自動從 API 取得新文章，不需要重新部署
- 不要使用 `seed.js`，它會清空所有資料
