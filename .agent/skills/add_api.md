# 新增後端 API 端點

## 觸發條件
當使用者要求新增後端功能、API 路由、或資料庫操作時使用。

## 步驟

1. 確認需求屬於哪種類型：
   - **新增 Mongoose Model** → 在 `server/models/` 下建立
   - **新增 API 路由** → 在 `server/index.js` 中加入
   - **修改現有功能** → 先閱讀 `server/index.js` 了解現有結構

2. API 路由規範：
   - RESTful 風格：`GET /api/資源`、`POST /api/資源`、`GET /api/資源/:id`
   - 統一回應格式：成功回傳 JSON，錯誤回傳 `{ error: 錯誤訊息 }`
   - 使用 try-catch 包裝所有 async 操作

3. Mongoose Model 規範：
   - 檔案放在 `server/models/` 下
   - Schema 欄位加上類型和預設值
   - 匯出時使用 `module.exports = mongoose.model('名稱', Schema)`

4. 環境變數：
   - 敏感資訊（金鑰、連線字串）放在環境變數
   - 本地開發用 `server/.env`
   - 生產環境用 Zeabur 環境變數

5. 測試流程：
   - 本地啟動：`cd server && npm run dev`（Port 3001）
   - 用 PowerShell 測試：`Invoke-RestMethod -Uri "http://localhost:3001/api/..." -Method GET`

6. 部署：
   - `git push origin main` → Zeabur 自動部署
   - 後端 Dockerfile 位於 `server/Dockerfile`，使用 Node 20 Alpine
