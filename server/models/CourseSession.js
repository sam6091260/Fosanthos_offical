const mongoose = require('mongoose');

// 日期一律存 'YYYY-MM-DD'，代表台北時間的日曆日。
// 不存 Date 物件，避免 UTC 轉換讓日期差一天。
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// 一梯 = 一筆 CourseSession，掛在某門 Course 底下。
const CourseSessionSchema = new mongoose.Schema(
  {
    courseSlug: { type: String, required: true, index: true, trim: true },
    startDate: { type: String, required: true, match: ISO_DATE },
    endDate: {
      type: String,
      required: true,
      match: ISO_DATE,
      validate: {
        validator(value) {
          // 更新時 this 不一定是文件，拿不到 startDate 就略過
          return !this.startDate || value >= this.startDate;
        },
        message: 'endDate 不可早於 startDate',
      },
    },
    timeNote: String,                                   // 例：'每晚 19:30-21:30'
    status: {                                           // 由後台手動設定
      type: String,
      enum: ['open', 'almost_full', 'full', 'closed'],
      default: 'open',
    },
    // 只允許 http(s)，避免 javascript: 之類的連結被放進 <a href>
    registerUrl: { type: String, match: /^https?:\/\//i },
  },
  { timestamps: true, collection: 'course_sessions' }
);

module.exports = mongoose.model('CourseSession', CourseSessionSchema);
