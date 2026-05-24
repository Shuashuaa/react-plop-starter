import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TanstackQueryProvider } from '@/lib/tanstack-query/provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TanstackQueryProvider>
      <App />
    </TanstackQueryProvider>
  </StrictMode>,
)
