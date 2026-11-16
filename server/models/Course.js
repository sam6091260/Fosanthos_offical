const mongoose = require('mongoose');

// 一門課 = 一筆 Course。每一梯的日期放在 CourseSession（用 courseSlug 連結）。
const CourseSchema = new mongoose.Schema(
  {
    // 網址用的代號，例：'deeksha-yajna'（只允許小寫英數與 -）
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    title: { type: String, required: true, trim: true },
    subtitle: String,                                   // 一句話簡介
    coverImage: String,                                 // 封面圖網址（R2）
    description: String,                                // 課程介紹（Markdown）
    format: {                                           // 線上 / 實體 / 混合
      type: String,
      enum: ['online', 'in_person', 'hybrid'],
      required: true,
    },
    duration: String,                                   // 例：'5 日'
    teacher: String,
    gallery: [String],                                  // 其他圖片／影片（R2 網址）
    type: {                                             // 每月常態 / 年度方案
      type: String,
      enum: ['recurring', 'annual'],
      default: 'recurring',
    },
    order: { type: Number, default: 0 },                // 數字越小越前面
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', CourseSchema);
