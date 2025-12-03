import { app, BrowserWindow, globalShortcut, dialog } from 'electron';
import path from 'path';

const SAKSHAM_WEB_URL = 'https://sakshamapp-71eec.web.app';
const HOTKEY = 'CommandOrControl+Shift+X';

let mainWindow: BrowserWindow | null = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function announceReady() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Saksham Ready',
            message: 'Saksham is ready. Say a command.',
            buttons: ['OK']
        });
    }
}

function createOrFocusWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
    announceReady();
  } else {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      icon: path.join(__dirname, '../assets/icon.png'),
    });

    mainWindow.loadURL(SAKSHAM_WEB_URL);

    mainWindow.webContents.on('did-finish-load', () => {
      announceReady();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }
}

app.on('ready', () => {
  createOrFocusWindow();

  const ret = globalShortcut.register(HOTKEY, () => {
    createOrFocusWindow();
  });

  if (!ret) {
    console.log('Hotkey registration failed');
    dialog.showErrorBox('Hotkey Error', `Could not register the global hotkey: ${HOTKEY}. It might be in use by another application.`);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createOrFocusWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});