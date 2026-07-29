/** @type {import('next').NextConfig} */

// R2 公開網域（server/.env 的 R2_PUBLIC_URL）。
// 若日後換 bucket，設定 NEXT_PUBLIC_R2_HOST 即可，不需改程式。
const R2_HOST = process.env.NEXT_PUBLIC_R2_HOST || 'pub-159d2f1534984928bc80b1820c8267c0.r2.dev'

const nextConfig = {
  // 關閉頁面 ETag。Zeabur 邊緣快取對 ISR 頁面做再驗證時，若它自己存的
  // body 損毀（例如容器崩潰期間存到壞的版本），源頭回 304 會讓它把
  // 「304 + 空回應」直接發給訪客，且因 ETag 不變而永遠無法自癒 ——
  // 實際症狀：從列表點進文章時 client-side exception（RSC payload 為空）。
  // 不發 ETag 後，邊緣每次再驗證都會拿到 200 完整內容，死循環不再成立。
  generateEtags: false,
  images: {
    // 只允許自家 R2，避免變成公開的圖片轉檔代理
    remotePatterns: [
      {
        protocol: 'https',
        hostname: R2_HOST,
        pathname: '/**',
      },
    ],
    // 只用 WebP，不用 AVIF。
    // AVIF 檔案雖然再小約 25%，但編碼慢 2～4 倍（實測 587KB 來源轉 1920px：
    // AVIF 3.6s vs WebP 1.0s）。部落格頁一次有 20 幾張圖，部署後快取是空的，
    // 全部擠在同一顆 CPU 上排隊會讓使用者等上好幾分鐘。
    formats: ['image/webp'],
    // 站台內容最寬 1200px（--max-width），預設會生成到 3840px 純屬浪費，
    // 砍掉大尺寸可大幅減少冷啟動時的轉檔負擔
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    // 轉檔結果至少快取 30 天（文章圖片幾乎不會變動）
    // 注意：這份快取存在容器內，每次重新部署都會清空
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}

export default nextConfig
