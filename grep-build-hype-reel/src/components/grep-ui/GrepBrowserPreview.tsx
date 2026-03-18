// Faithful recreation of Claudette's BrowserPreview chrome for hype reel
// Shows the URL bar, navigation buttons, and simulated page content

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  ExternalLink,
  Target,
} from "lucide-react";

interface GrepBrowserPreviewProps {
  url?: string;
  isInspectorActive?: boolean;
  children?: React.ReactNode; // Page content
}

export function GrepBrowserPreview({
  url = 'http://localhost:3000',
  isInspectorActive = false,
  children,
}: GrepBrowserPreviewProps) {
  return (
    <div className="flex flex-col h-full bg-claude-bg">
      {/* Navigation bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-claude-border bg-claude-surface">
        {/* Nav buttons */}
        <div className="flex items-center gap-1">
          <div className="p-1 text-claude-text-secondary">
            <ArrowLeft size={14} />
          </div>
          <div className="p-1 text-claude-text-secondary">
            <ArrowRight size={14} />
          </div>
          <div className="p-1 text-claude-text-secondary">
            <RotateCw size={14} />
          </div>
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center px-3 py-1.5 bg-claude-bg border border-claude-border text-xs font-mono text-claude-text-secondary" style={{ borderRadius: 0 }}>
          {url}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <div className={`p-1 ${isInspectorActive ? 'text-claude-accent' : 'text-claude-text-secondary'}`}>
            <Target size={14} />
          </div>
          <div className="p-1 text-claude-text-secondary">
            <ExternalLink size={14} />
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-hidden bg-white">
        {children || (
          // Default simulated page
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-14 bg-gray-900 flex items-center px-6">
              <div className="w-24 h-4 bg-white/20 rounded" />
              <div className="ml-auto flex gap-4">
                <div className="w-12 h-3 bg-white/15 rounded" />
                <div className="w-12 h-3 bg-white/15 rounded" />
                <div className="w-12 h-3 bg-white/15 rounded" />
              </div>
            </div>

            {/* Hero */}
            <div className="flex-1 bg-gradient-to-b from-gray-50 to-white p-8 flex flex-col items-center justify-center gap-4">
              <div className="w-64 h-6 bg-gray-200 rounded" />
              <div className="w-48 h-4 bg-gray-100 rounded" />
              <div className="flex gap-3 mt-4">
                <div className="w-24 h-8 bg-blue-500/20 border border-blue-500/30 rounded" />
                <div className="w-24 h-8 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Cards */}
            <div className="p-6 flex gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-1 h-24 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="w-12 h-3 bg-gray-300 rounded mb-2" />
                  <div className="w-full h-2 bg-gray-200 rounded mb-1" />
                  <div className="w-3/4 h-2 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
