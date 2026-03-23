import React, { useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Copy, Square, Terminal, FileEdit, ChevronDown, ChevronRight } from 'lucide-react';

interface CodexToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  status: string;
  result?: string;
}

interface CodexOverlayProps {
  prompt: string;
  content: string;
  thinking: string;
  toolCalls: CodexToolCall[];
  error: string | null;
  isStreaming: boolean;
  onDismiss: () => void;
  onCancel: () => void;
}

function ToolCallCard({ toolCall }: { toolCall: CodexToolCall }) {
  const [expanded, setExpanded] = React.useState(false);
  const isRunning = toolCall.status === 'running';
  const isFailed = toolCall.status === 'failed';

  const icon = toolCall.name === 'Bash' ? (
    <Terminal size={12} className="text-green-400" />
  ) : (
    <FileEdit size={12} className="text-blue-400" />
  );

  const label = toolCall.name === 'Bash'
    ? (toolCall.input?.command as string || 'command')
    : toolCall.name;

  return (
    <div className={`border ${isFailed ? 'border-red-500/30' : 'border-white/10'} bg-white/5 text-[11px] my-1`} style={{ borderRadius: 0 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-white/5 text-left"
      >
        {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        {icon}
        <span className="truncate flex-1 text-white/70 font-mono">{label}</span>
        {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
        {isFailed && <span className="text-red-400 text-[9px]">FAILED</span>}
      </button>
      {expanded && toolCall.result && (
        <pre className="px-2 py-1 text-[10px] text-white/50 border-t border-white/5 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
          {toolCall.result}
        </pre>
      )}
    </div>
  );
}

export default function CodexOverlay({
  prompt,
  content,
  thinking,
  toolCalls,
  error,
  isStreaming,
  onDismiss,
  onCancel,
}: CodexOverlayProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isStreaming) {
        onCancel();
      } else {
        onDismiss();
      }
    }
  }, [isStreaming, onDismiss, onCancel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="border-t border-white/10 bg-[#1a1a1a] text-white font-mono max-h-80 flex flex-col" style={{ borderRadius: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">/CODEX</span>
          <span className="text-xs text-white/30 truncate max-w-[300px]">{prompt}</span>
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 text-red-400/70 hover:text-red-400 text-[10px]"
              title="Cancel (Esc)"
              style={{ borderRadius: 0 }}
            >
              <Square size={10} />
              <span>Stop</span>
            </button>
          )}
          {content && (
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-white/10 text-white/30 hover:text-white/60"
              title="Copy response"
              style={{ borderRadius: 0 }}
            >
              <Copy size={12} />
            </button>
          )}
          <button
            onClick={isStreaming ? onCancel : onDismiss}
            className="p-1 hover:bg-white/10 text-white/30 hover:text-white/60"
            title="Dismiss (Esc)"
            style={{ borderRadius: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Thinking block (collapsible) */}
      {thinking && (
        <details className="border-b border-white/5">
          <summary className="px-3 py-1 text-[10px] text-white/30 cursor-pointer hover:text-white/50">
            Reasoning...
          </summary>
          <div className="px-3 py-1 text-[10px] text-white/20 max-h-20 overflow-y-auto whitespace-pre-wrap">
            {thinking}
          </div>
        </details>
      )}

      {/* Tool calls */}
      {toolCalls.length > 0 && (
        <div className="px-3 py-1 border-b border-white/5">
          {toolCalls.map((tc) => (
            <ToolCallCard key={tc.id} toolCall={tc} />
          ))}
        </div>
      )}

      {/* Response content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 text-xs leading-relaxed">
        {error ? (
          <div className="text-red-400 text-xs">{error}</div>
        ) : content ? (
          <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px] [&_pre]:bg-white/5 [&_pre]:p-2 [&_pre]:border [&_pre]:border-white/10">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : isStreaming ? (
          <span className="text-white/30">Codex is thinking...</span>
        ) : null}
        {isStreaming && content && (
          <span className="inline-block w-1.5 h-3 bg-emerald-400/60 ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
}
