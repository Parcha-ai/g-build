import React from 'react';
import { Zap, Check } from 'lucide-react';
import type { CompactionStatus } from '../../../shared/types';

interface CompactionBarProps {
  status: CompactionStatus;
}

export default function CompactionBar({ status }: CompactionBarProps) {
  if (!status.isCompacting) return null;

  const isSmartCompact = status.smartCompact?.enabled;

  return (
    <div className="h-1 w-full bg-claude-border/30 overflow-hidden">
      <div
        className="h-full"
        style={{
          background: isSmartCompact
            ? 'linear-gradient(90deg, #8B5CF6, #6366F1, #3B82F6, #6366F1, #8B5CF6)'
            : 'linear-gradient(90deg, #6366F1, #8B5CF6, #6366F1)',
          backgroundSize: '200% 100%',
          animation: 'compactShimmer 1.5s linear infinite',
        }}
      />
      <style>{`
        @keyframes compactShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// Completion variant shown briefly after compaction
export function CompactionComplete({ tokensSaved }: { tokensSaved?: number }) {
  return (
    <div className="h-1 w-full bg-green-500/80" />
  );
}
