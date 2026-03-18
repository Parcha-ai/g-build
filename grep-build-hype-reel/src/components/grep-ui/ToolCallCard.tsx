// Faithful recreation of Claudette's ToolCallCard for hype reel
// Shows tool calls (Read, Write, Bash, Edit) with realistic output

import React, { useState } from "react";
import {
  FileText,
  Terminal,
  Pencil,
  ChevronDown,
  ChevronRight,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { MockToolCall } from "../../mocks/mockData";

interface ToolCallCardProps {
  toolCall: MockToolCall;
  isStreaming?: boolean;
  defaultCollapsed?: boolean;
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  Read: <FileText size={12} />,
  Write: <FileText size={12} />,
  Edit: <Pencil size={12} />,
  Bash: <Terminal size={12} />,
  Grep: <Terminal size={12} />,
  Glob: <FileText size={12} />,
};

const TOOL_COLORS: Record<string, string> = {
  Read: 'text-cyan-400',
  Write: 'text-green-400',
  Edit: 'text-amber-400',
  Bash: 'text-purple-400',
  Grep: 'text-blue-400',
  Glob: 'text-blue-400',
};

function getToolSummary(toolCall: MockToolCall): string {
  const { name, input } = toolCall;
  switch (name) {
    case 'Read':
      return (input.file_path as string) || 'file';
    case 'Write':
      return (input.file_path as string) || 'file';
    case 'Edit':
      return (input.file_path as string) || 'file';
    case 'Bash':
      return (input.command as string)?.slice(0, 60) || 'command';
    case 'Grep':
      return (input.pattern as string) || 'pattern';
    default:
      return name;
  }
}

export function ToolCallCard({ toolCall, isStreaming, defaultCollapsed }: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const icon = TOOL_ICONS[toolCall.name] || <Terminal size={12} />;
  const colorClass = TOOL_COLORS[toolCall.name] || 'text-claude-text-secondary';
  const summary = getToolSummary(toolCall);

  const statusIcon = toolCall.status === 'completed' ? (
    <Check size={10} className="text-green-400" />
  ) : toolCall.status === 'running' ? (
    <Loader2 size={10} className="text-claude-accent animate-spin" />
  ) : toolCall.status === 'error' ? (
    <AlertTriangle size={10} className="text-red-400" />
  ) : null;

  return (
    <div className="border border-claude-border bg-claude-bg" style={{ borderRadius: 0 }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-claude-surface/50 transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown size={10} className="text-claude-text-secondary flex-shrink-0" />
        ) : (
          <ChevronRight size={10} className="text-claude-text-secondary flex-shrink-0" />
        )}
        <span className={colorClass}>{icon}</span>
        <span className={`text-[11px] font-bold uppercase ${colorClass}`} style={{ letterSpacing: '0.05em' }}>
          {toolCall.name}
        </span>
        <span className="text-[10px] text-claude-text-secondary truncate flex-1">
          {summary}
        </span>
        {statusIcon}
      </button>

      {/* Expanded content */}
      {isExpanded && toolCall.result && (
        <div className="border-t border-claude-border">
          <pre className="p-3 text-[11px] text-claude-text-secondary font-mono whitespace-pre-wrap break-words overflow-hidden max-h-48">
            {typeof toolCall.result === 'string' ? toolCall.result : JSON.stringify(toolCall.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
