// Minimal preload. Kept intentionally small: the renderer is the same web app
// used on the web, so it does not need direct Node access.
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('klearityDesktop', {
  isDesktop: true,
  platform: process.platform,
})
