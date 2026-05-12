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

EXPOSE 3000

CMD ["npm", "start"]
