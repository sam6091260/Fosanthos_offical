require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const Post = require('./models/Post');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

// A. 新增純文字文章 API
app.post('/api/posts', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// B. 批次新增文章 API
app.post('/api/posts/batch', async (req, res) => {
  try {
    const posts = req.body;
    if (!Array.isArray(posts)) {
      return res.status(400).json({ error: '請傳入文章陣列' });
    }
    const result = await Post.insertMany(posts, { ordered: false });
    res.status(201).json({ message: `成功新增 ${result.length} 篇文章`, data: result });
  } catch (err) {
    // 忽略重複 ID 錯誤，回報成功的數量
    if (err.code === 11000) {
      res.status(200).json({ message: '部分文章已存在，已跳過重複項目' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// C. 上傳檔案 + 儲存 API
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

// D. 取得所有文章 API (供前端渲染)
app.get('/api/posts', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'all' ? { category } : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// E. 取得單篇文章 API
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) return res.status(404).json({ error: '文章不存在' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
