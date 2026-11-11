import styles from './SanctumFlag.module.css'

export default function SanctumFlag() {
  return (
    <a
      href="https://light.fosanthos.com/"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.flag}
      aria-label="進入聖房（另開新視窗）"
    >
      <span className={styles.text}>進入聖房</span>
    </a>
  )
}
