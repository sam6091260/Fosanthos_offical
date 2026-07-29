import './globals.css'
import PageTransition from './components/PageTransition/PageTransition'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './lib/site'

export const metadata = {
  title: '心光卉 Fosanthos | 在日常中，陪伴你走向更清晰的自己',
  description: SITE_DESCRIPTION,
  keywords: '心光卉, 身心靈, 印度課程, 彩光花波, 冥想, 自我療癒, 靈性成長',
  metadataBase: new URL(SITE_URL),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    // 直向 Safari 下 env(safe-area-inset-*) 實測皆為 0，cover 在那裡沒有作用；
    // 保留是為了橫向（瀏海會佔左右）與未來的 PWA standalone 模式。
    viewportFit: 'cover',
  },
  // 刻意不設 theme-color。
  //
  // 實測（iPhone 診斷頁）：未設定時，Safari 會取樣頁面底部的實際顏色來畫
  // 它自己的工具列區域 —— 頁面底部是紅色，那條帶子就是粉紅。一旦指定固定
  // 色，它便改畫該色、不再跟著頁面走，接縫反而更明顯。
  // 對照組 seizexiri.com 同樣未設定。
  //
  // 另註：直向 Safari 下網頁只拿得到 735px，螢幕 852px，中間是瀏覽器 UI，
  // 網頁無法繪製進去。那塊區域只能靠顏色貼合，無法消除。
  // 站台同時可由 zeabur 網域存取，canonical 一律指向正式網域，避免重複內容
  alternates: {
    canonical: '/',
  },
  // Google Search Console 網站擁有權驗證
  verification: {
    google: '2g05idDh0yUwNrPIGQCdYyHxVgb2pDAGSa3ql3RyXr4',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: SITE_NAME,
    description: '在日常中，陪伴你走向更清晰的自己',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: '/logo_square.png',
        width: 512,
        height: 512,
        alt: '心光卉 Fosanthos Logo',
      },
    ],
    type: 'website',
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: '在日常中，陪伴你走向更清晰的自己',
    images: ['/logo_square.png'],
  },
}

// 注意：Next 13.5 沒有獨立的 `viewport` export（那是 Next 14 才有的）。
// 這裡必須寫在 metadata 裡，否則會被忽略、只輸出 Next 的預設 viewport。

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
