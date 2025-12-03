import { BrowserWindow } from 'electron';

// Using say.js, a cross-platform Text-to-Speech library for Node.js.
// It has native dependencies that `electron-forge` handles via `auto-unpack-natives`.
const say = require('say.js');

const READY_MESSAGE = 'Saksham is ready. Say a command.';

/**
 * Plays a Text-to-Speech message to announce that the application is ready.
 * It ensures the window is focused before speaking.
 * 
 * @param win The BrowserWindow that should be focused.
 */
export function announceReady(win: BrowserWindow) {
  if (!win || win.isDestroyed()) {
    console.log('Cannot announce ready: Window not available.');
    return;
  }

  // Ensure the window is visible and focused to provide context for the user.
  if (win.isMinimized()) win.restore();
  win.focus();

  // Use a short delay to ensure focus has settled before speaking.
  setTimeout(() => {
    say.speak(READY_MESSAGE, null, 1.0, (err: any) => {
      if (err) {
        console.error('Error speaking TTS message:', err);
      }
    });
  }, 100); // 100ms delay
}
