import { IpcMain, IpcMainEvent } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/channels';
import { TerminalService } from '../services/terminal.service';
import { getMainWindow } from '../index';

const terminalService = new TerminalService();

// Batched output buffers per terminal — flush every 16ms (~60fps)
const outputBuffers = new Map<string, string>();
const flushTimers = new Map<string, NodeJS.Timeout>();
const FLUSH_INTERVAL_MS = 16;

function flushOutput(terminalId: string): void {
  const buffer = outputBuffers.get(terminalId);
  if (!buffer) return;

  outputBuffers.delete(terminalId);
  flushTimers.delete(terminalId);

  const mainWindow = getMainWindow();
  if (mainWindow) {
    mainWindow.webContents.send(`${IPC_CHANNELS.TERMINAL_OUTPUT}:${terminalId}`, buffer);
  }
}

export function registerTerminalHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.TERMINAL_CREATE, async (_, sessionId: string) => {
    const terminalId = await terminalService.createTerminal(sessionId);

    // Subscribe to terminal output with batching to prevent IPC flooding
    terminalService.onOutput(terminalId, (data: string) => {
      const existing = outputBuffers.get(terminalId) || '';
      outputBuffers.set(terminalId, existing + data);

      if (!flushTimers.has(terminalId)) {
        flushTimers.set(terminalId, setTimeout(() => flushOutput(terminalId), FLUSH_INTERVAL_MS));
      }
    });

    return terminalId;
  });

  ipcMain.on(IPC_CHANNELS.TERMINAL_INPUT, (_, terminalId: string, data: string) => {
    terminalService.write(terminalId, data);
  });

  ipcMain.on(IPC_CHANNELS.TERMINAL_RESIZE, (_, terminalId: string, cols: number, rows: number) => {
    terminalService.resize(terminalId, cols, rows);
  });

  ipcMain.on(IPC_CHANNELS.TERMINAL_CLOSE, (_, terminalId: string) => {
    // Flush any pending output before closing
    const timer = flushTimers.get(terminalId);
    if (timer) clearTimeout(timer);
    flushOutput(terminalId);

    outputBuffers.delete(terminalId);
    flushTimers.delete(terminalId);
    terminalService.closeTerminal(terminalId);
  });
}
