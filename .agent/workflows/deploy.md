# 部署流程

## 觸發條件
當使用者要求部署、上線、更新線上版本時使用。

## 前置確認
- 確保程式碼在本地能正常運作
- 確認沒有將 `.env` 或 `.env.local` 加入 git

## 部署步驟

### 自動部署（推 GitHub 即觸發）
```bash
git add .
git commit -m "描述性的 commit message"
git push origin main
```

Zeabur 連接了 GitHub，推上去後兩個 Service 都會自動重建：
- 前端（根目錄 Dockerfile）→ `fosanthos.zeabur.app`
- 後端（`server/Dockerfile`）→ `fosanthos-api.zeabur.app`

### 手動重新部署
若自動部署有問題：
1. 登入 [Zeabur](https://zeabur.com)
2. 進入專案 → 選擇 Service
3. 點 **Redeploy**

## 部署後驗證
1. 前端：打開 `https://fosanthos.zeabur.app` 確認頁面正常
2. 後端：打開 `https://fosanthos-api.zeabur.app/api/posts` 確認回傳 JSON
3. 查看 Zeabur 日誌確認沒有錯誤

## 環境變數更新
若需新增環境變數：
1. Zeabur → Service → 環境變數
2. 新增 Key-Value
3. Service 會自動重啟套用

## 常見部署問題
- `npm update -g npm` 失敗 → 已透過自訂 Dockerfile 解決（使用 Node 20 Alpine）
- MongoDB 連線失敗 → 確認 Zeabur 環境變數 `MONGO_URI` 正確
- 環境變數讀不到 → 前端變數必須加 `NEXT_PUBLIC_` 前綴
