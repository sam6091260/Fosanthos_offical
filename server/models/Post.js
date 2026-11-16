const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  id: { type: String, unique: true },       // 文章 ID (如 'student-1')
  category: String,                          // 分類代碼 (如 'student', 'course')
  categoryLabel: String,                     // 分類顯示名稱 (如 '學員奇蹟分享')
  title: String,                             // 文章標題
  excerpt: String,                           // 摘要
  content: String,                           // 完整內容
  date: String,                              // 日期（顯示用）
  publishDate: { type: Date, default: Date.now }, // 發布日期（排序用）
  author: String,                            // 作者
  image: String,                             // 封面圖片網址
  gallery: [String],                         // 圖片集
  featured: { type: Boolean, default: false }, // 是否精選
  mediaUrl: String,                          // 雲端媒體網址 (R2)
  mediaType: String,                         // 'image' 或 'video'
  status: { type: String, enum: ['draft', 'published'], default: 'published' }, // 草稿/已發布
  relatedCourse: { type: String, default: null, index: true }, // 關聯課程 slug（文末顯示報名卡）
  isLegacyCourseAnnouncement: { type: Boolean, default: false }, // 舊的每梯課程公告：不出現在列表，原網址仍可開
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
