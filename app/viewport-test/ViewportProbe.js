'use client'
import { useEffect, useState } from 'react'

// 診斷用元件（暫時）。不使用專案的任何樣式，避免受既有 CSS 影響。
export default function ViewportProbe() {
  const [m, setM] = useState(null)

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.body)
      const hs = getComputedStyle(document.documentElement)
      const probe = document.getElementById('safe-probe')
      const ps = probe ? getComputedStyle(probe) : null
      setM({
        innerHeight: window.innerHeight,
        clientHeight: document.documentElement.clientHeight,
        visualH: window.visualViewport ? Math.round(window.visualViewport.height) : '不支援',
        screenH: window.screen.height,
        dpr: window.devicePixelRatio,
        scrollY: Math.round(window.scrollY),
        docH: document.documentElement.scrollHeight,
        bodyOverflow: `${cs.overflowX} / ${cs.overflowY}`,
        htmlOverflow: `${hs.overflowX} / ${hs.overflowY}`,
        safeTop: ps ? ps.paddingTop : '?',
        safeBottom: ps ? ps.paddingBottom : '?',
        svh: getComputedStyle(document.getElementById('unit-svh')).height,
        lvh: getComputedStyle(document.getElementById('unit-lvh')).height,
        dvh: getComputedStyle(document.getElementById('unit-dvh')).height,
      })
    }
    read()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    window.visualViewport?.addEventListener('resize', read)
    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
      window.visualViewport?.removeEventListener('resize', read)
    }
  }, [])

  const row = (k, v) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0' }}>
      <span style={{ opacity: 0.7 }}>{k}</span>
      <b style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</b>
    </div>
  )

  return (
    <div style={{ font: '13px/1.5 ui-monospace, monospace', background: '#111', color: '#eee' }}>
      {/* 量測 svh / lvh / dvh 用的隱形元素 */}
      <div id="unit-svh" style={{ height: '100svh', position: 'absolute', visibility: 'hidden' }} />
      <div id="unit-lvh" style={{ height: '100lvh', position: 'absolute', visibility: 'hidden' }} />
      <div id="unit-dvh" style={{ height: '100dvh', position: 'absolute', visibility: 'hidden' }} />
      <div id="safe-probe" style={{
        position: 'absolute', visibility: 'hidden',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }} />

      {/* 固定在版面視窗底部的紅線 —— 標示「頁面認為的底部」在哪 */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, height: 4,
        background: 'red', zIndex: 99999,
      }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, height: 26,
        background: 'rgba(255,0,0,.35)', color: '#fff', textAlign: 'center',
        fontSize: 11, lineHeight: '26px', zIndex: 99998,
      }}>
        ↑ 紅線 = position:fixed bottom:0 的位置
      </div>

      <div style={{ padding: '20px 16px 8px' }}>
        <h1 style={{ fontSize: 16, margin: '0 0 4px' }}>視窗診斷</h1>
        <p style={{ opacity: 0.6, margin: '0 0 14px', fontSize: 11 }}>
          請<b>向下捲到最底</b>，等工具列縮成膠囊後截圖給我
        </p>
        {m ? (
          <div style={{ background: '#1e1e1e', padding: 12, borderRadius: 8 }}>
            {row('window.innerHeight', m.innerHeight)}
            {row('documentElement.clientHeight', m.clientHeight)}
            {row('visualViewport.height', m.visualH)}
            {row('screen.height', m.screenH)}
            {row('devicePixelRatio', m.dpr)}
            <hr style={{ border: 0, borderTop: '1px solid #333', margin: '8px 0' }} />
            {row('100svh', m.svh)}
            {row('100lvh', m.lvh)}
            {row('100dvh', m.dvh)}
            <hr style={{ border: 0, borderTop: '1px solid #333', margin: '8px 0' }} />
            {row('safe-area-inset-top', m.safeTop)}
            {row('safe-area-inset-bottom', m.safeBottom)}
            <hr style={{ border: 0, borderTop: '1px solid #333', margin: '8px 0' }} />
            {row('body overflow x/y', m.bodyOverflow)}
            {row('html overflow x/y', m.htmlOverflow)}
            {row('scrollY', m.scrollY)}
            {row('文件總高', m.docH)}
          </div>
        ) : '量測中…'}
      </div>

      {/* 一段長內容，確保可以捲動讓工具列收合 */}
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} style={{
          height: 90, margin: '8px 16px', borderRadius: 6,
          background: `hsl(${i * 26} 60% 30%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          區塊 {i + 1}
        </div>
      ))}

      {/* 文件的最後一塊：亮綠色。若它能鋪到螢幕實體底部 = 內容有延伸到工具列底下 */}
      <div style={{
        height: 220, background: 'lime', color: '#000', fontWeight: 700,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        paddingBottom: 4,
      }}>
        文件最底部（綠色）— 這塊有沒有碰到螢幕實體最下緣？
      </div>
    </div>
  )
}
