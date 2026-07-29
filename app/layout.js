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
  // iOS Safari 會用這個顏色畫它自己的 UI 區域（狀態列、底部工具列）。
  // 沒設就改為取樣頁面背景色。
  //
  // 實測：iPhone 直向時網頁只拿得到 735px，螢幕有 896px，中間 161px 是
  // Safari 的 UI —— 網頁無法繪製進去。因此那塊「空白帶」唯一能做的就是
  // 讓它的顏色與頁面底部接得上，看不出接縫。
  // 站上多數區塊底部是白色卡片／內容區，故取純白。
  themeColor: '#FFFFFF',
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
