const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,          // 文字檔內容
  mediaUrl: String,        // 雲端儲存後的照片/影片網址
  mediaType: String,       // 'image' 或 'video'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
