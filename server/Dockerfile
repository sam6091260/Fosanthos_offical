FROM node:20-alpine

WORKDIR /app

# 複製 package 檔案並安裝依賴
COPY package*.json ./
RUN npm ci --production

# 複製程式碼
COPY . .

EXPOSE 3001

CMD ["npm", "start"]
