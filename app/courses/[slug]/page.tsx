import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop'
import JsonLd from '../../components/JsonLd'
import MarkdownContent from '../../blog/[id]/MarkdownContent'
import Gallery from '../../blog/[id]/Gallery'
import CourseTags from '../../components/Courses/CourseTags'
import NextSessionLine from '../../components/Courses/NextSessionLine'
import RegisterButton from '../../components/Courses/RegisterButton'
import {
  filterPastSessions,
  filterUpcomingSessions,
  getAllCourses,
  getCourseBySlug,
  getSessions,
  isRegistrable,
  todayInTaipei,
} from '../../lib/courses'
import { formatMonthDay } from '../../lib/courseDates'
import type { Course, Session } from '../../types/course'
import { SITE_URL, SITE_NAME, absoluteUrl } from '../../lib/site'
import SessionTable from './SessionTable'
import RelatedArticles from './RelatedArticles'
import styles from './CourseDetail.module.css'

// 每小時重新產生：過期梯次最慢 1 小時內自動移到「過往梯次」
export const revalidate = 3600

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const courses = await getAllCourses()
  return courses.map((c) => ({ slug: c.slug }))
}

function ogImageOf(course: Course): string {
  return course.coverImage && !course.coverImage.endsWith('.mp4') ? course.coverImage : '/logo_square.png'
}

export async function generateMetadata({ params }: PageProps) {
  const course = await getCourseBySlug(params.slug)
  if (!course) {
    return { title: '課程未找到 | 心光卉', robots: { index: false, follow: true } }
  }
  const title = `${course.title} | 心光卉`
  const description = course.subtitle || course.title
  const image = ogImageOf(course)
  return {
    title,
    description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      title: course.title,
      description,
      url: `${SITE_URL}/courses/${course.slug}`,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: course.title }],
      type: 'website',
      locale: 'zh_TW',
    },
    twitter: { card: 'summary_large_image', title: course.title, description, images: [image] },
  }
}

// 主要 CTA 的文字（cta = 第一個還能報名的梯次；下一梯額滿時會是更後面的梯次）
function ctaLabel(course: Course, next: Session | null, cta: Session | null): string {
  if (!next) return '開課通知我'
  if (course.type === 'annual') return '立即加入'
  if (cta && cta !== next) return `報名 ${formatMonthDay(cta.startDate)} 梯次`
  return `報名下一梯（${formatMonthDay(next.startDate)}）`
}

function buildBreadcrumbSchema(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '近期課程', item: `${SITE_URL}/courses` },
      { '@type': 'ListItem', position: 3, name: course.title, item: `${SITE_URL}/courses/${course.slug}` },
    ],
  }
}

function buildCourseSchema(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.subtitle || course.title,
    image: absoluteUrl(ogImageOf(course)),
    inLanguage: 'zh-TW',
    provider: { '@type': 'Organization', name: SITE_NAME, sameAs: SITE_URL },
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const [course, sessions] = await Promise.all([getCourseBySlug(params.slug), getSessions(params.slug)])
  if (!course) notFound()

  const today = todayInTaipei()
  const currentYear = Number(today.slice(0, 4))
  const upcoming = filterUpcomingSessions(sessions, today)
  const past = filterPastSessions(sessions, today)
  const next = upcoming[0] ?? null
  // 下一梯額滿／截止時，CTA 改指向下一個還能報名的梯次
  const cta = upcoming.find((s) => isRegistrable(s)) ?? null
  const showSticky = !!cta

  return (
    <>
      <JsonLd data={[buildCourseSchema(course), buildBreadcrumbSchema(course)]} />
      <Navbar />
      <main className={styles.page}>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroMedia}>
              {course.coverImage && !course.coverImage.endsWith('.mp4') ? (
                <Image
                  src={course.coverImage}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  priority
                />
              ) : (
                <span className={styles.heroPlaceholder} aria-hidden="true">✦</span>
              )}
            </div>
            <div className={styles.heroText}>
              <Link href="/courses" className={styles.backLink}>← 全部課程</Link>
              <CourseTags course={course} />
              <h1 className={styles.title}>{course.title}</h1>
              {course.subtitle && <p className={styles.subtitle}>{course.subtitle}</p>}
              <div className={styles.heroNext}>
                <NextSessionLine course={course} next={next} currentYear={currentYear} />
                {next?.timeNote && <p className={styles.heroNote}>{next.timeNote}</p>}
              </div>
              <div className={styles.heroCta}>
                <RegisterButton session={cta ?? next} label={ctaLabel(course, next, cta)} size="lg" />
              </div>
              {course.teacher && (
                <dl className={styles.facts}>
                  <div><dt>授課老師</dt><dd>{course.teacher}</dd></div>
                </dl>
              )}
            </div>
          </div>
        </section>

        <div className={`container ${styles.body}`}>
          {/* ── 課程內容 ── */}
          {course.description && (
            <section className={styles.section} aria-labelledby="course-content-title">
              <h2 id="course-content-title" className={styles.sectionTitle}>課程內容</h2>
              <MarkdownContent content={course.description} />
            </section>
          )}

          {/* ── 圖片集（海報、介紹影片等；沿用文章頁的圖片集與燈箱） ── */}
          {course.gallery && course.gallery.length > 0 && (
            <section className={styles.section} aria-label="課程圖片">
              <Gallery images={course.gallery} title={course.title} />
            </section>
          )}

          {/* ── 開課梯次 ── */}
          <section className={styles.section} aria-labelledby="course-sessions-title" id="sessions">
            <h2 id="course-sessions-title" className={styles.sectionTitle}>開課梯次</h2>
            {upcoming.length > 0 ? (
              <SessionTable sessions={upcoming} currentYear={currentYear} />
            ) : (
              <div className={styles.noSession}>
                <p>新梯次規劃中，留下聯絡方式，開課時第一時間通知你。</p>
                <RegisterButton session={null} />
              </div>
            )}

            {past.length > 0 && (
              <details className={styles.pastToggle}>
                <summary>顯示過往梯次（{past.length}）</summary>
                <SessionTable sessions={past} currentYear={currentYear} past />
              </details>
            )}
          </section>

          {/* ── 相關心得文章 ── */}
          <RelatedArticles courseSlug={course.slug} />

          <Link href="/courses" className={styles.backBottom}>
            <span aria-hidden="true">←</span> 回到全部課程
          </Link>
        </div>
      </main>

      {/* 手機：底部固定報名條（只有可報名時顯示） */}
      {cta && (
        <div className={styles.stickyCta}>
          <div className={styles.stickyInfo}>
            <span className={styles.stickyTitle}>{course.title}</span>
          </div>
          <RegisterButton
            session={cta}
            label={course.type === 'annual' ? '立即加入' : `報名 ${formatMonthDay(cta.startDate)} 梯次`}
            size="sm"
          />
        </div>
      )}

      <Footer />
      {showSticky && <div className={styles.stickySpacer} aria-hidden="true" />}
      <div className={showSticky ? styles.sttOffset : undefined}>
        <ScrollToTop />
      </div>
    </>
  )
}
