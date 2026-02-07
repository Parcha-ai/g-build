import React, { useState, useEffect } from 'react';
import { X, Download, Check, Loader2, AlertCircle, Folder } from 'lucide-react';
import type { Session } from '../../../shared/types';

interface DownloadSessionDialogProps {
  session: Session;
  onClose: () => void;
  onSuccess: (newSessionId: string) => void;
}

export default function DownloadSessionDialog({ session, onClose, onSuccess }: DownloadSessionDialogProps) {
  const [localRepoPath, setLocalRepoPath] = useState('');
  const [sessionName, setSessionName] = useState(`${session.name} (Local)`);
  const [branch, setBranch] = useState(session.branch || '');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for progress updates
    const unsubscribe = window.electronAPI.ssh.onDownloadProgress((message) => {
      setProgressMessage(message);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSelectFolder = async () => {
    const result = await window.electronAPI.dev.openLocalRepo();
    if (!result.canceled && result.repoPath) {
      setLocalRepoPath(result.repoPath);
      // If the selected folder has a different branch, update the default
      if (result.branch) {
        setBranch(result.branch);
      }
    }
  };

  const handleDownload = async () => {
    if (!localRepoPath || !sessionName.trim()) {
      return;
    }

    setStatus('downloading');
    setError(null);
    setProgressMessage('Initializing download...');

    try {
      const result = await window.electronAPI.ssh.downloadSession(session.id, {
        localRepoPath,
        sessionName: sessionName.trim(),
        branch: branch || undefined,
      });

      if (result.success && result.newSessionId) {
        setStatus('success');
        // Give user a moment to see success message
        setTimeout(() => {
          onSuccess(result.newSessionId!);
        }, 1000);
      } else {
        setStatus('error');
        setError(result.error || 'Download failed');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const isValid = localRepoPath && sessionName.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-claude-surface border border-claude-border w-full max-w-md max-h-[90vh] flex flex-col" style={{ borderRadius: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-claude-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-cyan-400" />
            <span className="font-mono text-sm font-bold">DOWNLOAD TO LOCAL</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-claude-bg transition-colors"
            style={{ borderRadius: 0 }}
            disabled={status === 'downloading'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {status === 'idle' && (
            <div className="space-y-4">
              <p className="text-xs text-claude-text-secondary" style={{ letterSpacing: '0.05em' }}>
                Download this SSH session to your local machine
              </p>

              {/* Local Repository Path */}
              <div>
                <label
                  className="block text-[10px] font-bold mb-1.5 text-claude-text-secondary"
                  style={{ letterSpacing: '0.1em' }}
                >
                  LOCAL REPOSITORY PATH
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localRepoPath}
                    readOnly
                    placeholder="Select local repository folder..."
                    className="flex-1 px-3 py-2 text-sm font-mono focus:outline-none bg-claude-bg border border-claude-border text-claude-text cursor-pointer"
                    style={{ borderRadius: 0 }}
                    onClick={handleSelectFolder}
                  />
                  <button
                    onClick={handleSelectFolder}
                    className="px-4 py-2 text-[10px] font-bold bg-claude-bg hover:bg-claude-surface border border-claude-border text-claude-text flex items-center gap-1.5"
                    style={{ borderRadius: 0 }}
                  >
                    <Folder size={12} />
                    BROWSE
                  </button>
                </div>
                <p className="text-[9px] text-claude-text-secondary mt-1">
                  Select the local git repository to download session files to
                </p>
              </div>

              {/* Session Name */}
              <div>
                <label
                  className="block text-[10px] font-bold mb-1.5 text-claude-text-secondary"
                  style={{ letterSpacing: '0.1em' }}
                >
                  SESSION NAME
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="My Project (Local)"
                  className="w-full px-3 py-2 text-sm font-mono focus:outline-none focus:border-claude-accent bg-claude-bg border border-claude-border text-claude-text"
                  style={{ borderRadius: 0 }}
                  autoFocus
                />
                <p className="text-[9px] text-claude-text-secondary mt-1">
                  Name for the new local session
                </p>
              </div>

              {/* Branch (Optional) */}
              <div>
                <label
                  className="block text-[10px] font-bold mb-1.5 text-claude-text-secondary"
                  style={{ letterSpacing: '0.1em' }}
                >
                  BRANCH (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2 text-sm font-mono focus:outline-none focus:border-claude-accent bg-claude-bg border border-claude-border text-claude-text"
                  style={{ borderRadius: 0 }}
                />
                <p className="text-[9px] text-claude-text-secondary mt-1">
                  Git branch to checkout after download
                </p>
              </div>

              {/* Info box */}
              <div className="p-3 bg-cyan-400/10 border border-cyan-400/30">
                <p className="text-[10px] text-claude-text-secondary leading-relaxed">
                  <Download size={12} className="inline mr-1 text-cyan-400" />
                  The session's git state and conversation history will be downloaded to your local repository
                </p>
              </div>
            </div>
          )}

          {status === 'downloading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-cyan-400 mb-4" />
              <span className="text-sm font-mono text-cyan-400">{progressMessage || 'Downloading...'}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Check size={32} className="text-green-400 mb-4" />
              <span className="text-sm font-mono text-green-400">Download complete!</span>
              <span className="text-xs text-claude-text-secondary mt-2">Switching to local session...</span>
            </div>
          )}

          {status === 'error' && error && (
            <div className="py-8">
              <div className="text-red-400 text-sm bg-red-400/10 p-4 border border-red-400/30 mb-4" style={{ borderRadius: 0 }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} />
                  <span className="font-bold">Download Failed</span>
                </div>
                <span className="text-xs">{error}</span>
              </div>
              <button
                onClick={() => {
                  setStatus('idle');
                  setError(null);
                }}
                className="w-full py-2 text-sm bg-claude-bg hover:bg-claude-surface border border-claude-border"
                style={{ borderRadius: 0 }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {status === 'idle' && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-claude-border flex-shrink-0">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[10px] font-bold hover:bg-claude-bg transition-colors text-claude-text-secondary"
              style={{ letterSpacing: '0.05em', borderRadius: 0 }}
            >
              CANCEL
            </button>
            <button
              onClick={handleDownload}
              disabled={!isValid}
              className="px-4 py-1.5 text-[10px] font-bold text-white flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed bg-cyan-500 hover:bg-cyan-600"
              style={{ letterSpacing: '0.05em', borderRadius: 0 }}
            >
              <Download size={12} />
              DOWNLOAD
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
