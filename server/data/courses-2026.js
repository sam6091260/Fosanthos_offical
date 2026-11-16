// ─── 課程遷移資料（2026） ──────────
// 由 category=course 的 16 篇文章整理而來（公開 API 讀取，產生於 2026-11-16）。
// 套用方式見 server/scripts/migrate-courses.js。
//
// - 課程不顯示金額（沒有費用欄位）
// - 每門課的 gallery 收進該課所有舊文章用過的圖片／影片
//
// 每筆的 todo 陣列 = 無法從原文自動判斷、需要人工確認的欄位。
// 遷移後都可以在後台「課程管理」修改；todo 沒清空前 --apply 需加 --allow-todo。

const courses = [
  {
    slug: "miracle-5-day",
    title: "奇蹟五日課",
    subtitle: "一段「狀態啟動與深化」的旅程，培養七大核心藝術",
    coverImage: "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1780017678753-hqq0x21y6f.jpg",
    format: "online",
    duration: "5 日",
    teacher: null,
    type: "recurring",
    order: 1,
    // 圖片集：這門課所有舊文章用過的封面與 gallery（新→舊，已扣掉封面）
    gallery: [
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1783054178272-dfggkw2k5um.jpg",
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1783054386757-q7g5f85t7.png",
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1780017684864-2c53bi182cy.png",
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_video/5D_class.jpg",
    ],
    // 介紹內文：取自最新一篇文章（原封不動）
    sourcePostId: "course-1791778742255-10-28-11-1",
    description: "本課程是一段「**狀態啟動與深化**」的旅程。\n\n你將從當下開始，進入一個被持續調適與準備的過程，\n如同火箭發射前的精密校準——\n> 唯有準備就緒，才能真正啟動、穩定前行。\n\n這五天，不是結果，而是「**啟動**」。\n\n## 🚀 課程將帶你經歷的歷程\n\n- 啟動內在狀態的轉化歷程\n- 逐步進入穩定且持續深化的「內在狀態」\n- 在未來，具備將此狀態「傳遞給他人」的能力（可親授或線上）\n- 進入一條持續擴展、沒有終點的奇蹟之旅\n\n> 這不只是一次課程，而是一段長期轉化的開始。\n\n## 🔮 最終發展方向\n\n當你持續參與與深化：\n\n- 你將進入「穩定的永久狀態」\n- 並逐步具備將此狀態傳遞給他人的能力\n- 每位學員未來皆有機會影響與支持更多生命（最高可至108人）\n\n> 這是一種從「個人轉化」走向「影響世界」的過程。\n\n## ✨ 本次課程將培養的七大核心藝術\n\n在五日課中，你將開始學習並實踐以下七項關鍵能力：\n\n1. 祈禱的藝術（最核心）\n2. 傾聽的藝術\n3. 看見的藝術\n4. 感恩的藝術\n5. 正確理解的藝術\n6. 與生命同流的藝術\n7. 生活的藝術\n\n## ✨ 為何「祈禱的藝術」最重要？\n\n當你真正掌握祈禱：\n\n- 你將能直接獲得內在指引\n- 你的生命方向將變得清晰\n- 你將開始與更高智慧連結\n- 並為世界帶來實質的影響與支持\n\n> 祈禱，不只是形式，而是一種需要練習與實踐的能力。\n\n🌍 **此刻，世界正在等待**\n\n> 當越來越多人成為「狀態的承載者與傳遞者」，\n> 一種新的集體轉變將自然發生。\n\n**這門課，正是為此而準備**。",
    todo: [
      "format：原文沒寫線上或實體，暫填 online",
      "teacher：原文沒寫授課老師",
      "subtitle：由 Claude 依內文摘要撰寫，請確認用字",
      "梯次 timeNote：6 梯原文都沒有上課時間",
      "gallery：收進了舊封面與各梯海報（可能印有舊日期），請在後台把不需要的移除",
    ],
  },
  {
    slug: "inner-child-3-day",
    title: "新版三日課",
    subtitle: "療癒內在小孩，掌握看見的藝術",
    coverImage: "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1780017902237-c74rk7sdfig-1600.jpg",
    format: "online",
    duration: "3 日",
    teacher: "Tejasa 老師",
    type: "recurring",
    order: 2,
    // 圖片集：這門課所有舊文章用過的封面與 gallery（新→舊，已扣掉封面）
    gallery: [
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1783054491028-uewedfred4o-1600.jpg",
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1783054397809-vcgxri91d69.png",
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1780017905162-8kobrm6a6mf.png",
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_video/3D_class.jpg",
    ],
    // 介紹內文：取自最新一篇文章（原封不動）
    sourcePostId: "course-1791778691992-10-9-11",
    description: "## 🧡 課程主軸\n\n- **療癒內在小孩**\n- **掌握「看見的藝術」**\n\n---\n\n## 🌿 課程內容\n\n在 Tejasa 老師細緻的引導下，我們深入探索：\n\n- ✨ 掌控生命的【十大程式】\n- ✨ 生命最初形成的【四個籃子】\n\n在偉大慈悲之光的臨在與恩典中——\n\n- 🌸 看見內在小孩曾經的傷與狀態\n- 🌸 逐步消融深層限制與負面影響\n- 🌸 療癒與父母的關係\n- 🌸 幫助祖先解脫\n\n**最終——**\n\n- 💖 每位學員的內在小孩都獲得深刻療癒\n- 💖 與阿瑪巴關的連結更加深厚\n\n---\n\n## 🎁 療癒帶來的禮物\n\n當內在小孩被療癒，你將獲得：\n\n1. **智慧**\n2. **能量**\n3. **健康**\n4. **關係**\n5. **財富**\n6. **平靜**\n\n> ✨ 一份豐盛而全面的生命轉化 ✨",
    todo: [
      "format：原文沒寫線上或實體，暫填 online",
      "teacher：由內文「在 Tejasa 老師細緻的引導下」推斷，請確認",
      "梯次 timeNote：6 梯原文都沒有上課時間",
      "gallery：收進了舊封面與各梯海報（可能印有舊日期），請在後台把不需要的移除",
    ],
  },
  {
    slug: "gift-of-ananda",
    title: "法喜之禮物 Gift of Ananda",
    subtitle: "國際公益線上課程・3 小時的內在豐盛旅程",
    coverImage: "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1783053001117-ihs2v2b887-1600.jpg",
    format: "online",
    duration: "3 小時",
    teacher: null,
    type: "recurring",
    order: 3,
    // 圖片集：這門課所有舊文章用過的封面與 gallery（新→舊，已扣掉封面）
    gallery: [
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1785382720341-ivubjwnb7m.png",
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1783054408452-n668hgl4ud.png",
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1779414285790-xulows8ck2-1600.jpg",
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_images/1779413992201-nbjrndyngni.png",
    ],
    // 介紹內文：取自最新一篇文章（已移除過期的上課時間、金額與報名連結）
    sourcePostId: "course-1785382775499-8-gift-of-ananda",
    description: "\n>當內在的豐盛被開啟，健康生命將隨之流動\n\n\n在 3 小時的內在旅程中，我們將一起：\n\n- 深層調頻｜釋放阻礙豐盛的情緒枷鎖\n- 意識轉化｜重塑感知力，開啟健康新格局\n- 能量校準｜提振頻率，找回內在的平衡與定靜\n\n\n---\n\n🧘‍♀️備註：\n課程 3 小時且無中間休息，建議預備安靜、\n不被打擾的空間，並準備好飲用水。\n",
    todo: [
      "teacher：原文沒寫授課老師",
      "subtitle：由 Claude 依標題與內文撰寫，請確認用字",
      "gallery：收進了舊封面與各梯海報（可能印有舊日期），請在後台把不需要的移除",
    ],
  },
  {
    slug: "deeksha-yajna",
    title: "81000 Deeksha Yajna 年度慧員",
    subtitle: "黃金紀元運動・2026-2027 年度慧員課程",
    coverImage: "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_video/DY.png",
    format: "online",
    duration: "12 個月",
    teacher: "Tejasaji 老師",
    type: "annual",
    order: 4,
    // 圖片集：這門課所有舊文章用過的封面與 gallery（新→舊，已扣掉封面）
    gallery: [
      "https://pub-159d2f1534984928bc80b1820c8267c0.r2.dev/fosanthos_video/81000DY-class-intro-.mp4",
    ],
    // 介紹內文：取自最新一篇文章（原封不動）
    sourcePostId: "course-3",
    description: "> 81000 Deeksha Yajna・2026-2027 年度慧員報名\n> 黃金紀元運動・81000 Deeksha Yajna 年度慧員課程\n\n**🎁 慧園週期：** 2026年6月起，至2027年5月底結束。全年任何時間皆可加入。\n\n---\n\n## 🎁 課程組成\n\n### 一、意識深化課・Deepening Process\n\n**✦ 上課時間：**\n- 每週六晚上 8:30-10:00 直播\n- 每週一晚上 8:30-10:00 重播\n- 每週二晚上 8:30-10:00 共修\n\n本課程由資深印du指導老師 Tejasaji 親自帶領。在課程中，我們將在高意識存在 Tejasa 老師的引領下，逐步深入理解來自偉大CB之光BB MM的教導，進入內在真相，轉化負面內在模式，快速提升意識層次。\n\n---\n\n### 二、尊者BB達顯・Sri BG Darshan\n\n**✦ 上課時間：** 每月最後一個週六 晚上 8:00-10:30\n\n這是一堂極爲殊勝、難得的課程：由尊者BB親自達顯，迴應來自全球學員的提問。在課程中，我們將親炙BB的臨在，與浩瀚的合一意識共振，並通過問答深入理解黃金dao法的核心教導，以及黃金紀元運動與集體意識的最新發展。\n\n問答結束後，將進行神聖奧祕過程，偉大慈悲之光將在多個能量層面進行療愈，清除無意識障礙，加速意識提升。\n\n---\n\n### 三、滿月靜心・Full Moon Deeksha\n\n**✦ 上課時間：** 每月滿月日 晚上 8:30-9:30\n\n滿月是能量圓滿、極爲吉祥的時刻。在這一天進行靜心與祈禱，將產生倍增的效果。在 Tejasaji 老師帶領的奧祕過程中，我們將進入BBMM賜予的開wu狀態，併爲國家進行集體祈禱，促進個人與集體意識的提升。\n\n---\n\n### 四、黃金聖壺祈福儀式・Golden Pot Blessings\n\n> ✦ 持續進行的祈福儀式，帶來保護與祝福\n\n所有報名 81000 Deeksha Yajna 的會員，其資料與照片將被安放於印du Sathyaloka 真理校區的黃金聖壺中。由高意識狀態的指導老師持續進行真言誦唸與火🔥供祈福。\n\n通過這些儀式：\n\n- 清除無意識障礙與負面程序\n- 轉化外在生命\n- 帶來豐盛與圓滿\n- 加速意識提升與開wu\n\n此外，成員將受到BBMM的保護，幫助我們安然度過時代轉變的動盪時期。\n\n> ※ 學員無需參與儀式過程\n> ※ 每月達顯日將有校區巡禮直播\n\n也可爲家人朋友報名，即使不參與課程，也可獲得持續祝福與保護。\n\n---\n\n### 五、Q&A 問答月會・Monthly Q&A Conference\n\n**✦ 每月一次**\n\n所有 81000 DY 會員可向印度指導老師 Tejasaji 提問關於：\n\n- 課程內容\n- 生活問題\n- 靈性成長\n\n老師將親自給予解答與洞見，協助深化學習與成長。（日期將提前公佈）\n\n---\n\n### 六、SKHP 線上奧祕療愈過程・Sri Kalki Healing Process\n\n**✦ 每週一場**\n\n**時間：** 每週六早上 7:00-8:15\n\n該療愈過程由印du Sathyaloka 直播，由 Tejasaji 老師親自帶領。在高維能量連結中，Sri Kalki 將幫助我們看見疾病與失衡的根源，並賜予神聖靈藥 Soma，協助身心靈的轉化與療愈。\n\n**這是 81000 DY 會員專屬的強大恩典過程。**\n\n---\n\n## 🩵 課程費用\n\n全年會員費用包含：\n\n- 所有課程\n- 達顯\n- 儀式\n- 療愈過程\n- 課程轉播\n- 中文翻譯\n- 行政服務\n- 每月達顯逐字稿翻譯（共12份）\n\n> ※ 無需即時翻譯者可報名英文教室\n> ※ 僅接受祝福者可報名純祝福會員\n\n**💚 費用方案：請來信諮詢**",
    todo: [
      "format：由「直播／重播」推斷為 online，請確認",
      "title：原標題為「81000 Deeksha Yajna・2026-2027 年度慧員報名」，已拿掉年份與「報名」字樣，請確認",
    ],
  },
]

// 日期一律 YYYY-MM-DD（台北時間）。今天（2026-11-16）已結束的梯次標為 closed。
// registerUrl 保留原文的報名連結作紀錄；網站的報名按鈕統一導到 https://fosanthos.com/#contact，不使用此欄位。
const sessions = [
  // 奇蹟五日課
  { courseSlug: 'miracle-5-day', startDate: '2026-05-27', endDate: '2026-05-31', timeNote: null, status: 'closed', registerUrl: null },
  { courseSlug: 'miracle-5-day', startDate: '2026-06-24', endDate: '2026-06-28', timeNote: null, status: 'closed', registerUrl: null },
  { courseSlug: 'miracle-5-day', startDate: '2026-07-22', endDate: '2026-07-26', timeNote: null, status: 'closed', registerUrl: null },
  { courseSlug: 'miracle-5-day', startDate: '2026-08-26', endDate: '2026-08-30', timeNote: null, status: 'closed', registerUrl: null },
  { courseSlug: 'miracle-5-day', startDate: '2026-09-23', endDate: '2026-09-27', timeNote: null, status: 'closed', registerUrl: null },
  { courseSlug: 'miracle-5-day', startDate: '2026-10-28', endDate: '2026-11-01', timeNote: null, status: 'closed', registerUrl: null },
  // 新版三日課
  { courseSlug: 'inner-child-3-day', startDate: '2026-05-08', endDate: '2026-05-10', timeNote: null, status: 'closed', registerUrl: null },
  { courseSlug: 'inner-child-3-day', startDate: '2026-06-12', endDate: '2026-06-14', timeNote: null, status: 'closed', registerUrl: null },
  { courseSlug: 'inner-child-3-day', startDate: '2026-07-10', endDate: '2026-07-12', timeNote: null, status: 'closed', registerUrl: null },
  { courseSlug: 'inner-child-3-day', startDate: '2026-08-07', endDate: '2026-08-09', timeNote: null, status: 'closed', registerUrl: null },
  { courseSlug: 'inner-child-3-day', startDate: '2026-09-11', endDate: '2026-09-13', timeNote: null, status: 'closed', registerUrl: null },
  { courseSlug: 'inner-child-3-day', startDate: '2026-10-09', endDate: '2026-10-11', timeNote: null, status: 'closed', registerUrl: null },
  // 法喜之禮物：原文都有確切日期（皆為週二）
  { courseSlug: 'gift-of-ananda', startDate: '2026-06-16', endDate: '2026-06-16', timeNote: '週二 18:00-21:00（3 小時，無中場休息）', status: 'closed', registerUrl: "https://forms.gle/1Zm8A9AA1ZVby2Vr7", sourcePostId: "course-1779413938968-gift-of-ananda" },
  { courseSlug: 'gift-of-ananda', startDate: '2026-07-07', endDate: '2026-07-07', timeNote: '週二 18:00-21:00（3 小時，無中場休息）', status: 'closed', registerUrl: "https://forms.gle/DvyV1fsn8mGxu8FKA", sourcePostId: "course-1783053074010-7-gift-of-ananda" },
  { courseSlug: 'gift-of-ananda', startDate: '2026-08-11', endDate: '2026-08-11', timeNote: '週二 18:00-21:00（3 小時，無中場休息）', status: 'closed', registerUrl: "https://forms.gle/anDNyyZGmhtHSdX68", sourcePostId: "course-1785382775499-8-gift-of-ananda" },
  // 81000 Deeksha Yajna：年度方案，全年可加入
  { courseSlug: 'deeksha-yajna', startDate: '2026-06-01', endDate: '2027-05-31', timeNote: '每週六 20:30-22:00 直播（另有重播、共修與每月達顯）', status: 'open', registerUrl: null },
]

// 舊的每梯公告文章：標記為 legacy（部落格列表不再顯示，但原網址仍可開），並連到對應課程
const legacyPosts = [
  { id: "course-1791778742255-10-28-11-1", relatedCourse: "miracle-5-day" }, // 🌟 10/28-11/1 奇蹟五日課｜課程核心意圖
  { id: "course-1791778691992-10-9-11", relatedCourse: "inner-child-3-day" }, // 🌸 10/9-11 新版三日課 — 療癒內在小孩，掌握看見的藝術
  { id: "course-1789443884844-9-23-27", relatedCourse: "miracle-5-day" }, // 🌟 9/23-27 奇蹟五日課｜課程核心意圖
  { id: "course-1789443841731-9-11-13", relatedCourse: "inner-child-3-day" }, // 🌸 9/11-13 新版三日課 — 療癒內在小孩，掌握看見的藝術
  { id: "course-1785383648979-8-26-30", relatedCourse: "miracle-5-day" }, // 🌟 8/26-30 奇蹟五日課｜課程核心意圖
  { id: "course-1785383610123-8-07-09", relatedCourse: "inner-child-3-day" }, // 🌸 8/07-09 新版三日課 — 療癒內在小孩，掌握看見的藝術
  { id: "course-1785382775499-8-gift-of-ananda", relatedCourse: "gift-of-ananda" }, // 8月【法喜之禮物 Gift of Ananda】｜國際公益線上課程
  { id: "course-1783054057184-7-10-12", relatedCourse: "inner-child-3-day" }, // 🌸 7/10-12 新版三日課 — 療癒內在小孩，掌握看見的藝術
  { id: "course-1783053074010-7-gift-of-ananda", relatedCourse: "gift-of-ananda" }, // 7月【法喜之禮物 Gift of Ananda】｜國際公益線上課程
  { id: "course-1783054109065-7-22-26", relatedCourse: "miracle-5-day" }, // 🌟 7/22-26 奇蹟五日課｜課程核心意圖
  { id: "course-1780017560484-6-12-14", relatedCourse: "inner-child-3-day" }, // 🌸 6/12-14 新版三日課 — 療癒內在小孩，掌握看見的藝術
  { id: "course-1780017691236-6-24-28", relatedCourse: "miracle-5-day" }, // 🌟 6/24-28 奇蹟五日課｜課程核心意圖
  { id: "course-1779413938968-gift-of-ananda", relatedCourse: "gift-of-ananda" }, // 6月【法喜之禮物 Gift of Ananda】｜國際公益線上課程
  { id: "course-3", relatedCourse: "deeksha-yajna" }, // 81000 Deeksha Yajna・2026-2027 年度慧員報名
  { id: "course-1", relatedCourse: "inner-child-3-day" }, // 🌸 5/8-10 新版三日課 — 療癒內在小孩，掌握看見的藝術
  { id: "course-2", relatedCourse: "miracle-5-day" }, // 🌟 5/27-31 奇蹟五日課｜課程核心意圖
]

module.exports = { courses, sessions, legacyPosts }
