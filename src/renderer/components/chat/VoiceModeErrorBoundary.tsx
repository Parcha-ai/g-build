import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for Voice Mode Component
 *
 * Catches runtime errors from the ElevenLabs SDK which has a known bug
 * in its error handling code (handleErrorEvent tries to access undefined.error_type)
 */
export class VoiceModeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if this is the known ElevenLabs SDK bug
    const isElevenLabsBug = error.message?.includes("Cannot read properties of undefined (reading 'error_type')");

    if (isElevenLabsBug) {
      console.error('[VoiceModeErrorBoundary] Caught ElevenLabs SDK error (known bug in handleErrorEvent):', error);
      console.error('[VoiceModeErrorBoundary] Error info:', errorInfo);
      // Auto-reset after 2 seconds for ElevenLabs bugs
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 2000);
    } else {
      console.error('[VoiceModeErrorBoundary] Uncaught error:', error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Check if this is the known ElevenLabs SDK bug
      const isElevenLabsBug = this.state.error?.message?.includes("Cannot read properties of undefined (reading 'error_type')");

      if (isElevenLabsBug) {
        // For the SDK bug, show a minimal message and auto-recover
        return (
          this.props.fallback || (
            <div className="text-xs text-claude-text-secondary opacity-60">
              Voice mode encountered a temporary error, recovering...
            </div>
          )
        );
      }

      // For other errors, use the fallback or show the error
      return (
        this.props.fallback || (
          <div className="text-xs text-red-500">
            Voice mode error: {this.state.error?.message || 'Unknown error'}
          </div>
        )
      );
    }

    return this.props.children;
  }
}
