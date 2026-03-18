// Faithful recreation of Claudette's Extensions panel for hype reel

import React from "react";
import { Package, Check, Plug, Globe } from "lucide-react";

interface ExtensionItem {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  type: 'sdk' | 'stdio' | 'http';
  toolCount: number;
}

interface GrepExtensionsExplorerProps {
  extensions?: ExtensionItem[];
}

const DEFAULT_EXTENSIONS: ExtensionItem[] = [
  { name: 'Browser Tools', description: 'Stagehand browser automation', status: 'active', type: 'sdk', toolCount: 8 },
  { name: 'Linear', description: 'Issue tracking integration', status: 'active', type: 'stdio', toolCount: 12 },
  { name: 'GitHub', description: 'Repository operations', status: 'active', type: 'http', toolCount: 6 },
  { name: 'Postgres', description: 'Database queries', status: 'inactive', type: 'stdio', toolCount: 4 },
];

export function GrepExtensionsExplorer({ extensions = DEFAULT_EXTENSIONS }: GrepExtensionsExplorerProps) {
  return (
    <div className="h-full flex flex-col font-mono bg-claude-bg text-sm">
      {/* Header */}
      <div className="px-3 py-2 border-b border-claude-border bg-claude-surface/50 flex items-center gap-2">
        <Package size={12} className="text-claude-accent" />
        <span className="text-[10px] font-bold text-claude-text-secondary uppercase" style={{ letterSpacing: '0.1em' }}>
          MCP SERVERS
        </span>
        <span className="text-[10px] text-claude-text-secondary ml-auto">
          {extensions.filter(e => e.status === 'active').length} active
        </span>
      </div>

      {/* Extension list */}
      <div className="flex-1 overflow-y-auto">
        {extensions.map((ext, i) => {
          const isActive = ext.status === 'active';
          const TypeIcon = ext.type === 'http' ? Globe : Plug;

          return (
            <div
              key={i}
              className="px-3 py-2 border-b border-claude-border hover:bg-claude-surface/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isActive ? 'bg-green-500' : 'bg-gray-500'}`} style={{ borderRadius: 0 }} />
                <TypeIcon size={12} className="text-claude-text-secondary" />
                <span className="text-xs font-bold text-claude-text">{ext.name}</span>
                <span className="text-[10px] text-claude-text-secondary ml-auto">
                  {ext.toolCount} tools
                </span>
              </div>
              <div className="mt-1 ml-5 text-[10px] text-claude-text-secondary">
                {ext.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Marketplace link */}
      <div className="px-3 py-2 border-t border-claude-border">
        <div className="text-[10px] text-claude-accent font-bold uppercase" style={{ letterSpacing: '0.05em' }}>
          + BROWSE MARKETPLACE
        </div>
      </div>
    </div>
  );
}
