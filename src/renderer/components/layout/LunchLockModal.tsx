import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface LunchLockModalProps {
  onConfirm: (meal: string) => void;
}

export default function LunchLockModal({ onConfirm }: LunchLockModalProps) {
  const [lunchInput, setLunchInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Require at least 3 characters
    if (lunchInput.trim().length < 3) {
      setError('Please describe your lunch properly (at least 3 characters)');
      return;
    }

    // Accept the input
    onConfirm(lunchInput.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center">
      <div className="bg-claude-surface border-4 border-amber-500 p-8 max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-amber-500" strokeWidth={3} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-amber-500 mb-2 uppercase" style={{ letterSpacing: '0.1em' }}>
              Lunch Break Required
            </h2>
            <p className="text-sm text-claude-text-secondary">
              It is now 12:00. Per operational protocols, you must confirm your lunch intake before continuing work.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-claude-text mb-2 uppercase" style={{ letterSpacing: '0.05em' }}>
              What did you have for lunch?
            </label>
            <input
              type="text"
              value={lunchInput}
              onChange={(e) => {
                setLunchInput(e.target.value);
                setError('');
              }}
              placeholder="e.g., Sandwich and coffee"
              className="w-full px-4 py-3 bg-claude-bg border-2 border-claude-border text-claude-text font-mono focus:border-amber-500 focus:outline-none"
              style={{ borderRadius: 0 }}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-400 mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-amber-500 text-black font-bold uppercase hover:bg-amber-400 transition-colors"
              style={{ borderRadius: 0, letterSpacing: '0.1em' }}
            >
              Confirm Lunch
            </button>
          </div>

          <p className="text-[10px] text-claude-text-secondary text-center" style={{ letterSpacing: '0.05em' }}>
            Note: You cannot dismiss this dialog until you confirm your lunch intake.
          </p>
        </form>
      </div>
    </div>
  );
}
