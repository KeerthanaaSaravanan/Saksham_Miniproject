
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Preload scripts run in a privileged environment with access to Node.js APIs.
// However, they should be used sparingly, primarily to expose safe, limited
// functionality from the main process to the renderer process (the web app).

// For this launcher, we do not need to expose any functionality to the remote
// web app, so this file is kept minimal for security.
console.log('Saksham preload script loaded.');
