import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'
import JsonLd from '../components/JsonLd'
import CourseCard from '../components/Courses/CourseCard'
import { getCoursesWithSessions, todayInTaipei } from '../lib/courses'
import { SITE_URL, SITE_NAME } from '../lib/site'
import styles from './CoursesPage.module.css'

// 每小時重新產生：過期梯次最慢 1 小時內自動消失
export const revalidate = 3600

const title = '近期課程 | 心光卉'
const description =
  '心光卉的常態課程與年度方案，一門課一個頁面，查看最新開課梯次並線上報名。'

export const metadata = {
  title,
  description,
  alternates: { canonical: '/courses' },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/courses`,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'zh_TW',
  },
  twitter: { card: 'summary_large_image', title, description },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: '近期課程', item: `${SITE_URL}/courses` },
  ],
}

export default async function CoursesPage() {
  const items = await getCoursesWithSessions()
  const currentYear = Number(todayInTaipei().slice(0, 4))

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <Navbar />
      <main className={styles.page}>
        <div className="container">
          <header className={styles.header}>
            <span className="section-label">Courses</span>
            <h1 className={styles.heading}>近期課程</h1>
            <p className={styles.subheading}>
              每一門課都是一段向內的旅程，選一個適合你的時間，我們在那裡相遇。
            </p>
          </header>

          {items.length === 0 ? (
            <p className={styles.empty}>課程資訊整理中，請稍後再來看看。</p>
          ) : (
            <div className={styles.grid}>
              {items.map((item, i) => (
                <CourseCard key={item.course.slug} {...item} currentYear={currentYear} priority={i === 0} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
