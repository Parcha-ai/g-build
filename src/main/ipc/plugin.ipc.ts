/**
 * Plugin IPC Handlers - Handle plugin marketplace operations from renderer
 */

import { type IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/channels';
import { pluginService } from '../services/plugin.service';
import type { PluginMarketplace, InstalledPlugin, MarketplacePlugin } from '../../shared/types';

export function registerPluginHandlers(ipcMain: IpcMain): void {
  // Get list of popular marketplaces for discovery
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_GET_POPULAR_MARKETPLACES,
    async () => {
      try {
        console.log('[Plugin IPC] Getting popular marketplaces');
        return pluginService.getPopularMarketplaces();
      } catch (error) {
        console.error('[Plugin IPC] Error getting popular marketplaces:', error);
        throw error;
      }
    }
  );

  // Get list of configured marketplaces
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_GET_MARKETPLACES,
    async (): Promise<PluginMarketplace[]> => {
      try {
        console.log('[Plugin IPC] Getting marketplaces');
        return await pluginService.getMarketplaces();
      } catch (error) {
        console.error('[Plugin IPC] Error getting marketplaces:', error);
        throw error;
      }
    }
  );

  // Get list of installed plugins
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_GET_INSTALLED,
    async (): Promise<InstalledPlugin[]> => {
      try {
        console.log('[Plugin IPC] Getting installed plugins');
        return await pluginService.getInstalledPlugins();
      } catch (error) {
        console.error('[Plugin IPC] Error getting installed plugins:', error);
        throw error;
      }
    }
  );

  // Get available plugins from all marketplaces
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_GET_AVAILABLE,
    async (): Promise<MarketplacePlugin[]> => {
      try {
        console.log('[Plugin IPC] Getting available plugins');
        return await pluginService.getAvailablePlugins();
      } catch (error) {
        console.error('[Plugin IPC] Error getting available plugins:', error);
        throw error;
      }
    }
  );

  // Install a plugin
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_INSTALL,
    async (
      _event,
      pluginId: string,
      marketplace: string,
      options?: { scope?: 'user' | 'project' }
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        console.log('[Plugin IPC] Installing plugin:', pluginId, '@', marketplace);
        return await pluginService.installPlugin(pluginId, marketplace, options);
      } catch (error) {
        console.error('[Plugin IPC] Error installing plugin:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Uninstall a plugin
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_UNINSTALL,
    async (
      _event,
      pluginId: string,
      marketplace: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        console.log('[Plugin IPC] Uninstalling plugin:', pluginId, '@', marketplace);
        return await pluginService.uninstallPlugin(pluginId, marketplace);
      } catch (error) {
        console.error('[Plugin IPC] Error uninstalling plugin:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Enable a plugin
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_ENABLE,
    async (
      _event,
      pluginId: string,
      marketplace: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        console.log('[Plugin IPC] Enabling plugin:', pluginId, '@', marketplace);
        return await pluginService.enablePlugin(pluginId, marketplace);
      } catch (error) {
        console.error('[Plugin IPC] Error enabling plugin:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Disable a plugin
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_DISABLE,
    async (
      _event,
      pluginId: string,
      marketplace: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        console.log('[Plugin IPC] Disabling plugin:', pluginId, '@', marketplace);
        return await pluginService.disablePlugin(pluginId, marketplace);
      } catch (error) {
        console.error('[Plugin IPC] Error disabling plugin:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Add a marketplace
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_ADD_MARKETPLACE,
    async (_event, source: string): Promise<{ success: boolean; error?: string }> => {
      try {
        console.log('[Plugin IPC] Adding marketplace:', source);
        return await pluginService.addMarketplace(source);
      } catch (error) {
        console.error('[Plugin IPC] Error adding marketplace:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Remove a marketplace
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_REMOVE_MARKETPLACE,
    async (_event, name: string): Promise<{ success: boolean; error?: string }> => {
      try {
        console.log('[Plugin IPC] Removing marketplace:', name);
        return await pluginService.removeMarketplace(name);
      } catch (error) {
        console.error('[Plugin IPC] Error removing marketplace:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Update marketplaces
  ipcMain.handle(
    IPC_CHANNELS.PLUGIN_UPDATE_MARKETPLACE,
    async (_event, name?: string): Promise<{ success: boolean; error?: string }> => {
      try {
        console.log('[Plugin IPC] Updating marketplaces:', name || 'all');
        return await pluginService.updateMarketplaces(name);
      } catch (error) {
        console.error('[Plugin IPC] Error updating marketplaces:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}
