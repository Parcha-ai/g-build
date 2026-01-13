import React from 'react';
import { Zap, Brain, Sparkles, ArrowRightLeft, Check } from 'lucide-react';
import type { CompactionStatus } from '../../../shared/types';

interface CompactionBarProps {
  status: CompactionStatus;
}

export default function CompactionBar({ status }: CompactionBarProps) {
  if (!status.isCompacting) return null;

  const isSmartCompact = status.smartCompact?.enabled;

  return (
    <div className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: isSmartCompact
            ? 'linear-gradient(90deg, #8B5CF6, #6366F1, #3B82F6, #6366F1, #8B5CF6)'
            : 'linear-gradient(90deg, #6366F1, #8B5CF6, #6366F1)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }}
      />

      {/* Content */}
      <div className="relative px-4 py-2 flex items-center justify-between">
        {/* Left side - status and animation */}
        <div className="flex items-center gap-3">
          {/* Animated icon container */}
          <div className="relative">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              {isSmartCompact ? (
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              ) : (
                <Brain className="w-4 h-4 text-white animate-pulse" />
              )}
            </div>
            {/* Pulsing ring */}
            <div
              className="absolute inset-0 rounded-lg animate-ping"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                animationDuration: '1.5s',
              }}
            />
          </div>

          {/* Text content */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm tracking-wide">
                {isSmartCompact ? 'SMART COMPACT' : 'COMPACTING'}
              </span>
              {isSmartCompact && (
                <span
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Zap className="w-3 h-3 inline mr-0.5" />
                  GREP
                </span>
              )}
            </div>
            <span className="text-white/80 text-xs">
              {isSmartCompact
                ? 'Optimizing context with extended memory'
                : 'Summarizing conversation history...'}
            </span>
          </div>
        </div>

        {/* Right side - model info for Smart Compact */}
        {isSmartCompact && status.smartCompact && (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              {/* Original model */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/60 uppercase tracking-wider">From</span>
                <span className="text-xs text-white font-mono">
                  {status.smartCompact.originalModel.includes('opus') ? 'Opus' : 'Model'}
                </span>
              </div>

              {/* Arrow animation */}
              <div className="relative">
                <ArrowRightLeft className="w-4 h-4 text-white/80" />
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ animation: 'pulse 1s ease-in-out infinite' }}
                >
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>

              {/* Compacting model */}
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-white/60 uppercase tracking-wider">Using</span>
                <span className="text-xs text-white font-mono">Sonnet 1M</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress dots animation */}
        <div className="flex items-center gap-1 ml-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white"
              style={{
                animation: 'bounce 1s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Completion variant shown briefly after compaction
export function CompactionComplete({ tokensSaved }: { tokensSaved?: number }) {
  return (
    <div
      className="px-4 py-2 flex items-center justify-center gap-2"
      style={{
        background: 'linear-gradient(90deg, #10B981, #059669)',
      }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <Check className="w-4 h-4 text-white" />
      </div>
      <span className="text-white font-medium text-sm">
        Context optimized
        {tokensSaved && ` • ${Math.round(tokensSaved / 1000)}K tokens saved`}
      </span>
    </div>
  );
}
