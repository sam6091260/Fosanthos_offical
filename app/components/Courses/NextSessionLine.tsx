import type { Course, Session } from '../../types/course'
import { formatFullDate, formatSessionRange } from '../../lib/courseDates'
import styles from './Courses.module.css'

interface Props {
  course: Course
  next: Session | null
  currentYear: number
}

// 「下一梯：10/28（三）– 11/1（日）」／「全年隨時加入・至 2027/5/31」／「新梯次規劃中」
export default function NextSessionLine({ course, next, currentYear }: Props) {
  if (!next) {
    return <p className={styles.nextValue}>新梯次規劃中</p>
  }
  if (course.type === 'annual') {
    return (
      // 「全年隨時加入」與「下一梯：」同樣式（標籤），日期才是粗體重點
      <p className={styles.nextValue}>
        <span className={styles.nextLabel}>
          全年隨時加入<span className={styles.nextSep}>・</span>
        </span>
        至 {formatFullDate(next.endDate)}
      </p>
    )
  }
  return (
    <p className={styles.nextValue}>
      <span className={styles.nextLabel}>下一梯：</span>
      {formatSessionRange(next, currentYear)}
    </p>
  )
}
