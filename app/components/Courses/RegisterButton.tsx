import type { Session } from '../../types/course'
import { SESSION_STATUS_LABELS } from '../../types/course'
import { isRegistrable, registerHref } from '../../lib/courses'
import styles from './Courses.module.css'

type Size = 'sm' | 'md' | 'lg'

interface Props {
  /** null = 沒有未來梯次，按鈕變成「開課通知我」 */
  session: Session | null
  label?: string
  size?: Size
  className?: string
}

const SIZE_CLASS: Record<Size, string> = {
  sm: styles.btnSm,
  md: styles.btnMd,
  lg: styles.btnLg,
}

// 報名按鈕（統一導到首頁聯絡表單 /#contact，正式站即 https://fosanthos.com/#contact）：
// - 開放報名 → 「立即報名」
// - 額滿／截止 → 灰色、不可點
// - 沒有梯次 → 「開課通知我」
export default function RegisterButton({ session, label = '立即報名', size = 'md', className = '' }: Props) {
  const cls = `${styles.btn} ${SIZE_CLASS[size]} ${className}`

  if (!session) {
    return (
      <a href={registerHref()} className={`${cls} ${styles.btnGhost}`}>
        開課通知我
      </a>
    )
  }

  if (!isRegistrable(session)) {
    return (
      <span className={`${cls} ${styles.btnDisabled}`} aria-disabled="true">
        {SESSION_STATUS_LABELS[session.status]}
      </span>
    )
  }

  return (
    <a href={registerHref()} className={`${cls} ${styles.btnPrimary}`}>
      {label}
      <span className={styles.btnArrow} aria-hidden="true">→</span>
    </a>
  )
}
