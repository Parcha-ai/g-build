// Faithful recreation of Claudette's GStack workflow mode menu

import React from "react";
import { Crown, Cpu, Shield, Rocket, TestTube, Eye, BarChart3, Check } from "lucide-react";

const MODES = [
  { label: 'Planning', modes: [
    { id: 'plan-ceo', name: 'Plan (CEO Review)', shortName: 'CEO', description: 'Founder mode — rethink from first principles', icon: Crown, color: '#f59e0b' },
    { id: 'plan-eng', name: 'Plan (Eng Review)', shortName: 'ENG', description: 'Technical lead — architecture, edge cases', icon: Cpu, color: '#3b82f6' },
  ]},
  { label: 'Development', modes: [
    { id: 'review', name: 'Code Review', shortName: 'REV', description: 'Paranoid staff engineer — find production bugs', icon: Shield, color: '#ef4444' },
    { id: 'ship', name: 'Ship', shortName: 'SHIP', description: 'Release engineer — sync, test, push, PR', icon: Rocket, color: '#22c55e' },
  ]},
  { label: 'Testing', modes: [
    { id: 'qa', name: 'QA Testing', shortName: 'QA', description: 'QA lead — diff-aware testing, health scores', icon: TestTube, color: '#a855f7' },
    { id: 'browse', name: 'Browse & Inspect', shortName: 'BRW', description: 'Visual QA — browser automation, screenshots', icon: Eye, color: '#06b6d4' },
  ]},
  { label: 'Analysis', modes: [
    { id: 'retro', name: 'Retro', shortName: 'RET', description: 'Eng manager — commit analytics, retrospective', icon: BarChart3, color: '#f97316' },
  ]},
];

interface GrepGStackMenuProps {
  activeMode?: string;
}

export function GrepGStackMenu({ activeMode = 'ship' }: GrepGStackMenuProps) {
  return (
    <div
      className="bg-claude-surface border border-claude-border overflow-hidden font-mono"
      style={{ width: 340 }}
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-claude-border flex items-center justify-between">
        <span className="text-[11px] font-bold text-claude-text-secondary uppercase" style={{ letterSpacing: '0.1em' }}>
          GStack Workflow Modes
        </span>
      </div>

      {/* Mode groups */}
      <div className="py-1">
        {MODES.map((group, groupIdx) => (
          <div key={group.label}>
            {groupIdx > 0 && <div className="mx-3 my-1 border-t border-claude-border" />}
            <div className="px-4 py-1.5">
              <span className="text-[10px] font-bold text-claude-text-secondary uppercase" style={{ letterSpacing: '0.12em' }}>
                {group.label}
              </span>
            </div>
            {group.modes.map(mode => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <div
                  key={mode.id}
                  className="px-4 py-2 flex items-center gap-3"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                    borderLeft: isActive ? `2px solid ${mode.color}` : '2px solid transparent',
                  }}
                >
                  <div className="flex-shrink-0" style={{ color: mode.color }}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-claude-text truncate">{mode.name}</div>
                    <div className="text-[10px] text-claude-text-secondary truncate">{mode.description}</div>
                  </div>
                  {isActive && (
                    <Check size={14} className="flex-shrink-0 text-claude-accent" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
