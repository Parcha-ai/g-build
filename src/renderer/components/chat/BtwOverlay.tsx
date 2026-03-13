import React, { useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Copy } from 'lucide-react';

interface BtwOverlayProps {
  question: string;
  response: string;
  isStreaming: boolean;
  onDismiss: () => void;
}

export default function BtwOverlay({ question, response, isStreaming, onDismiss }: BtwOverlayProps) {
  // Dismiss on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onDismiss();
    }
  }, [onDismiss]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
  };

  return (
    <div className="border-t border-black bg-white text-black font-mono max-h-64 flex flex-col" style={{ borderRadius: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/20 bg-black/5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">/BTW</span>
          <span className="text-xs text-black/40 truncate max-w-[300px]">{question}</span>
        </div>
        <div className="flex items-center gap-1">
          {response && (
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-black/10 text-black/40 hover:text-black/70"
              title="Copy response"
              style={{ borderRadius: 0 }}
            >
              <Copy size={12} />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-black/10 text-black/40 hover:text-black/70"
            title="Dismiss (Esc)"
            style={{ borderRadius: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Response */}
      <div className="flex-1 overflow-y-auto px-3 py-2 text-xs leading-relaxed">
        {response ? (
          <div className="prose prose-sm prose-neutral max-w-none [&_p]:my-1 [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px] [&_pre]:bg-black/5 [&_pre]:p-2 [&_pre]:border [&_pre]:border-black/10">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        ) : isStreaming ? (
          <span className="text-black/40">Thinking...</span>
        ) : null}
        {isStreaming && response && (
          <span className="inline-block w-1.5 h-3 bg-black/60 ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
}
