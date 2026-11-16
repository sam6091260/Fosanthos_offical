// ─── 後台課程／梯次的輸入整理 ──────────
// 只挑出允許修改的欄位，避免前端送什麼就寫什麼（例如偷改 _id、createdAt）。

const COURSE_FIELDS = ['title', 'subtitle', 'coverImage', 'description', 'format', 'duration', 'teacher', 'gallery', 'type', 'order'];
// registerUrl 不開放編輯：網站報名一律導到聯絡表單
const SESSION_FIELDS = ['startDate', 'endDate', 'timeNote', 'status'];

const GALLERY_MAX = 20;

function pick(body, fields) {
  const out = {};
  if (!body || typeof body !== 'object') return out;
  for (const f of fields) {
    if (body[f] === undefined) continue;
    let v = body[f];
    if (typeof v === 'string') v = v.trim();
    out[f] = v;
  }
  return out;
}

function pickCourseInput(body) {
  const data = pick(body, COURSE_FIELDS);
  if ('gallery' in data) {
    // 只收 http(s) 網址字串，去重複，最多 20 個
    const list = Array.isArray(data.gallery) ? data.gallery : [];
    const urls = list
      .filter((u) => typeof u === 'string')
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u));
    data.gallery = [...new Set(urls)].slice(0, GALLERY_MAX);
  }
  if ('order' in data) {
    const n = Number(data.order);
    data.order = Number.isFinite(n) ? n : 0;
  }
  return data;
}

// /admin/courses/new 是「新增課程」頁，slug 不能叫 new
const RESERVED_SLUGS = new Set(['new']);

function pickSessionInput(body) {
  return pick(body, SESSION_FIELDS);
}

// 把 mongoose 錯誤轉成給後台看的訊息與狀態碼
function toHttpError(err) {
  if (err && err.name === 'ValidationError') {
    const fields = Object.keys(err.errors || {});
    return { status: 400, error: `欄位格式不正確：${fields.join('、')}` };
  }
  if (err && err.code === 11000) {
    return { status: 409, error: '代號（slug）已被使用' };
  }
  return { status: 500, error: (err && err.message) || '伺服器錯誤' };
}

module.exports = { GALLERY_MAX, COURSE_FIELDS, SESSION_FIELDS, RESERVED_SLUGS, pickCourseInput, pickSessionInput, toHttpError };
