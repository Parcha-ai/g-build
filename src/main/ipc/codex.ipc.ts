import { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/channels';
import { codexService } from '../services/codex.service';
import { getMainWindow } from '../index';

// Batching helper for smooth text streaming (mirrors claude.ipc.ts pattern)
class CodexChunkBatcher {
  private textBuffer = '';
  private thinkingBuffer = '';
  private textTimer: NodeJS.Timeout | null = null;
  private thinkingTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 100;

  constructor(
    private sessionId: string,
    private sendText: (content: string) => void,
    private sendThinking: (content: string) => void
  ) {}

  addText(content: string) {
    this.textBuffer += content;
    if (!this.textTimer) {
      this.textTimer = setTimeout(() => this.flushText(), this.BATCH_DELAY);
    }
  }

  addThinking(content: string) {
    this.thinkingBuffer += content;
    if (!this.thinkingTimer) {
      this.thinkingTimer = setTimeout(() => this.flushThinking(), this.BATCH_DELAY);
    }
  }

  flushText() {
    if (this.textBuffer) {
      this.sendText(this.textBuffer);
      this.textBuffer = '';
    }
    if (this.textTimer) {
      clearTimeout(this.textTimer);
      this.textTimer = null;
    }
  }

  flushThinking() {
    if (this.thinkingBuffer) {
      this.sendThinking(this.thinkingBuffer);
      this.thinkingBuffer = '';
    }
    if (this.thinkingTimer) {
      clearTimeout(this.thinkingTimer);
      this.thinkingTimer = null;
    }
  }

  flush() {
    this.flushText();
    this.flushThinking();
  }
}

export function registerCodexHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(
    IPC_CHANNELS.CODEX_RUN,
    async (_, sessionId: string, prompt: string) => {
      const mainWindow = getMainWindow();
      if (!mainWindow) return;

      console.log('[Codex IPC] Starting Codex run for session:', sessionId);

      // Determine working directory from session
      const Store = (await import('electron-store')).default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionsStore = new Store({ name: 'claudette-sessions' }) as any;
      const sessionData = sessionsStore.get(sessionId) as { worktreePath?: string; repoPath?: string } | undefined;
      const workingDir = sessionData?.worktreePath || sessionData?.repoPath || process.cwd();

      const batcher = new CodexChunkBatcher(
        sessionId,
        (content) => mainWindow.webContents.send(IPC_CHANNELS.CODEX_STREAM_CHUNK, { sessionId, content }),
        (content) => mainWindow.webContents.send(IPC_CHANNELS.CODEX_THINKING, { sessionId, content })
      );

      try {
        for await (const event of codexService.streamDirect(sessionId, prompt, workingDir)) {
          switch (event.type) {
            case 'text_start':
              // Nothing to send yet, just marks the start
              break;

            case 'text_delta':
              batcher.addText(event.content || '');
              break;

            case 'thinking_start':
            case 'thinking_delta':
              batcher.addThinking(event.content || '');
              break;

            case 'tool_use':
              batcher.flush();
              mainWindow.webContents.send(IPC_CHANNELS.CODEX_TOOL_CALL, {
                sessionId,
                toolCall: event.toolCall,
              });
              break;

            case 'tool_result':
              batcher.flush();
              mainWindow.webContents.send(IPC_CHANNELS.CODEX_TOOL_CALL, {
                sessionId,
                toolCall: event.toolCall,
              });
              break;

            case 'complete':
              batcher.flush();
              mainWindow.webContents.send(IPC_CHANNELS.CODEX_COMPLETE, { sessionId });
              break;

            case 'error':
              batcher.flush();
              mainWindow.webContents.send(IPC_CHANNELS.CODEX_ERROR, {
                sessionId,
                error: event.error,
              });
              break;
          }
        }
      } catch (error) {
        batcher.flush();
        mainWindow.webContents.send(IPC_CHANNELS.CODEX_ERROR, {
          sessionId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.CODEX_CANCEL, async (_, sessionId: string) => {
    console.log('[Codex IPC] Cancelling Codex run for session:', sessionId);
    codexService.cancel(sessionId);
    await new Promise(resolve => setTimeout(resolve, 50));
  });
}
