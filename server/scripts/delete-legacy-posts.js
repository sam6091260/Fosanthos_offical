// ─── 刪除舊的每梯課程公告文章 ──────────
// 這 16 篇的內容與圖片已整併到「課程管理」，舊網址由前端 next.config.mjs 永久轉址到課程頁。
//
// 用法（在 server/ 目錄下）：
//   node scripts/delete-legacy-posts.js            預覽：列出會刪哪些文章，不寫入
//   node scripts/delete-legacy-posts.js --apply    先備份、再刪除
//
// 安全措施：
// - 只刪 server/data/courses-2026.js 的 legacyPosts 清單裡的文章，
//   而且必須同時符合 category = 'course' 與 isLegacyCourseAnnouncement = true，任何一項不符就跳過
// - --apply 會先把要刪的文章完整存成 JSON 備份（server/backups/，不進 git），備份失敗就不刪
// - 不會動到課程、梯次、圖片檔

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const { legacyPosts } = require('../data/courses-2026');

if (dns.getServers().every((s) => s === '127.0.0.1' || s === '::1')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const APPLY = process.argv.includes('--apply');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('✗ 沒有設定 MONGO_URI');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`模式：${APPLY ? 'apply（會刪除）' : '預覽（不寫入）'}`);
  console.log(`已連線資料庫：${mongoose.connection.name}\n`);

  const ids = legacyPosts.map((p) => p.id);
  const found = await Post.find({ id: { $in: ids } }).lean();
  const safe = found.filter((p) => p.category === 'course' && p.isLegacyCourseAnnouncement === true);
  const skipped = found.filter((p) => !safe.includes(p));
  const missing = ids.filter((id) => !found.some((p) => p.id === id));

  console.log(`清單 ${ids.length} 篇｜資料庫找到 ${found.length} 篇｜符合刪除條件 ${safe.length} 篇`);
  safe
    .sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate))
    .forEach((p) => console.log(`  - ${p.date || ''}｜${p.title}  →  /courses/${p.relatedCourse}`));
  if (skipped.length) {
    console.log(`\n⚠ 不符合條件、跳過 ${skipped.length} 篇（分類或標記不對）：`);
    skipped.forEach((p) => console.log(`  - ${p.id}｜${p.title}`));
  }
  if (missing.length) console.log(`\n（資料庫已沒有、略過：${missing.join(', ')}）`);

  if (!APPLY) {
    console.log('\n（預覽：沒有刪除任何資料）');
    return;
  }
  if (safe.length === 0) {
    console.log('\n沒有需要刪除的文章。');
    return;
  }

  // 先備份；寫檔失敗會丟錯，不會往下刪
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `legacy-course-posts-${stamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(safe, null, 2));
  const verify = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  if (verify.length !== safe.length) throw new Error('備份檔驗證失敗，已停止');
  console.log(`\n✓ 已備份 ${verify.length} 篇 → ${path.relative(process.cwd(), backupFile)}`);

  const { deletedCount } = await Post.deleteMany({
    id: { $in: safe.map((p) => p.id) },
    category: 'course',
    isLegacyCourseAnnouncement: true,
  });
  console.log(`✓ 已刪除 ${deletedCount} 篇`);
}

run()
  .catch((err) => {
    console.error('✗ 執行失敗：', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
