import React, { useEffect, useRef } from 'react';
import { Crown, Cpu, Shield, Rocket, TestTube, Eye, BarChart3, X, Check, type LucideIcon } from 'lucide-react';
import type { GStackMode } from '../../../shared/types';

// Icon mapping for each mode
const ICON_MAP: Record<string, LucideIcon> = {
  Crown,
  Cpu,
  Shield,
  Rocket,
  TestTube,
  Eye,
  BarChart3,
};

interface GStackModeInfo {
  id: GStackMode;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
}

interface GStackMenuProps {
  activeMode: GStackMode | null;
  modes: GStackModeInfo[];
  onSelectMode: (mode: GStackMode | null) => void;
  onClose: () => void;
}

// Group modes by phase
const PHASE_GROUPS = [
  { label: 'Planning', modes: ['plan-ceo', 'plan-eng'] },
  { label: 'Development', modes: ['review', 'ship'] },
  { label: 'Testing', modes: ['qa', 'browse'] },
  { label: 'Analysis', modes: ['retro'] },
];

export default function GStackMenu({ activeMode, modes, onSelectMode, onClose }: GStackMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getModeById = (id: string) => modes.find((m) => m.id === id);

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-0 mt-1 w-72 bg-claude-surface border border-claude-border rounded-lg shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-claude-border flex items-center justify-between">
        <span className="text-xs font-semibold text-claude-text-secondary uppercase tracking-wide">
          GStack Workflow Modes
        </span>
      </div>

      {/* Mode groups */}
      <div className="py-1 max-h-[400px] overflow-y-auto">
        {PHASE_GROUPS.map((group, groupIdx) => (
          <div key={group.label}>
            {groupIdx > 0 && <div className="mx-3 my-1 border-t border-claude-border" />}
            <div className="px-3 py-1">
              <span className="text-[10px] font-semibold text-claude-text-secondary uppercase tracking-wider">
                {group.label}
              </span>
            </div>
            {group.modes.map((modeId) => {
              const mode = getModeById(modeId);
              if (!mode) return null;
              const isActive = activeMode === mode.id;
              const IconComponent = ICON_MAP[mode.icon];

              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    onSelectMode(isActive ? null : mode.id);
                    onClose();
                  }}
                  className={`w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-white/5 transition-colors text-left ${
                    isActive ? 'bg-white/5' : ''
                  }`}
                  style={isActive ? { borderLeft: `2px solid ${mode.color}`, paddingLeft: '10px' } : {}}
                >
                  {/* Icon */}
                  <div
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded"
                    style={{ color: mode.color }}
                  >
                    {IconComponent && <IconComponent size={14} />}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-claude-text truncate">{mode.name}</div>
                    <div className="text-[10px] text-claude-text-secondary truncate">{mode.description}</div>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <Check size={14} className="flex-shrink-0 text-claude-accent" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Clear mode option */}
        {activeMode && (
          <>
            <div className="mx-3 my-1 border-t border-claude-border" />
            <button
              onClick={() => {
                onSelectMode(null);
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-claude-text-secondary">
                <X size={14} />
              </div>
              <div className="text-sm text-claude-text-secondary">Clear Mode</div>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
