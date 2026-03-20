import React, { useState, useEffect, useRef } from 'react';
import { Brain, Loader2, ChevronRight, ChevronDown, Zap } from 'lucide-react';
import type { CompactionStatus } from '../../../shared/types';

interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
  isCompacting?: boolean;
  compactionStatus?: (CompactionStatus & { startTime?: number; postTokens?: number }) | null;
  gstackColor?: string; // GStack mode accent color (e.g. '#f59e0b' for CEO)
  gstackLabel?: string; // GStack mode short name (e.g. 'CEO')
}

export default function ThinkingBlock({ content, isStreaming, isCompacting, compactionStatus, gstackColor, gstackLabel }: ThinkingBlockProps) {
  // Start collapsed by default - user can expand if they want to see full thinking
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedRef = useRef<HTMLDivElement>(null);
  const [elapsedTime, setElapsedTime] = useState('');

  // Update elapsed time for compaction
  useEffect(() => {
    if (!compactionStatus?.startTime) {
      setElapsedTime('');
      return;
    }

    const updateTime = () => {
      const elapsed = Date.now() - (compactionStatus.startTime || 0);
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      if (minutes > 0) {
        setElapsedTime(`${minutes}m ${remainingSeconds}s`);
      } else {
        setElapsedTime(`${seconds}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [compactionStatus?.startTime]);

  // Auto-scroll expanded view to bottom when new content arrives
  useEffect(() => {
    if (isExpanded && expandedRef.current) {
      expandedRef.current.scrollTop = expandedRef.current.scrollHeight;
    }
  }, [content, isExpanded]);

  // Format compaction status line like Claude Code
  const compactionStatusLine = (() => {
    if (!compactionStatus) return '';

    const parts: string[] = [];

    // Add elapsed time
    if (elapsedTime) {
      parts.push(elapsedTime);
    }

    // Add token reduction if available
    if (compactionStatus.preTokens && compactionStatus.postTokens) {
      const reduction = compactionStatus.preTokens - compactionStatus.postTokens;
      parts.push(`↓ ${reduction.toLocaleString()} tokens`);
    } else if (compactionStatus.preTokens && compactionStatus.isCompacting) {
      // Show pre-token count while compacting
      parts.push(`${compactionStatus.preTokens.toLocaleString()} tokens`);
    }

    return parts.length > 0 ? `(${parts.join(' • ')})` : '';
  })();

  // Get last 2-3 lines for collapsed preview (shows latest updates)
  const previewLines = (() => {
    if (isCompacting) {
      return `Compacting conversation... ${compactionStatusLine}`;
    }
    if (!content) return 'Processing...';
    const lines = content.split('\n').filter(l => l.trim());
    const lastLines = lines.slice(-3); // Last 3 lines
    return lastLines.join('\n');
  })();

  // Colors change based on compacting state and GStack mode
  const hasGStack = !isCompacting && gstackColor;
  const accentColor = isCompacting ? 'text-blue-400' : hasGStack ? '' : 'text-purple-400';
  const accentStyle = hasGStack ? { color: gstackColor } : undefined;
  const dotColor = isCompacting ? 'bg-blue-500' : hasGStack ? '' : 'bg-purple-500';
  const dotStyle = hasGStack ? { backgroundColor: gstackColor } : undefined;
  const borderColor = isCompacting ? 'border-blue-500/30' : hasGStack ? '' : 'border-purple-500/30';
  const borderStyle = hasGStack ? { borderLeftColor: `${gstackColor}4D` } : undefined; // 4D = 30% opacity
  const label = isCompacting ? 'Compacting' : hasGStack ? `[${gstackLabel}] Thinking` : 'Thinking';
  const Icon = isCompacting ? Zap : Brain;

  return (
    <div className="font-mono text-sm">
      {/* Header row - clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 py-0.5 hover:bg-claude-surface/50 transition-colors text-left"
      >
        {/* Expand/collapse chevron */}
        {isExpanded ? (
          <ChevronDown size={12} className={`${accentColor} flex-shrink-0`} style={accentStyle} />
        ) : (
          <ChevronRight size={12} className={`${accentColor} flex-shrink-0`} style={accentStyle} />
        )}

        {/* Status dot */}
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor} ${isStreaming || isCompacting ? 'animate-pulse' : ''}`}
          style={dotStyle}
        />

        {/* Icon and label */}
        <Icon size={14} className={`${accentColor} flex-shrink-0`} style={accentStyle} />
        <span className={`font-semibold ${accentColor}`} style={accentStyle}>{label}</span>

        {/* Loading spinner for active thinking/compacting */}
        {(isStreaming || isCompacting) && (
          <Loader2 size={12} className={`${accentColor} animate-spin flex-shrink-0`} style={accentStyle} />
        )}
      </button>

      {/* Preview (collapsed) - shows last 2-3 lines streaming in */}
      {!isExpanded && (content || isCompacting) && (
        <div className={`ml-6 mt-1 p-2 bg-claude-surface/30 border-l-2 ${borderColor}`} style={borderStyle}>
          <pre className="whitespace-pre-wrap text-xs text-claude-text-secondary/80 leading-relaxed overflow-hidden">
            {previewLines}
          </pre>
        </div>
      )}

      {/* Expanded content - fixed height with scroll, won't push input down */}
      {isExpanded && (content || isCompacting) && (
        <div
          ref={expandedRef}
          className={`ml-6 mt-1 p-2 bg-claude-surface/30 border-l-2 ${borderColor} max-h-64 overflow-y-auto scroll-smooth`}
          style={borderStyle}
        >
          <pre className="whitespace-pre-wrap text-sm text-claude-text-secondary leading-relaxed overflow-x-auto">
            {isCompacting
              ? `Compacting conversation... ${compactionStatusLine}\n\nSummarizing conversation context to optimize token usage...`
              : content
            }
          </pre>
        </div>
      )}
    </div>
  );
}
