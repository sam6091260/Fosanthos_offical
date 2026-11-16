import Link from 'next/link'
import Image from 'next/image'
import type { CourseWithSessions } from '../../lib/courses'
import { formatSessionShort } from '../../lib/courseDates'
import CourseTags from './CourseTags'
import NextSessionLine from './NextSessionLine'
import RegisterButton from './RegisterButton'
import SessionStatusBadge from './SessionStatusBadge'
import styles from './Courses.module.css'

interface Props extends CourseWithSessions {
  currentYear: number
  /** 第一張卡的圖優先載入（LCP） */
  priority?: boolean
}

// /courses 列表卡：一門課一張
export default function CourseCard({ course, upcoming, next, currentYear, priority = false }: Props) {
  const href = `/courses/${encodeURIComponent(course.slug)}`
  // 年度方案只有一筆全年梯次，不列「其他梯次」
  const others = course.type === 'annual' ? [] : upcoming.slice(1, 3)

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.cardMedia} tabIndex={-1} aria-hidden="true">
        {course.coverImage && !course.coverImage.endsWith('.mp4') ? (
          <Image
            src={course.coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 300px"
            priority={priority}
          />
        ) : (
          <span className={styles.mediaPlaceholder}>✦</span>
        )}
      </Link>

      <div className={styles.cardBody}>
        <CourseTags course={course} />
        <h2 className={styles.cardTitle}>
          <Link href={href}>{course.title}</Link>
        </h2>
        {course.subtitle && <p className={styles.cardSubtitle}>{course.subtitle}</p>}

        <div className={styles.nextBox}>
          <div className={styles.nextInfo}>
            <NextSessionLine course={course} next={next} currentYear={currentYear} />
            {next && next.status !== 'open' && <SessionStatusBadge status={next.status} />}
            {next?.timeNote && course.type !== 'annual' && (
              <p className={styles.nextNote}>{next.timeNote}</p>
            )}
          </div>
          <RegisterButton session={next} />
        </div>

        {others.length > 0 && (
          <p className={styles.otherSessions}>
            其他梯次：{others.map((s) => formatSessionShort(s)).join('、')}
          </p>
        )}

        <Link href={href} className={styles.moreLink}>
          課程介紹<span aria-hidden="true"> →</span>
        </Link>
      </div>
    </article>
  )
}
