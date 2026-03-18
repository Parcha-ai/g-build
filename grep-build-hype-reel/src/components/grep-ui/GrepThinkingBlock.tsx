// Faithful recreation of Claudette's ThinkingBlock for hype reel
// Uses exact same Tailwind classes and structure from ThinkingBlock.tsx

import React from "react";
import { Brain, Loader2, ChevronRight, ChevronDown } from "lucide-react";

interface GrepThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
  isExpanded?: boolean;
  visibleChars?: number; // For typewriter effect
}

export function GrepThinkingBlock({
  content,
  isStreaming = true,
  isExpanded = false,
  visibleChars,
}: GrepThinkingBlockProps) {
  const displayContent = visibleChars !== undefined
    ? content.slice(0, visibleChars)
    : content;

  // Get last 3 lines for collapsed preview
  const previewLines = (() => {
    if (!displayContent) return 'Processing...';
    const lines = displayContent.split('\n').filter(l => l.trim());
    return lines.slice(-3).join('\n');
  })();

  return (
    <div className="font-mono text-sm">
      {/* Header row */}
      <div className="w-full flex items-center gap-2 py-0.5 hover:bg-claude-surface/50 transition-colors text-left cursor-pointer">
        {isExpanded ? (
          <ChevronDown size={12} className="text-purple-400 flex-shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-purple-400 flex-shrink-0" />
        )}

        {/* Status dot */}
        <span className={`w-2 h-2 rounded-full flex-shrink-0 bg-purple-500 ${isStreaming ? 'animate-pulse' : ''}`} />

        {/* Icon and label */}
        <Brain size={14} className="text-purple-400 flex-shrink-0" />
        <span className="font-semibold text-purple-400">Thinking</span>

        {/* Spinner */}
        {isStreaming && (
          <Loader2 size={12} className="text-purple-400 animate-spin flex-shrink-0" />
        )}
      </div>

      {/* Preview (collapsed) */}
      {!isExpanded && displayContent && (
        <div className="ml-6 mt-1 p-2 bg-claude-surface/30 border-l-2 border-purple-500/30">
          <pre className="whitespace-pre-wrap text-xs text-claude-text-secondary/80 leading-relaxed overflow-hidden">
            {previewLines}
          </pre>
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && displayContent && (
        <div className="ml-6 mt-1 p-2 bg-claude-surface/30 border-l-2 border-purple-500/30 max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-claude-text-secondary leading-relaxed overflow-x-auto">
            {displayContent}
          </pre>
        </div>
      )}
    </div>
  );
}
