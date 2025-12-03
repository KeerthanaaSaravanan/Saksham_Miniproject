
import { app, BrowserWindow, globalShortcut, dialog } from 'electron';
import path from 'path';

// This is the URL of your deployed Next.js application.
// Electron will load this URL in the desktop window.
const SAKSHAM_WEB_URL = 'https://sakshamapp-71eec.web.app';

// The global hotkey to bring the app into focus.
// CommandOrControl+Shift+X is a reliable cross-platform choice.
const HOTKEY = 'CommandOrControl+Shift+X';

let mainWindow: BrowserWindow | null = null;

// Enforce a single instance of the application.
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // If another instance is already running, quit this new one.
  app.quit();
} else {
  // If this is the first instance, listen for any second instances.
  app.on('second-instance', () => {
    if (mainWindow) {
      // If a second instance is started, focus our existing window.
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/**
 * Creates the main browser window, or focuses it if it already exists.
 */
function createOrFocusWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    // If window already exists, restore and focus it.
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  } else {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        // Preload script for secure communication between main and renderer.
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      // It's good practice to set an icon.
      // Ensure you have an 'icon.png' in an 'assets' directory.
      icon: path.join(__dirname, '../assets/icon.png'),
    });

    // Load the remote URL of your web application.
    mainWindow.loadURL(SAKSHAM_WEB_URL);

    // Clean up the mainWindow reference when the window is closed.
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }
}

// This method will be called when Electron has finished initialization.
app.on('ready', () => {
  createOrFocusWindow();

  // Register the global shortcut.
  const ret = globalShortcut.register(HOTKEY, () => {
    // When the hotkey is pressed, bring the window to the front.
    createOrFocusWindow();
  });

  if (!ret) {
    console.log('Hotkey registration failed');
    dialog.showErrorBox('Hotkey Error', `Could not register the global hotkey: ${HOTKEY}. It might be in use by another application.`);
  }
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create a window when the dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createOrFocusWindow();
  }
});

// Unregister all shortcuts when the application is about to quit.
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
