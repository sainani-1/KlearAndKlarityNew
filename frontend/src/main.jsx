import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './lib/auth.jsx'
import { SettingsProvider } from './lib/settings.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)

// Register the service worker for installable PWA / offline shell.
// Skipped inside the native (Capacitor) and desktop (Electron) builds.
const isNativeShell =
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.klearityDesktop?.isDesktop === true)

if (import.meta.env.PROD && 'serviceWorker' in navigator && !isNativeShell) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
