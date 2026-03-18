// Mock terminal display for hype reel - looks like xterm but is static rendered text

import React from "react";
import { Plus, X, Search } from "lucide-react";

interface GrepTerminalProps {
  output?: string;
  compact?: boolean;
  visibleLines?: number; // Animate line-by-line reveal
}

const TERMINAL_THEME = {
  background: '#1a1a1a',
  foreground: '#e4e4e4',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  gray: '#6b7280',
  brightGreen: '#4ade80',
};

// Parse ANSI escape codes to styled spans
function parseAnsi(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\x1b\[(\d+)m/g;
  let lastIndex = 0;
  let currentColor = TERMINAL_THEME.foreground;
  let isBold = false;

  const colorMap: Record<string, string> = {
    '0': TERMINAL_THEME.foreground,  // Reset
    '1': '',                          // Bold (handled separately)
    '32': TERMINAL_THEME.green,
    '90': TERMINAL_THEME.gray,
    '31': TERMINAL_THEME.red,
    '33': TERMINAL_THEME.yellow,
    '34': TERMINAL_THEME.blue,
    '36': TERMINAL_THEME.cyan,
  };

  let match;
  while ((match = regex.exec(text)) !== null) {
    // Add text before escape
    if (match.index > lastIndex) {
      const segment = text.slice(lastIndex, match.index);
      nodes.push(
        <span key={nodes.length} style={{ color: currentColor, fontWeight: isBold ? 700 : 400 }}>
          {segment}
        </span>
      );
    }

    const code = match[1];
    if (code === '0') {
      currentColor = TERMINAL_THEME.foreground;
      isBold = false;
    } else if (code === '1') {
      isBold = true;
    } else if (colorMap[code]) {
      currentColor = colorMap[code];
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(
      <span key={nodes.length} style={{ color: currentColor, fontWeight: isBold ? 700 : 400 }}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return nodes;
}

export function GrepTerminal({ output = '', compact, visibleLines }: GrepTerminalProps) {
  const lines = output.split('\n');
  const displayLines = visibleLines !== undefined ? lines.slice(0, visibleLines) : lines;

  return (
    <div className="flex flex-col h-full font-mono bg-claude-bg">
      {/* Tab bar */}
      {!compact && (
        <div className="h-8 flex items-center border-b border-claude-border bg-claude-surface px-2 gap-1">
          <div className="flex items-center gap-2 px-2 py-1 bg-claude-bg border-t-2 border-t-claude-accent text-xs text-claude-text">
            Terminal 1
          </div>
          <div className="p-0.5 text-claude-text-secondary hover:text-claude-text">
            <Plus size={12} />
          </div>
          <div className="ml-auto p-0.5 text-claude-text-secondary">
            <Search size={12} />
          </div>
        </div>
      )}

      {/* Terminal output */}
      <div
        className="flex-1 p-3 overflow-hidden"
        style={{
          fontFamily: "'JetBrains Mono', 'Menlo', monospace",
          fontSize: 13,
          lineHeight: 1.6,
          backgroundColor: TERMINAL_THEME.background,
        }}
      >
        {displayLines.map((line, i) => (
          <div key={i} className="whitespace-pre">
            {parseAnsi(line)}
          </div>
        ))}
        {/* Cursor */}
        <span className="inline-block w-2 h-4 bg-claude-text animate-pulse" style={{ verticalAlign: 'text-bottom' }} />
      </div>
    </div>
  );
}
