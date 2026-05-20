'use client'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import styles from './Article.module.css'

export default function MarkdownContent({ content }) {
  return (
    <div className={styles.content}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          // 自訂 Markdown 渲染元件
          h1: ({ children }) => <h1 className={styles.mdH1}>{children}</h1>,
          h2: ({ children }) => <h2 className={styles.mdH2}>{children}</h2>,
          h3: ({ children }) => <h3 className={styles.mdH3}>{children}</h3>,
          p: ({ children }) => <p>{children}</p>,
          strong: ({ children }) => <strong className={styles.mdBold}>{children}</strong>,
          em: ({ children }) => <em className={styles.mdItalic}>{children}</em>,
          blockquote: ({ children }) => <blockquote className={styles.mdBlockquote}>{children}</blockquote>,
          ul: ({ children }) => <ul className={styles.mdList}>{children}</ul>,
          ol: ({ children }) => <ol className={styles.mdList}>{children}</ol>,
          li: ({ children }) => <li className={styles.mdListItem}>{children}</li>,
          hr: () => <hr className={styles.mdHr} />,
          img: ({ src, alt }) => {
            const SIZE_KEYS = ['small', 'medium', 'large']
            const isSize = SIZE_KEYS.includes(alt)
            const sizeClass = isSize ? styles[`mdImage_${alt}`] : ''
            const caption = isSize ? null : alt
            return (
              <span className={styles.mdImageWrapper}>
                <img
                  src={src}
                  alt={caption || ''}
                  className={`${styles.mdImage} ${sizeClass}`}
                />
                {caption && <span className={styles.mdImageCaption}>{caption}</span>}
              </span>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
