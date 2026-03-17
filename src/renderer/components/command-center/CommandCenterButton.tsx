import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { useUIStore } from '../../stores/ui.store';

export default function CommandCenterButton() {
  const isActive = useUIStore((s) => s.isCommandCenterActive);
  const toggle = useUIStore((s) => s.toggleCommandCenter);

  return (
    <button
      onClick={toggle}
      className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold transition-colors border-b border-claude-border ${
        isActive
          ? 'bg-claude-accent/20 text-claude-accent'
          : 'text-claude-text-secondary hover:bg-claude-bg hover:text-claude-text'
      }`}
      style={{ letterSpacing: '0.1em', borderRadius: 0 }}
      title="Toggle Command Center (Cmd+Shift+G)"
    >
      <LayoutGrid size={14} />
      <span>COMMAND CENTER</span>
    </button>
  );
}
