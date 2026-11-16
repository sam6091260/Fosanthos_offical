'use client'

import { useEffect } from 'react'

const DEFAULT_MESSAGE = '有修改還沒儲存，確定要離開嗎？離開後修改會不見。'

/**
 * 有未儲存的修改時，離開頁面前先詢問。
 * - 重新整理／關閉分頁／輸入網址：瀏覽器內建的「確定要離開？」
 * - 點後台內的連結（側邊選單、回列表等）：自訂確認訊息
 * 註：瀏覽器「上一頁」在 Next.js App Router 無法攔截。
 *
 * @param {boolean} when    - 目前是否有未儲存的修改
 * @param {string}  message - 點連結時顯示的訊息
 */
export default function useUnsavedChangesWarning(when, message = DEFAULT_MESSAGE) {
  useEffect(() => {
    if (!when) return

    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }

    // capture 階段攔截：比 next/link 的 onClick 更早，取消時連結不會導頁
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = e.target instanceof Element ? e.target.closest('a[href]') : null
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      let url
      try {
        url = new URL(anchor.href, window.location.href)
      } catch {
        return
      }
      // 同一頁的錨點跳轉不算離開
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) return

      if (!window.confirm(message)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onClick, true)
    }
  }, [when, message])
}
