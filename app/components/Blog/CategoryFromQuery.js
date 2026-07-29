'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { categories } from './blogData'

// 讀取網址上的 ?category=xxx 並套用分類。
//
// 為什麼要獨立成一個元件：useSearchParams() 會讓所在的 Suspense 邊界
// 整段退回 client render，靜態 HTML 只剩 fallback。把它隔離在這個
// 「不輸出畫面」的子元件裡，Blog 本體才能正常 SSR（標題、分類頁籤都進 HTML）。
export default function CategoryFromQuery({ onCategory }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat && categories.some((c) => c.key === cat)) {
      onCategory(cat)
      // Scroll to the blog section if on the same page
      const blogSection = document.getElementById('blog')
      if (blogSection) {
        blogSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [searchParams, onCategory])

  return null
}
