// Faithful recreation of Claudette's GitExplorer for hype reel

import React from "react";
import { GitBranch, GitCommit, Plus, Minus, FileText } from "lucide-react";

interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
}

interface GrepGitExplorerProps {
  branch?: string;
  changes?: FileChange[];
  commitMessage?: string;
}

const STATUS_COLORS: Record<string, string> = {
  added: 'text-green-400',
  modified: 'text-amber-400',
  deleted: 'text-red-400',
  renamed: 'text-blue-400',
};

const STATUS_LABELS: Record<string, string> = {
  added: 'A',
  modified: 'M',
  deleted: 'D',
  renamed: 'R',
};

export function GrepGitExplorer({
  branch = 'main',
  changes = [],
  commitMessage,
}: GrepGitExplorerProps) {
  const totalAdditions = changes.reduce((sum, c) => sum + c.additions, 0);
  const totalDeletions = changes.reduce((sum, c) => sum + c.deletions, 0);

  return (
    <div className="h-full flex flex-col font-mono bg-claude-bg text-sm">
      {/* Branch info */}
      <div className="px-3 py-2 border-b border-claude-border bg-claude-surface/50 flex items-center gap-2">
        <GitBranch size={12} className="text-claude-accent" />
        <span className="text-claude-text font-bold">{branch}</span>
      </div>

      {/* Summary */}
      <div className="px-3 py-2 border-b border-claude-border flex items-center gap-3 text-[10px]">
        <span className="text-claude-text-secondary">
          {changes.length} file{changes.length !== 1 ? 's' : ''} changed
        </span>
        <div className="flex items-center gap-1">
          <Plus size={8} className="text-green-400" />
          <span className="text-green-400 font-bold">{totalAdditions}</span>
        </div>
        <div className="flex items-center gap-1">
          <Minus size={8} className="text-red-400" />
          <span className="text-red-400 font-bold">{totalDeletions}</span>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {changes.map((change, i) => {
          const statusColor = STATUS_COLORS[change.status];
          const statusLabel = STATUS_LABELS[change.status];
          const fileName = change.path.split('/').pop() || change.path;
          const dirPath = change.path.split('/').slice(0, -1).join('/');

          return (
            <div
              key={i}
              className="px-3 py-1.5 flex items-center gap-2 hover:bg-claude-surface/50 transition-colors"
            >
              <span className={`text-[10px] font-bold ${statusColor} w-3 text-center`}>
                {statusLabel}
              </span>
              <FileText size={12} className="text-claude-text-secondary flex-shrink-0" />
              <div className="flex-1 min-w-0 flex items-center gap-1">
                {dirPath && (
                  <span className="text-[10px] text-claude-text-secondary truncate">
                    {dirPath}/
                  </span>
                )}
                <span className="text-xs text-claude-text truncate font-bold">
                  {fileName}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[10px] text-green-400">+{change.additions}</span>
                <span className="text-[10px] text-red-400">-{change.deletions}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Commit area */}
      {commitMessage && (
        <div className="border-t border-claude-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <GitCommit size={12} className="text-claude-accent" />
            <span className="text-[10px] font-bold text-claude-text-secondary uppercase" style={{ letterSpacing: '0.05em' }}>
              COMMIT
            </span>
          </div>
          <div className="text-xs text-claude-text bg-claude-surface/50 border border-claude-border p-2">
            {commitMessage}
          </div>
        </div>
      )}
    </div>
  );
}
