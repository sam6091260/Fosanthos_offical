'use client'
import { useEffect, useState } from 'react'

// 診斷用元件（暫時）。設計成「一張截圖就能定案」：
//  - 數據面板固定在畫面正中央，捲到哪都看得到
//  - 文件最底部是洋紅色，若 Safari 有取樣頁面色去染工具列，那條會變洋紅
//  - 紅線標示 position:fixed bottom:0，藍線標示扣掉 safe-area 後的位置
export default function ViewportProbe() {
  const [m, setM] = useState(null)

  useEffect(() => {
    const read = () => {
      const g = (id) => getComputedStyle(document.getElementById(id))
      setM({
        safeBottom: g('probe').paddingBottom,
        safeTop: g('probe').paddingTop,
        innerH: window.innerHeight,
        clientH: document.documentElement.clientHeight,
        visualH: window.visualViewport ? Math.round(window.visualViewport.height) : '—',
        screenH: window.screen.height,
        dpr: window.devicePixelRatio,
        svh: g('u-svh').height,
        lvh: g('u-lvh').height,
        dvh: g('u-dvh').height,
        vh: g('u-vh').height,
        vpMeta: document.querySelector('meta[name=viewport]')?.content || '（無）',
        theme: document.querySelector('meta[name=theme-color]')?.content || '（無）',
      })
    }
    read()
    const evts = ['scroll', 'resize', 'orientationchange']
    evts.forEach((e) => window.addEventListener(e, read, { passive: true }))
    window.visualViewport?.addEventListener('resize', read)
    window.visualViewport?.addEventListener('scroll', read)
    return () => {
      evts.forEach((e) => window.removeEventListener(e, read))
      window.visualViewport?.removeEventListener('resize', read)
      window.visualViewport?.removeEventListener('scroll', read)
    }
  }, [])

  const R = (k, v, hot) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '2px 0' }}>
      <span style={{ opacity: 0.65 }}>{k}</span>
      <b style={{ color: hot ? '#ff4d4d' : '#fff', fontVariantNumeric: 'tabular-nums' }}>{v}</b>
    </div>
  )

  const hidden = { position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }

  return (
    <div style={{ font: '12px/1.45 ui-monospace, monospace', background: '#111', color: '#eee' }}>
      <div id="u-vh" style={{ ...hidden, height: '100vh' }} />
      <div id="u-svh" style={{ ...hidden, height: '100svh' }} />
      <div id="u-lvh" style={{ ...hidden, height: '100lvh' }} />
      <div id="u-dvh" style={{ ...hidden, height: '100dvh' }} />
      <div id="probe" style={{
        ...hidden,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }} />

      {/* 固定在畫面正中央的數據面板 —— 捲到任何位置截圖都看得到 */}
      <div style={{
        position: 'fixed', top: '50%', left: 8, right: 8, transform: 'translateY(-50%)',
        background: 'rgba(0,0,0,.9)', border: '1px solid #444', borderRadius: 10,
        padding: '10px 12px', zIndex: 99997,
      }}>
        {m ? (
          <>
            {R('safe-area-inset-bottom', m.safeBottom, m.safeBottom === '0px')}
            {R('safe-area-inset-top', m.safeTop)}
            <hr style={{ border: 0, borderTop: '1px solid #333', margin: '5px 0' }} />
            {R('innerHeight', m.innerH)}
            {R('clientHeight', m.clientH)}
            {R('visualViewport', m.visualH)}
            {R('screen.height (CSS px)', Math.round(m.screenH))}
            <hr style={{ border: 0, borderTop: '1px solid #333', margin: '5px 0' }} />
            {R('100vh', m.vh)}
            {R('100svh', m.svh)}
            {R('100lvh', m.lvh)}
            {R('100dvh', m.dvh)}
            <hr style={{ border: 0, borderTop: '1px solid #333', margin: '5px 0' }} />
            <div style={{ opacity: 0.65, fontSize: 10, wordBreak: 'break-all' }}>{m.vpMeta}</div>
            <div style={{ opacity: 0.65, fontSize: 10 }}>theme-color: {m.theme}</div>
          </>
        ) : '量測中…'}
      </div>

      {/* 紅線：position:fixed bottom:0 —— 頁面認為的底部 */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, height: 3, background: '#f00', zIndex: 99999 }} />
      {/* 藍線：扣掉 safe-area-inset-bottom 之後的位置 */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 'env(safe-area-inset-bottom, 0px)',
        height: 3, background: '#00b0ff', zIndex: 99999,
      }} />

      <div style={{ padding: '16px 14px 6px' }}>
        <b style={{ fontSize: 14 }}>視窗診斷 v2</b>
        <p style={{ opacity: 0.6, margin: '4px 0 0', fontSize: 11 }}>
          請<b>捲到最底</b>再截圖。紅線＝頁面底部，藍線＝扣掉安全區的位置。<br />
          兩條線若重合 → 安全區為 0（cover 未生效）。
        </p>
      </div>

      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          height: 80, margin: '6px 14px', borderRadius: 6,
          background: `hsl(${i * 30} 55% 28%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{i + 1}</div>
      ))}

      {/* 文件最底 300px：洋紅。若 Safari 取樣頁面色染工具列，那條會變洋紅 */}
      <div style={{
        height: 300, background: 'magenta', color: '#000', fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6,
      }}>
        ↓ 洋紅有沒有延伸到螢幕最底？
      </div>
    </div>
  )
}
