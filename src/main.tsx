import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// リアルタイム同期は不要という設計方針(遷移/リロード時の再取得で十分)に合わせ、
// react-queryの既定(マウント時/フォーカス復帰時の再取得)をそのまま使う。
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
