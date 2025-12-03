import { app, BrowserWindow, globalShortcut, dialog } from 'electron';
import path from 'path';
import { announceReady } from './voice';

// This app is a launcher and wrapper for the Saksham web application.
// All Firebase logic (Auth, Firestore, etc.) resides within the web app.
// This Electron app does NOT handle Firebase connections directly.
const SAKSHAM_WEB_URL = 'https://sakshamapp-71eec.web.app';

// Global reference to the main window to prevent garbage collection.
let mainWindow: BrowserWindow | null = null;

// --- Single Instance Lock ---
// Ensures only one instance of the application can run at a time.
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // If this is a second instance, quit it immediately.
  app.quit();
} else {
  // If this is the primary instance, focus the existing window when a second instance is launched.
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      // Announce readiness again when the user tries to open a new instance
      announceReady(mainWindow);
    }
  });
}

// --- Triple-CTRL Hotkey Logic ---
// We use `iohook` for a reliable global listener, as `globalShortcut` is for chords.
// NOTE: `iohook` has native dependencies that Electron Forge handles automatically.
let ctrlPressCount = 0;
let ctrlPressTimer: NodeJS.Timeout | null = null;
const CTRL_KEYCODE = 29; // Keycode for Left Control (standard)
const CTRL_MACOS_KEYCODE = 59; // Keycode for Left Control on macOS

function handleTripleCtrl() {
  createOrFocusWindow();
}

try {
  const iohook = require('iohook');

  iohook.on('keydown', (event: { keycode: number }) => {
    // Check for both Windows/Linux and macOS Control key keycodes.
    if (event.keycode === CTRL_KEYCODE || event.keycode === CTRL_MACOS_KEYCODE) {
      // If a timer is already running, clear it.
      if (ctrlPressTimer) {
        clearTimeout(ctrlPressTimer);
      }

      ctrlPressCount++;

      if (ctrlPressCount === 3) {
        // Triple press detected.
        handleTripleCtrl();
        ctrlPressCount = 0; // Reset counter
        ctrlPressTimer = null;
      } else {
        // Start a timer. If it expires, reset the counter.
        ctrlPressTimer = setTimeout(() => {
          ctrlPressCount = 0;
          ctrlPressTimer = null;
        }, 500); // 500ms window for triple press
      }
    } else {
        // If any other key is pressed, reset the counter.
        ctrlPressCount = 0;
        if(ctrlPressTimer) {
            clearTimeout(ctrlPressTimer);
            ctrlPressTimer = null;
        }
    }
  });
  
  // Register and start `iohook`
  iohook.start();
  console.log('iohook listening for global hotkey (Triple CTRL)...');

} catch (error) {
  console.error("Failed to load 'iohook'. Global hotkey will not work.", error);
  dialog.showErrorBox('Hotkey Error', 'Could not initialize the global hotkey listener. Please ensure all dependencies are installed correctly.');
}


/**
 * Creates a new BrowserWindow or focuses the existing one.
 */
function createOrFocusWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    // If the window exists, restore and focus it.
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
    // Announce readiness since the user explicitly summoned the window.
    announceReady(mainWindow);
  } else {
    // Create a new window if one doesn't exist.
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        // Security-first: do not enable nodeIntegration in the renderer process
        // that loads remote content.
        nodeIntegration: false,
        contextIsolation: true,
      },
      icon: path.join(__dirname, '../assets/icon.png'),
    });

    // Load the remote Saksham web application.
    mainWindow.loadURL(SAKSHAM_WEB_URL);

    // --- Window Event Handlers ---
    // When the window is ready, announce it.
    mainWindow.webContents.on('did-finish-load', () => {
      if (mainWindow) {
        announceReady(mainWindow);
      }
    });

    // Clean up the mainWindow reference when the window is closed.
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }
}

// --- Electron App Lifecycle Events ---
app.on('ready', () => {
  // Initial window creation can be suppressed if you only want hotkey activation.
  // We will create it on first launch for a better user experience.
  createOrFocusWindow();
});

app.on('window-all-closed', () => {
  // On macOS, it's common for applications to stay active until the user quits explicitly.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createOrFocusWindow();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts when the application is about to quit.
  globalShortcut.unregisterAll();
  try {
    const iohook = require('iohook');
    iohook.stop();
  } catch(e) {
    // ignore if it was never started
  }
});
