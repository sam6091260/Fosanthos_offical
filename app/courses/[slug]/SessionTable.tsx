import type { Session } from '../../types/course'
import { formatSessionRange } from '../../lib/courseDates'
import RegisterButton from '../../components/Courses/RegisterButton'
import SessionStatusBadge from '../../components/Courses/SessionStatusBadge'
import styles from './CourseDetail.module.css'

interface Props {
  sessions: Session[]
  currentYear: number
  /** 過往梯次：不顯示報名按鈕 */
  past?: boolean
}

// 桌機：表格；手機：CSS 把每一列變成一張小卡（td 用 data-label 顯示欄名）
export default function SessionTable({ sessions, currentYear, past = false }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">日期</th>
            <th scope="col">時間</th>
            <th scope="col">狀態</th>
            {!past && <th scope="col"><span className={styles.srOnly}>報名</span></th>}
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s._id ?? `${s.startDate}-${s.endDate}`}>
              <td data-label="日期" className={styles.cellDate}>
                {formatSessionRange(s, currentYear)}
              </td>
              <td data-label="時間">{s.timeNote || '—'}</td>
              <td data-label="狀態">
                {past ? <SessionStatusBadge status="closed" /> : <SessionStatusBadge status={s.status} />}
              </td>
              {!past && (
                <td className={styles.cellAction}>
                  <RegisterButton session={s} label="報名" size="sm" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
