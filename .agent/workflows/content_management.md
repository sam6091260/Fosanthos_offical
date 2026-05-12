# 內容管理流程

## 觸發條件
當使用者要求新增文章、上傳圖片、管理部落格內容時使用。

## 新增文章（純文字）

### 步驟
1. 確認文章的 `category` 是否在允許清單中：
   - `student` → 學員奇蹟分享
   - `course` → 近期課程推廣
   - `teacher` → 寶老師短文
   - `teacher-course` → 寶老師課程
   - `video` → 影音分享

2. 產生唯一 `id`（格式：`{category}-{數字}`，如 `teacher-3`）

3. 透過 API 新增：
   ```bash
   POST https://fosanthos-api.zeabur.app/api/posts
   Content-Type: application/json
   ```

4. 確認 API 回傳 201

5. 前端會自動顯示新文章（不需部署）

## 新增文章（含圖片/影片）

### 步驟
1. 先上傳圖片/影片到 Cloudflare R2：
   - 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - R2 → `fosanthos-offical` → Upload
   - 記下檔案公開網址：`https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/{檔名}`

2. 在新增文章時，`image` 欄位填入 R2 完整網址

3. 也可用 API 一步完成（上傳 + 建立文章）：
   ```bash
   POST https://fosanthos-api.zeabur.app/api/upload
   Content-Type: multipart/form-data
   
   file: (選擇檔案)
   title: "標題"
   content: "內容"
   ```

## 修改文章
- 登入 MongoDB Atlas → Browse Collections → `fosanthos.posts`
- 找到文章 → 點鉛筆 ✏️ 編輯 → 修改欄位 → 儲存
- 前端自動更新

## 刪除文章
- MongoDB Atlas → 找到文章 → 點垃圾桶 🗑️ 刪除
- 前端自動更新

## 批次重置資料（⚠️ 危險操作）
- 僅在需要完全重建資料時使用
- 修改 `server/seed.js` 中的資料
- 執行 `cd server && node seed.js`
- ⚠️ 這會清空所有現有文章再重新匯入
