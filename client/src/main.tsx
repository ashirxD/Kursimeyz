import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// A page that has stayed up for a while was not stale-bundle trouble, so a later
// update may reload again. See pages/error/ErrorPage.tsx.
window.setTimeout(() => {
  try {
    window.sessionStorage.removeItem('kursimeyz-stale-reload')
  } catch {
    // Storage blocked: nothing was set either.
  }
}, 10_000)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
