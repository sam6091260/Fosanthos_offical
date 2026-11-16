// ─── 課程遷移腳本 ──────────
// 把 server/data/courses-2026.js 寫進 MongoDB（Course、CourseSession），
// 並把舊的每梯課程公告文章標記為 legacy。
//
// 用法（在 server/ 目錄下）：
//   node scripts/migrate-courses.js              只檢查資料格式，不連資料庫
//   node scripts/migrate-courses.js --dry-run    連資料庫，列出「會新增／更新」什麼，不寫入
//   node scripts/migrate-courses.js --apply      真的寫入（todo 沒清空會拒絕）
//   node scripts/migrate-courses.js --apply --allow-todo   todo 沒清空也照寫
//
// 安全性：
// - 只做 upsert（有就更新、沒有就新增），不刪除任何資料，可重複執行。
// - 課程以 slug、梯次以 courseSlug + startDate 判斷是否已存在。
// - 舊文章只改 isLegacyCourseAnnouncement、relatedCourse 兩個欄位，內容不動。
// - MONGO_URI 指向哪個資料庫就寫哪個，執行前請確認（會印出資料庫名稱）。

require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const CourseSession = require('../models/CourseSession');
const Post = require('../models/Post');
const { courses, sessions, legacyPosts } = require('../data/courses-2026');

// 與 index.js 相同的 Windows DNS 修正
if (dns.getServers().every((s) => s === '127.0.0.1' || s === '::1')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const args = new Set(process.argv.slice(2));
const MODE = args.has('--apply') ? 'apply' : args.has('--dry-run') ? 'dry-run' : 'validate';
const ALLOW_TODO = args.has('--allow-todo');

// 只留下 schema 欄位（拿掉 todo、sourcePostId 等備註）
const COURSE_FIELDS = ['slug', 'title', 'subtitle', 'coverImage', 'description', 'format', 'duration', 'teacher', 'gallery', 'type', 'order'];
const SESSION_FIELDS = ['courseSlug', 'startDate', 'endDate', 'timeNote', 'status', 'registerUrl'];
const pick = (obj, fields) =>
  Object.fromEntries(fields.filter((f) => obj[f] !== undefined && obj[f] !== null).map((f) => [f, obj[f]]));

function validate() {
  const errors = [];
  const slugs = new Set();
  for (const c of courses) {
    const err = new Course(pick(c, COURSE_FIELDS)).validateSync();
    if (err) errors.push(`課程 ${c.slug}: ${Object.keys(err.errors).join(', ')}`);
    if (slugs.has(c.slug)) errors.push(`課程 slug 重複: ${c.slug}`);
    slugs.add(c.slug);
  }
  const sessionKeys = new Set();
  for (const s of sessions) {
    const label = `梯次 ${s.courseSlug} ${s.startDate}`;
    const err = new CourseSession(pick(s, SESSION_FIELDS)).validateSync();
    if (err) errors.push(`${label}: ${Object.keys(err.errors).join(', ')}`);
    if (!slugs.has(s.courseSlug)) errors.push(`${label}: 找不到課程 ${s.courseSlug}`);
    const key = `${s.courseSlug}|${s.startDate}`;
    if (sessionKeys.has(key)) errors.push(`${label}: 重複`);
    sessionKeys.add(key);
  }
  for (const p of legacyPosts) {
    if (!slugs.has(p.relatedCourse)) errors.push(`文章 ${p.id}: 找不到課程 ${p.relatedCourse}`);
  }
  return errors;
}

function collectTodos() {
  const list = [];
  for (const c of courses) for (const t of c.todo || []) list.push(`[課程 ${c.slug}] ${t}`);
  for (const s of sessions) for (const t of s.todo || []) list.push(`[梯次 ${s.courseSlug} ${s.startDate}] ${t}`);
  return list;
}

async function run() {
  console.log(`模式：${MODE}`);
  console.log(`資料：${courses.length} 門課程、${sessions.length} 個梯次、${legacyPosts.length} 篇舊文章`);

  const errors = validate();
  if (errors.length) {
    console.error('\n✗ 資料格式錯誤：');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  console.log('✓ 資料格式檢查通過');

  const todos = collectTodos();
  if (todos.length) {
    console.log(`\n⚠ 尚有 ${todos.length} 項需要人工確認：`);
    todos.forEach((t) => console.log(`  - ${t}`));
  }

  if (MODE === 'validate') return;
  if (MODE === 'apply' && todos.length && !ALLOW_TODO) {
    console.error('\n✗ 還有 todo 沒處理，已停止。確認後刪除 todo，或加 --allow-todo 強制執行。');
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error('✗ 沒有設定 MONGO_URI');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`\n已連線資料庫：${mongoose.connection.name}`);
  const write = MODE === 'apply';
  const stats = { courseNew: 0, courseUpdate: 0, sessionNew: 0, sessionUpdate: 0, postMarked: 0, postMissing: [] };

  for (const c of courses) {
    const data = pick(c, COURSE_FIELDS);
    const exists = await Course.exists({ slug: c.slug });
    exists ? stats.courseUpdate++ : stats.courseNew++;
    if (write) await Course.updateOne({ slug: c.slug }, { $set: data }, { upsert: true, runValidators: true });
  }

  for (const s of sessions) {
    const data = pick(s, SESSION_FIELDS);
    const filter = { courseSlug: s.courseSlug, startDate: s.startDate };
    const exists = await CourseSession.exists(filter);
    exists ? stats.sessionUpdate++ : stats.sessionNew++;
    if (write) await CourseSession.updateOne(filter, { $set: data }, { upsert: true, runValidators: true });
  }

  for (const p of legacyPosts) {
    const exists = await Post.exists({ id: p.id });
    if (!exists) { stats.postMissing.push(p.id); continue; }
    stats.postMarked++;
    if (write) {
      await Post.updateOne(
        { id: p.id },
        { $set: { isLegacyCourseAnnouncement: true, relatedCourse: p.relatedCourse } }
      );
    }
  }

  const verb = write ? '已' : '將會';
  console.log(`\n課程：${verb}新增 ${stats.courseNew}、${verb}更新 ${stats.courseUpdate}`);
  console.log(`梯次：${verb}新增 ${stats.sessionNew}、${verb}更新 ${stats.sessionUpdate}`);
  console.log(`舊文章：${verb}標記 ${stats.postMarked} 篇`);
  if (stats.postMissing.length) console.log(`⚠ 找不到這些文章（略過）：${stats.postMissing.join(', ')}`);
  if (!write) console.log('\n（dry-run：沒有寫入任何資料）');
}

run()
  .catch((err) => {
    console.error('✗ 執行失敗：', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
