/** @type {import('next').NextConfig} */

// R2 公開網域（server/.env 的 R2_PUBLIC_URL）。
// 若日後換 bucket，設定 NEXT_PUBLIC_R2_HOST 即可，不需改程式。
const R2_HOST = process.env.NEXT_PUBLIC_R2_HOST || 'pub-159d2f1534984928bc80b1820c8267c0.r2.dev'

const nextConfig = {
  images: {
    // 只允許自家 R2，避免變成公開的圖片轉檔代理
    remotePatterns: [
      {
        protocol: 'https',
        hostname: R2_HOST,
        pathname: '/**',
      },
    ],
    // 優先輸出 AVIF / WebP，體積約為原始 JPEG 的 1/3～1/2
    formats: ['image/avif', 'image/webp'],
    // 轉檔結果至少快取 30 天（文章圖片幾乎不會變動）
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}

export default nextConfig
