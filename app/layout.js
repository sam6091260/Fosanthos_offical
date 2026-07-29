import './globals.css'
import PageTransition from './components/PageTransition/PageTransition'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './lib/site'

export const metadata = {
  title: '心光卉 Fosanthos | 在日常中，陪伴你走向更清晰的自己',
  description: SITE_DESCRIPTION,
  keywords: '心光卉, 身心靈, 印度課程, 彩光花波, 冥想, 自我療癒, 靈性成長',
  metadataBase: new URL(SITE_URL),
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
