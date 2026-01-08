import { type IpcMain } from 'electron';
import { extensionService } from '../services/extension.service';
import { IPC_CHANNELS } from '../../shared/constants/channels';

export function registerExtensionHandlers(ipcMain: IpcMain): void {
  // Scan for slash commands
  ipcMain.handle(IPC_CHANNELS.EXTENSION_SCAN_COMMANDS, async (_event, projectPath?: string) => {
    try {
      const commands = await extensionService.scanCommands(projectPath);
      return commands;
    } catch (error) {
      console.error('[Extension IPC] Error scanning commands:', error);
      throw error;
    }
  });

  // Scan for skills
  ipcMain.handle(IPC_CHANNELS.EXTENSION_SCAN_SKILLS, async (_event, projectPath?: string) => {
    try {
      const skills = await extensionService.scanSkills(projectPath);
      return skills;
    } catch (error) {
      console.error('[Extension IPC] Error scanning skills:', error);
      throw error;
    }
  });

  // Scan for agents
  ipcMain.handle(IPC_CHANNELS.EXTENSION_SCAN_AGENTS, async (_event, projectPath?: string) => {
    try {
      const agents = await extensionService.scanAgents(projectPath);
      return agents;
    } catch (error) {
      console.error('[Extension IPC] Error scanning agents:', error);
      throw error;
    }
  });

  // Get command content
  ipcMain.handle(IPC_CHANNELS.EXTENSION_GET_COMMAND, async (_event, commandName: string, projectPath?: string) => {
    try {
      const content = await extensionService.getCommandContent(commandName, projectPath);
      return content;
    } catch (error) {
      console.error('[Extension IPC] Error getting command content:', error);
      throw error;
    }
  });
}
