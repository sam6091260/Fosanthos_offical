import Navbar from '../components/Navbar/Navbar'
import Blog from '../components/Blog/Blog'
import Footer from '../components/Footer/Footer'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'
import JsonLd from '../components/JsonLd'
import { SITE_URL, SITE_NAME } from '../lib/site'

const description =
  '學員的轉變故事、近期課程推廣、寶老師的日常短文 — 在這裡慢慢讀，每一段故事都是一束光。'

export const metadata = {
  title: '部落格分享 | 心光卉',
  description,
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: '部落格分享 | 心光卉',
    description,
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary_large_image',
    title: '部落格分享 | 心光卉',
    description,
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: '部落格分享', item: `${SITE_URL}/blog` },
  ],
}

export default function BlogPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <Navbar />
      <main>
        <Blog />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
