import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, ExternalLink } from 'lucide-react';
import { useSessionStore } from '../../stores/session.store';

interface RemoteControlPanelProps {
  sessionId: string;
  url: string;
  startedAt: Date;
}

export default function RemoteControlPanel({ sessionId, url, startedAt }: RemoteControlPanelProps) {
  const stopRemoteControl = useSessionStore((s) => s.stopRemoteControl);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
  };

  const handleOpenExternal = () => {
    window.electronAPI?.app.openExternal(url);
  };

  const handleStop = () => {
    stopRemoteControl(sessionId);
  };

  const elapsed = useMemo(() => {
    const diff = Date.now() - new Date(startedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just started';
    return `${mins}m`;
  }, [startedAt]);

  return (
    <div className="border-t border-black bg-white text-black font-mono" style={{ borderRadius: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/20 bg-black/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">REMOTE CONTROL</span>
          <span className="inline-block w-2 h-2 bg-green-500 animate-pulse" style={{ borderRadius: 0 }} />
          <span className="text-[10px] text-black/40">{elapsed}</span>
        </div>
        <button
          onClick={handleStop}
          className="px-2 py-0.5 text-[10px] font-bold uppercase bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30"
          style={{ borderRadius: 0 }}
        >
          STOP
        </button>
      </div>

      {/* Content */}
      <div className="flex items-start gap-4 px-3 py-3">
        {/* QR Code */}
        <div className="shrink-0 border border-black/20 p-1 bg-white">
          <QRCodeSVG value={url} size={96} level="M" />
        </div>

        {/* URL and actions */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-black/40 uppercase font-bold mb-1">Scan QR code or open URL</p>
          <div className="flex items-center gap-1 mb-2">
            <code className="text-xs text-black/70 truncate block flex-1 bg-black/5 px-2 py-1 border border-black/10">
              {url}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase bg-black/5 hover:bg-black/10 border border-black/20"
              style={{ borderRadius: 0 }}
            >
              <Copy size={10} />
              COPY
            </button>
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase bg-black/5 hover:bg-black/10 border border-black/20"
              style={{ borderRadius: 0 }}
            >
              <ExternalLink size={10} />
              OPEN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
