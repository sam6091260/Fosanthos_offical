import ViewportProbe from './ViewportProbe'

// 暫時性診斷頁，用來釐清 iOS Safari 底部空白帶的成因。問題解決後請整個資料夾刪除。
export const metadata = {
  title: '視窗診斷',
  robots: { index: false, follow: false },
}

export default function ViewportTestPage() {
  return <ViewportProbe />
}
