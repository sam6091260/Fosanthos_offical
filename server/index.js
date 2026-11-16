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
const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const Post = require('./models/Post');
const Course = require('./models/Course');
const CourseSession = require('./models/CourseSession');
const { pickCourseInput, pickSessionInput, toHttpError, RESERVED_SLUGS } = require('./lib/courseInput');

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

// ─── 6. R2 媒體庫輔助 ──────────────────────────────────────
const MEDIA_PREFIXES = ['fosanthos_images/', 'fosanthos_video/'];
const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg']);
const VIDEO_EXT = new Set(['mp4', 'webm', 'mov', 'm4v']);
const MEDIA_MAX_PAGES = 10;   // 上限 10 × 1000 = 10000 個物件

// 列出單一 prefix 底下所有物件（自動翻頁）
async function listPrefix(prefix) {
  const objects = [];
  let token;
  for (let page = 0; page < MEDIA_MAX_PAGES; page++) {
    const result = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 1000,
      ContinuationToken: token,
    }));
    objects.push(...(result.Contents || []));
    if (!result.IsTruncated) return { objects, truncated: false };
    token = result.NextContinuationToken;
  }
  return { objects, truncated: true };
}

// 蒐集所有文章與課程實際使用到的媒體（封面 / gallery / 內文 Markdown）
// 以 R2 物件 key 而非完整網址比對，公開網域若曾變更也不會誤判為未使用
async function collectUsedKeys() {
  const [posts, courses] = await Promise.all([
    Post.find({}, 'image gallery content').lean(),
    Course.find({}, 'coverImage gallery description').lean(),
  ]);
  const used = new Set();
  const add = (url) => {
    if (!url) return;
    for (const prefix of MEDIA_PREFIXES) {
      const at = url.indexOf(prefix);
      if (at !== -1) used.add(url.slice(at));
    }
  };
  for (const post of posts) {
    add(post.image);
    for (const url of post.gallery || []) add(url);
    // 內文中的 ![size](url) 或 <img src="url">
    for (const match of (post.content || '').matchAll(/https?:\/\/[^\s)"'<>]+/g)) add(match[0]);
  }
  for (const course of courses) {
    add(course.coverImage);
    for (const url of course.gallery || []) add(url);
    for (const match of (course.description || '').matchAll(/https?:\/\/[^\s)"'<>]+/g)) add(match[0]);
  }
  return used;
}

// ═══════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════

// A. 取得所有已發布文章
app.get('/api/posts', async (req, res) => {
  try {
    const { category, relatedCourse, includeLegacy } = req.query;
    const filter = {
      $or: [{ status: 'published' }, { status: { $exists: false } }],
    };
    if (category && category !== 'all') filter.category = String(category);
    if (relatedCourse) filter.relatedCourse = String(relatedCourse);
    // 舊的每梯課程公告預設不列出（單篇 /api/posts/:id 仍可取得，舊網址不會壞）
    if (includeLegacy !== '1') filter.isLegacyCourseAnnouncement = { $ne: true };
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

// B-1. 取得所有課程（依 order 排序）
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ order: 1, createdAt: 1 }).lean();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// B-2. 取得單一課程
app.get('/api/courses/:slug', async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).lean();
    if (!course) return res.status(404).json({ error: '課程不存在' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// B-3. 取得某課程的所有梯次（依開課日排序；「是否已過期」由前端用台北時間判斷）
app.get('/api/courses/:slug/sessions', async (req, res) => {
  try {
    const sessions = await CourseSession.find({ courseSlug: req.params.slug })
      .sort({ startDate: 1 })
      .lean();
    res.json(sessions);
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
//  ADMIN COURSES（需認證）
// ═══════════════════════════════════════════════════════════

const sendError = (res, err) => {
  const { status, error } = toHttpError(err);
  res.status(status).json({ error });
};

// C-1. 取得所有課程（含各自的全部梯次）
app.get('/api/admin/courses', authMiddleware, async (req, res) => {
  try {
    const [courses, sessions] = await Promise.all([
      Course.find().sort({ order: 1, createdAt: 1 }).lean(),
      CourseSession.find().sort({ startDate: 1 }).lean(),
    ]);
    const bySlug = {};
    for (const s of sessions) (bySlug[s.courseSlug] = bySlug[s.courseSlug] || []).push(s);
    res.json(courses.map((c) => ({ ...c, sessions: bySlug[c.slug] || [] })));
  } catch (err) {
    sendError(res, err);
  }
});

// C-2. 新增課程（slug 建立後不可修改）
app.post('/api/admin/courses', authMiddleware, async (req, res) => {
  try {
    const slug = typeof req.body?.slug === 'string' ? req.body.slug.trim() : '';
    if (RESERVED_SLUGS.has(slug)) return res.status(400).json({ error: '這個代號是保留字，請換一個' });
    const course = new Course({ ...pickCourseInput(req.body), slug });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    sendError(res, err);
  }
});

// C-3. 更新課程
app.put('/api/admin/courses/:slug', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) return res.status(404).json({ error: '課程不存在' });
    course.set(pickCourseInput(req.body));
    await course.save();
    res.json(course);
  } catch (err) {
    sendError(res, err);
  }
});

// C-4. 刪除課程（連同它的梯次；文章的 relatedCourse 保留，課程不存在時前台自動不顯示報名卡）
app.delete('/api/admin/courses/:slug', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ slug: req.params.slug });
    if (!course) return res.status(404).json({ error: '課程不存在' });
    const { deletedCount } = await CourseSession.deleteMany({ courseSlug: req.params.slug });
    res.json({ message: '課程已刪除', deletedSessions: deletedCount });
  } catch (err) {
    sendError(res, err);
  }
});

// C-5. 新增梯次
app.post('/api/admin/courses/:slug/sessions', authMiddleware, async (req, res) => {
  try {
    const exists = await Course.exists({ slug: req.params.slug });
    if (!exists) return res.status(404).json({ error: '課程不存在' });
    const session = new CourseSession({ ...pickSessionInput(req.body), courseSlug: req.params.slug });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    sendError(res, err);
  }
});

// C-6. 更新梯次（用 save() 才會跑「結束日不可早於開始日」的檢查）
app.put('/api/admin/sessions/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: '梯次 ID 不正確' });
    const session = await CourseSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: '梯次不存在' });
    session.set(pickSessionInput(req.body));
    await session.save();
    res.json(session);
  } catch (err) {
    sendError(res, err);
  }
});

// C-7. 刪除梯次
app.delete('/api/admin/sessions/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: '梯次 ID 不正確' });
    const session = await CourseSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: '梯次不存在' });
    res.json({ message: '梯次已刪除', courseSlug: session.courseSlug });
  } catch (err) {
    sendError(res, err);
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

// ═══════════════════════════════════════════════════════════
//  MEDIA LIBRARY（需認證）
// ═══════════════════════════════════════════════════════════

// J. 列出 R2 已上傳媒體，供後台重複選用（避免重複上傳佔用容量）
app.get('/api/admin/media', authMiddleware, async (req, res) => {
  try {
    const { type } = req.query;   // 'image' | 'video' | 'all'（預設 all）

    const [listResults, usedKeys] = await Promise.all([
      Promise.all(MEDIA_PREFIXES.map(listPrefix)),
      collectUsedKeys().catch(() => new Set()),   // 標記用途失敗不影響列表
    ]);

    const items = listResults
      .flatMap((r) => r.objects)
      .filter((o) => o.Key && !o.Key.endsWith('/') && o.Size > 0)
      .map((o) => {
        const ext = o.Key.split('.').pop().toLowerCase();
        return {
          key: o.Key,
          url: `${process.env.R2_PUBLIC_URL}/${o.Key}`,
          name: o.Key.split('/').pop(),
          size: o.Size,
          lastModified: o.LastModified,
          type: VIDEO_EXT.has(ext) ? 'video' : IMAGE_EXT.has(ext) ? 'image' : 'other',
          inUse: usedKeys.has(o.Key),
        };
      })
      .filter((m) => m.type !== 'other')
      .filter((m) => !type || type === 'all' || m.type === type)
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    res.json({
      items,
      truncated: listResults.some((r) => r.truncated),
      totalSize: items.reduce((sum, m) => sum + m.size, 0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// K. 刪除 R2 媒體（僅限沒有任何文章使用中的檔案）
app.delete('/api/admin/media', authMiddleware, async (req, res) => {
  try {
    const { key } = req.body || {};
    if (!key || typeof key !== 'string') return res.status(400).json({ error: '缺少 key' });
    if (!MEDIA_PREFIXES.some((p) => key.startsWith(p))) {
      return res.status(400).json({ error: '不允許刪除此路徑的檔案' });
    }

    const usedKeys = await collectUsedKeys();
    if (usedKeys.has(key)) {
      return res.status(409).json({ error: '此檔案仍被文章或課程使用中，無法刪除' });
    }

    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
    res.json({ message: '檔案已刪除' });
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
