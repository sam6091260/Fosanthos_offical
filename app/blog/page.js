import { Suspense } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Blog from '../components/Blog/Blog'
import Footer from '../components/Footer/Footer'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'

export const metadata = {
  title: '部落格分享 | 心光卉',
  description: '學員的轉變故事、近期課程推廣、寶老師的日常短文 — 在這裡慢慢讀，每一段故事都是一束光。',
}

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div>Loading…</div>}>
          <Blog />
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
