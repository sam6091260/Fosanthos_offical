import './globals.css'

export const metadata = {
  title: '心光卉有限公司 | 在日常中，陪伴你走向更清晰的自己',
  description: '心光卉有限公司致力於身心靈整合，提供印度課程代理、寶老師課程及彩光花波服務，陪伴人們在日常中找到內在的穩定與清晰。',
  keywords: '心光卉, 身心靈, 印度課程, 彩光花波, 冥想, 自我療癒, 靈性成長',
  openGraph: {
    title: '心光卉有限公司',
    description: '在日常中，陪伴你走向更清晰的自己',
    type: 'website',
    locale: 'zh_TW',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
