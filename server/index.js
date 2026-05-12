require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const Post = require('./models/Post');

const app = express();
app.use(cors());
app.use(express.json());

// 1. 連接 MongoDB
mongoose.connect(process.env.MONGO_URI);

// 2. 設定 Cloudflare R2 (S3 相容)
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

// 3. 設定 Multer (暫存檔案到記憶體)
const upload = multer({ storage: multer.memoryStorage() });

// --- API 路由 ---

// A. 上傳與儲存 API
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;

    // 上傳至 R2
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    // 存入資料庫
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      mediaUrl: fileUrl,
      mediaType: file.mimetype.startsWith('image') ? 'image' : 'video'
    });

    await newPost.save();
    res.status(200).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// B. 取得所有資料 API (供前端渲染)
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
