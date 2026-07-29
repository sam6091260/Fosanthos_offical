FROM node:20-alpine AS builder

WORKDIR /app

# 複製 package 檔案並安裝依賴
COPY package*.json ./
RUN npm ci

# 複製程式碼並建置
COPY . .
RUN npm run build

# 第二階段：運行
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
# next.config.mjs 在執行期仍會被讀取（images.remotePatterns 等設定），
# 沒複製過來的話線上圖片最佳化會擋掉 R2 網域
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["npm", "start"]
