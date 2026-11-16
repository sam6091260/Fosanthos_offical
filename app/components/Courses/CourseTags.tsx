import type { Course } from '../../types/course'
import { COURSE_FORMAT_LABELS, COURSE_TYPE_LABELS } from '../../types/course'
import styles from './Courses.module.css'

// 時長／形式（年度方案多一個標籤）
export default function CourseTags({ course }: { course: Course }) {
  const tags = [
    course.duration,
    COURSE_FORMAT_LABELS[course.format],
    course.type === 'annual' ? COURSE_TYPE_LABELS.annual : null,
  ].filter(Boolean)

  if (tags.length === 0) return null
  return (
    <ul className={styles.tags} aria-label="課程資訊">
      {tags.map((t) => (
        <li key={t} className={styles.tag}>{t}</li>
      ))}
    </ul>
  )
}
