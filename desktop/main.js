const { app, BrowserWindow, protocol, net, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')

// Serve the built web app over a custom "app://" origin instead of file://.
// This keeps React Router (BrowserRouter / history API) working, and gives the
// app a real origin so fetch() calls to the backend behave normally.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
])

// Packaged builds ship the web app under resources/web (see extraResources).
// In development we read straight from frontend/dist.
function webRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'web')
    : path.join(__dirname, '..', 'frontend', 'dist')
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadURL('app://local/index.html')

  // Open outbound links in the user's default browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url)
    return { action: 'deny' }
  })

  return win
}

app.whenReady().then(() => {
  const root = webRoot()

  protocol.handle('app', (request) => {
    let rel = decodeURIComponent(new URL(request.url).pathname)
    if (rel === '/' || rel === '') rel = '/index.html'

    let filePath = path.normalize(path.join(root, rel))

    // Never serve anything outside the bundled web root.
    if (!filePath.startsWith(root)) {
      return new Response('Forbidden', { status: 403 })
    }

    // SPA fallback: unknown routes fall through to index.html.
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(root, 'index.html')
    }

    return net.fetch(pathToFileURL(filePath).toString())
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
