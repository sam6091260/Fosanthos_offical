FROM node:20-alpine

WORKDIR /app

# 複製 package 檔案並安裝依賴（不含 devDependencies）
COPY package*.json ./
RUN npm ci --production

# 複製程式碼
COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
