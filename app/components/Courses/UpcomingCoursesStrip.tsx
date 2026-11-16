import Link from 'next/link'
import Image from 'next/image'
import { getCoursesWithSessions } from '../../lib/courses'
import { formatDayWithWeekday, formatFullDate } from '../../lib/courseDates'
import styles from './Courses.module.css'

// 部落格側欄的「近期開課」：最多 3 門有未來梯次的課（Server Component）
export default async function UpcomingCoursesStrip() {
  const items = (await getCoursesWithSessions()).filter((x) => x.next).slice(0, 3)
  if (items.length === 0) return null

  return (
    <section className={styles.strip} aria-labelledby="upcoming-courses-title">
      <div className={styles.stripHeader}>
        <h2 id="upcoming-courses-title" className={styles.stripTitle}>近期開課</h2>
        <Link href="/courses" className={styles.stripAll}>
          查看全部課程<span aria-hidden="true"> →</span>
        </Link>
      </div>

      <ul className={styles.stripList}>
        {items.map(({ course, next }) => (
          <li key={course.slug}>
            <Link href={`/courses/${encodeURIComponent(course.slug)}`} className={styles.miniCard}>
              <span className={styles.miniThumb}>
                {course.coverImage && !course.coverImage.endsWith('.mp4') ? (
                  <Image src={course.coverImage} alt="" fill sizes="96px" />
                ) : (
                  <span className={styles.mediaPlaceholder}>✦</span>
                )}
              </span>
              <span className={styles.miniBody}>
                <span className={styles.miniTitle}>{course.title}</span>
                <span className={styles.miniDate}>
                  {course.type === 'annual'
                    ? `全年隨時加入・至 ${formatFullDate(next!.endDate)}`
                    : `下一梯 ${formatDayWithWeekday(next!.startDate)}`}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
