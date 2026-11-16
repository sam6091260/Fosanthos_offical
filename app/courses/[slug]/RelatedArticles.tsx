import Link from 'next/link'
import Image from 'next/image'
import { getRelatedPosts } from '../../lib/courses'
import styles from './CourseDetail.module.css'

// 相關心得文章：部落格中 relatedCourse = 此課程的文章（沒有就不顯示）
export default async function RelatedArticles({ courseSlug }: { courseSlug: string }) {
  const posts = await getRelatedPosts(courseSlug, 3)
  if (posts.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="related-articles-title">
      <h2 id="related-articles-title" className={styles.sectionTitle}>相關心得文章</h2>
      <ul className={styles.relatedGrid}>
        {posts.map((p) => {
          const thumb = p.image && !p.image.endsWith('.mp4') ? p.image : null
          return (
            <li key={p.id}>
              <Link href={`/blog/${encodeURIComponent(p.id)}`} className={styles.relatedCard}>
                <span className={styles.relatedThumb}>
                  {thumb ? (
                    <Image src={thumb} alt="" fill sizes="(max-width: 768px) 100vw, 360px" />
                  ) : (
                    <span aria-hidden="true">✦</span>
                  )}
                </span>
                <span className={styles.relatedBody}>
                  {p.date && <span className={styles.relatedDate}>{p.date}</span>}
                  <span className={styles.relatedTitle}>{p.title}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
