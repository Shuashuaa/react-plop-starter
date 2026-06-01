import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import './index.css'
import AppRoot from './App.tsx'
import { TanstackQueryProvider } from '@/lib/tanstack-query/provider'
import { antdTheme } from '@/lib/antd/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={antdTheme}>
      <App className="contents">
        <TanstackQueryProvider>
          <AppRoot />
        </TanstackQueryProvider>
      </App>
    </ConfigProvider>
  </StrictMode>,
)
