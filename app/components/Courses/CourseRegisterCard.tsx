import Link from 'next/link'
import Image from 'next/image'
import type { Course, Session } from '../../types/course'
import { todayInTaipei } from '../../lib/courses'
import NextSessionLine from './NextSessionLine'
import RegisterButton from './RegisterButton'
import styles from './Courses.module.css'

interface Props {
  course: Course
  next: Session | null
}

// 文章末端的課程報名卡（文章有填 relatedCourse 時顯示）
export default function CourseRegisterCard({ course, next }: Props) {
  const href = `/courses/${encodeURIComponent(course.slug)}`
  const currentYear = Number(todayInTaipei().slice(0, 4))

  return (
    <aside className={styles.registerCard} aria-label="相關課程">
      {course.coverImage && !course.coverImage.endsWith('.mp4') && (
        <Link href={href} className={styles.registerThumb} tabIndex={-1} aria-hidden="true">
          <Image src={course.coverImage} alt="" fill sizes="(max-width: 768px) 100vw, 220px" />
        </Link>
      )}
      <div className={styles.registerBody}>
        <span className={styles.registerEyebrow}>本文相關課程</span>
        <p className={styles.registerTitle}>
          <Link href={href}>{course.title}</Link>
        </p>
        {course.subtitle && <p className={styles.cardSubtitle}>{course.subtitle}</p>}
        <NextSessionLine course={course} next={next} currentYear={currentYear} />
        <div className={styles.registerActions}>
          <RegisterButton session={next} size="sm" />
          <Link href={href} className={styles.moreLink}>
            課程介紹<span aria-hidden="true"> →</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
