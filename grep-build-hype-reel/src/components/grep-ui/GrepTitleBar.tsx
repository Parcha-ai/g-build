// Faithful recreation of Claudette's title bar for hype reel
// Uses exact same Tailwind classes from App.tsx

import React from "react";
import {
  Terminal,
  Globe,
  PanelLeftClose,
  PanelRight,
  Settings,
  Package,
  FileCode,
  ClipboardList,
  GitBranch,
} from "lucide-react";

interface GrepTitleBarProps {
  isSidebarOpen?: boolean;
  isTerminalOpen?: boolean;
  isBrowserOpen?: boolean;
  isExtensionsOpen?: boolean;
  isPlanOpen?: boolean;
  isEditorOpen?: boolean;
  isGitOpen?: boolean;
  clockTime?: string;
}

export function GrepTitleBar({
  isSidebarOpen = true,
  isTerminalOpen = false,
  isBrowserOpen = false,
  isExtensionsOpen = false,
  isPlanOpen = false,
  isEditorOpen = false,
  isGitOpen = false,
  clockTime = '14:30:00',
}: GrepTitleBarProps) {
  return (
    <div className="h-8 bg-claude-surface border-b border-claude-border flex items-center justify-between">
      {/* Left: sidebar toggle + spacer for traffic lights */}
      <div className="flex items-center h-full">
        <div className="pl-20 pr-2 flex items-center">
          <div className={`p-1 transition-colors ${isSidebarOpen ? 'text-claude-text' : 'text-claude-text-secondary'}`}>
            <PanelLeftClose size={14} />
          </div>
        </div>
      </div>

      {/* Center: Clock */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
        <div className="flex items-center gap-2 font-mono text-base text-white transition-colors">
          <span className="font-bold tabular-nums" style={{ letterSpacing: '0.05em' }}>
            {clockTime}
          </span>
        </div>
      </div>

      {/* Right: panel toggle buttons */}
      <div className="flex items-center gap-0.5 px-2">
        <div className={`p-1 ${isTerminalOpen ? 'text-claude-text' : 'text-claude-text-secondary'}`}>
          <Terminal size={14} />
        </div>
        <div className={`p-1 ${isBrowserOpen ? 'text-claude-text' : 'text-claude-text-secondary'}`}>
          <Globe size={14} />
        </div>
        <div className={`p-1 ${isExtensionsOpen ? 'text-claude-text' : 'text-claude-text-secondary'}`}>
          <Package size={14} />
        </div>
        <div className={`p-1 ${isPlanOpen ? 'text-claude-text' : 'text-claude-text-secondary'}`}>
          <ClipboardList size={14} />
        </div>
        <div className={`p-1 ${isEditorOpen ? 'text-claude-text' : 'text-claude-text-secondary'}`}>
          <FileCode size={14} />
        </div>
        <div className={`p-1 ${isGitOpen ? 'text-claude-text' : 'text-claude-text-secondary'}`}>
          <GitBranch size={14} />
        </div>
        <div className="p-1 text-claude-text-secondary">
          <PanelRight size={14} />
        </div>
        <div className="p-1 text-claude-text-secondary">
          <span className="text-xs font-bold font-mono leading-none" style={{ fontSize: '13px' }}>G</span>
        </div>
        <div className="p-1 text-claude-text-secondary">
          <Settings size={14} />
        </div>
      </div>
    </div>
  );
}
