import type { SessionStatus } from '../../types/course'
import { SESSION_STATUS_LABELS } from '../../types/course'
import styles from './Courses.module.css'

// open → 綠、almost_full → 橘、full / closed → 灰
export default function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span className={styles.statusBadge} data-status={status}>
      {SESSION_STATUS_LABELS[status] ?? status}
    </span>
  )
}
