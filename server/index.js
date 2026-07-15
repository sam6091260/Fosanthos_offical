require('dotenv').config();
const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');

// ─── DNS fallback 修正 ─────────────────────────────────────
// 某些 Windows 多網卡環境下，Node 讀不到系統 DNS 會退回 127.0.0.1，
// 導致 mongodb+srv:// 的 SRV 查詢 ECONNREFUSED。偵測到才覆寫，
// 正式環境（Linux）不受影響。
if (dns.getServers().every((s) => s === '127.0.0.1' || s === '::1')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('⚠ 偵測到本機 DNS 異常，已改用 8.8.8.8 / 1.1.1.1');
}
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Post = require('./models/Post');

const app = express();

// ─── CORS：只允許已知前端來源 ──────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://fosanthos.zeabur.app',
  'https://fosanthos.com',
  'https://backend.fosanthos.com',
];
app.use(cors({
  origin: (origin, callback) => {
    // origin 為 undefined 時表示 Server-to-Server（允許）
    if (!origin || ALLOWED_ORIGINS.includes(origin)) callback(null, true)
    else callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── 1. MongoDB ────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI);

// ─── 2. Cloudflare R2 ──────────────────────────────────────
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

// ─── 3. Multer（分圖片 / 影片兩種限制）──────────────────────
const IMAGE_LIMIT = 10 * 1024 * 1024;   // 10 MB
const VIDEO_LIMIT = 500 * 1024 * 1024;  // 500 MB

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_LIMIT },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只接受圖片格式'));
    }
    cb(null, true);
  },
});

const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: VIDEO_LIMIT },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('只接受影片格式'));
    }
    cb(null, true);
  },
});

// ─── 4. Auth Middleware ────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授權' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token 無效或已過期' });
  }
}

// ─── 5. R2 上傳輔助函式 ────────────────────────────────────
async function uploadToR2(file, folder = '') {
  const ext = file.originalname.split('.').pop();
  const fileName = `${folder}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));
  return { url: `${process.env.R2_PUBLIC_URL}/${fileName}`, key: fileName };
}

// ═══════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════

// A. 取得所有已發布文章
app.get('/api/posts', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {
      $or: [{ status: 'published' }, { status: { $exists: false } }],
    };
    if (category && category !== 'all') filter.category = category;
    const posts = await Post.find(filter).sort({ publishDate: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// B. 取得單篇已發布文章
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findOne({
      id: req.params.id,
      $or: [{ status: 'published' }, { status: { $exists: false } }],
    });
    if (!post) return res.status(404).json({ error: '文章不存在' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  ADMIN AUTH
// ═══════════════════════════════════════════════════════════

// C. 登入（取得 JWT）
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密碼錯誤' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// ═══════════════════════════════════════════════════════════
//  ADMIN POSTS（需認證）
// ═══════════════════════════════════════════════════════════

// D. 取得所有文章（含草稿）
app.get('/api/admin/posts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// E. 新增文章
app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// F. 更新文章
app.put('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ error: '文章不存在' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// G. 刪除文章
app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ id: req.params.id });
    if (!post) return res.status(404).json({ error: '文章不存在' });
    res.json({ message: '文章已刪除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  UPLOAD（需認證）
// ═══════════════════════════════════════════════════════════

// H. 上傳圖片 → R2（限 10 MB）
app.post('/api/upload/image', authMiddleware, (req, res, next) => {
  uploadImage.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '請選擇圖片' });
    const { url } = await uploadToR2(req.file, 'fosanthos_images/');
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// I. 上傳影片 → R2（限 500 MB）
app.post('/api/upload/video', authMiddleware, (req, res, next) => {
  uploadVideo.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '請選擇影片' });
    const { url } = await uploadToR2(req.file, 'fosanthos_video/');
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Legacy batch insert（seed 使用，需認證）─────────────
app.post('/api/posts/batch', authMiddleware, async (req, res) => {
  try {
    const posts = req.body;
    if (!Array.isArray(posts)) return res.status(400).json({ error: '請傳入文章陣列' });
    const result = await Post.insertMany(posts, { ordered: false });
    res.status(201).json({ message: `成功新增 ${result.length} 篇文章`, data: result });
  } catch (err) {
    if (err.code === 11000) {
      res.status(200).json({ message: '部分文章已存在，已跳過重複項目' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
