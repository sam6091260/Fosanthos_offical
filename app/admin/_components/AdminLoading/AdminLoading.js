import styles from './AdminLoading.module.css'

/**
 * 後台載入中骨架（深色主題，形狀貼近實際內容，避免載入完成時版面跳動）
 * @param {'table'|'form'} variant - table：列表頁；form：編輯頁
 * @param {number} rows - table 模式的列數
 * @param {boolean} withHeader - 頁面已自己顯示標題時傳 false
 * @param {boolean} padded - 放在已有內距的頁面裡時傳 false
 */
export default function AdminLoading({ variant = 'table', rows = 6, withHeader = true, padded = true }) {
  return (
    <div className={padded ? styles.wrap : undefined} role="status" aria-live="polite" aria-busy="true">
      <span className={styles.srOnly}>載入中…</span>

      {withHeader && (
        <div className={styles.header} aria-hidden="true">
          <div>
            <div className={`${styles.block} ${styles.title}`} />
            <div className={`${styles.block} ${styles.subtitle}`} />
          </div>
          <div className={`${styles.block} ${styles.button}`} />
        </div>
      )}

      {variant === 'table' ? (
        <div className={styles.table} aria-hidden="true">
          <div className={styles.tableHead} />
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className={styles.row}>
              <div className={`${styles.block} ${styles.thumb}`} />
              <div className={`${styles.block} ${styles.lineLong}`} style={{ width: `${70 - (i % 3) * 12}%` }} />
              <div className={`${styles.block} ${styles.lineShort}`} />
              <div className={`${styles.block} ${styles.lineShort}`} />
            </div>
          ))}
        </div>
      ) : (
        <div aria-hidden="true">
          {[0, 1].map((p) => (
            <div key={p} className={styles.panel}>
              <div className={`${styles.block} ${styles.panelTitle}`} />
              <div className={styles.fieldGrid}>
                {Array.from({ length: p === 0 ? 4 : 2 }, (_, i) => (
                  <div key={i}>
                    <div className={`${styles.block} ${styles.label}`} />
                    <div className={`${styles.block} ${styles.input}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
