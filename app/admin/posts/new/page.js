'use client'

import { useRouter } from 'next/navigation'
import PostEditor from '../../_components/PostEditor/PostEditor'
import styles from './new.module.css'

export default function NewPostPage() {
  const router = useRouter()

  function handleSuccess(status) {
    setTimeout(() => router.push('/admin'), 1500)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>新增文章</h1>
      </div>
      <PostEditor onSuccess={handleSuccess} />
    </div>
  )
}
