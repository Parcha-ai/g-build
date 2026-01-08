import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  ExternalLink,
  Target,
  Code,
  X,
} from 'lucide-react';
import { useUIStore } from '../../stores/ui.store';
import type { Session, DOMElementContext } from '../../../shared/types';

interface BrowserPreviewProps {
  session: Session;
}

export default function BrowserPreview({ session }: BrowserPreviewProps) {
  const webviewRef = useRef<Electron.WebviewTag>(null);
  const [url, setUrl] = useState(`http://localhost:${session.ports.web}`);
  const [inputUrl, setInputUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const { isInspectorActive, setInspectorActive, setSelectedElement } = useUIStore();

  // Handle webview events
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleDidStartLoading = () => setIsLoading(true);
    const handleDidStopLoading = () => {
      setIsLoading(false);
      setCanGoBack(webview.canGoBack());
      setCanGoForward(webview.canGoForward());
    };
    const handleDidNavigate = (e: Electron.DidNavigateEvent) => {
      setUrl(e.url);
      setInputUrl(e.url);
    };

    webview.addEventListener('did-start-loading', handleDidStartLoading);
    webview.addEventListener('did-stop-loading', handleDidStopLoading);
    webview.addEventListener('did-navigate', handleDidNavigate as any);
    webview.addEventListener('did-navigate-in-page', handleDidNavigate as any);

    return () => {
      webview.removeEventListener('did-start-loading', handleDidStartLoading);
      webview.removeEventListener('did-stop-loading', handleDidStopLoading);
      webview.removeEventListener('did-navigate', handleDidNavigate as any);
      webview.removeEventListener('did-navigate-in-page', handleDidNavigate as any);
    };
  }, []);

  // Handle inspector mode
  useEffect(() => {
    if (isInspectorActive && webviewRef.current) {
      injectInspector();
    }
  }, [isInspectorActive]);

  const injectInspector = async () => {
    const webview = webviewRef.current;
    if (!webview) return;

    // Listen for console messages (our communication channel)
    const handleConsoleMessage = (event: Electron.ConsoleMessageEvent) => {
      if (event.message.startsWith('GREP_INSPECTOR:')) {
        try {
          const data = JSON.parse(event.message.replace('GREP_INSPECTOR:', ''));
          setSelectedElement(data);
          setInspectorActive(false);
        } catch (e) {
          console.error('Failed to parse inspector data:', e);
        }
      }
    };

    webview.addEventListener('console-message', handleConsoleMessage as any);

    // Store cleanup function
    (webview as any)._inspectorCleanup = () => {
      webview.removeEventListener('console-message', handleConsoleMessage as any);
    };

    // Inject inspector script
    try {
      await webview.executeJavaScript(`
        (function() {
          console.log('[GREP] Starting inspector injection...');

          // Remove existing inspector
          const existing = document.getElementById('grep-inspector');
          if (existing) {
            console.log('[GREP] Removing existing inspector');
            existing.remove();
          }

          // Create overlay
          const overlay = document.createElement('div');
          overlay.id = 'grep-inspector';
          overlay.style.cssText = 'position:fixed !important;pointer-events:none !important;background:rgba(59,130,246,0.3) !important;border:2px solid #3b82f6 !important;z-index:2147483647 !important;transition:all 0.1s ease !important;display:block !important;visibility:visible !important;';
          document.body.appendChild(overlay);
          console.log('[GREP] Overlay created:', overlay);

          // Create info tooltip
          const tooltip = document.createElement('div');
          tooltip.id = 'grep-inspector-tooltip';
          tooltip.style.cssText = 'position:fixed !important;background:#1a1a1a !important;color:#fff !important;padding:4px 8px !important;font-size:12px !important;font-family:monospace !important;border-radius:4px !important;z-index:2147483647 !important;pointer-events:none !important;max-width:300px !important;word-break:break-all !important;display:block !important;visibility:visible !important;';
          document.body.appendChild(tooltip);
          console.log('[GREP] Tooltip created:', tooltip);

          document.body.style.cursor = 'crosshair';
          console.log('[GREP] Cursor set to crosshair');

          function getSelector(el) {
            const parts = [];
            let current = el;
            while (current && current !== document.body) {
              let selector = current.tagName.toLowerCase();
              if (current.id) selector += '#' + current.id;
              else if (current.className && typeof current.className === 'string') {
                selector += '.' + current.className.split(' ').filter(Boolean).join('.');
              }
              parts.unshift(selector);
              current = current.parentElement;
            }
            return parts.join(' > ');
          }

          function handleMove(e) {
            if (!e.target) return;

            const el = e.target;
            const rect = el.getBoundingClientRect();

            overlay.style.display = 'block';
            overlay.style.top = rect.top + window.scrollY + 'px';
            overlay.style.left = rect.left + window.scrollX + 'px';
            overlay.style.width = rect.width + 'px';
            overlay.style.height = rect.height + 'px';

            const selector = getSelector(el);
            tooltip.style.display = 'block';
            tooltip.textContent = selector;
            tooltip.style.top = Math.max(10, rect.top + window.scrollY - 30) + 'px';
            tooltip.style.left = Math.max(10, Math.min(rect.left + window.scrollX, window.innerWidth - 310)) + 'px';
          }

          function handleClick(e) {
            e.preventDefault();
            e.stopPropagation();

            const el = e.target;
            const selector = getSelector(el);

            console.log('[GREP] Element clicked:', selector);

            const context = {
              tagName: el.tagName.toLowerCase(),
              id: el.id || '',
              className: (typeof el.className === 'string' ? el.className : ''),
              selector: selector,
              innerHTML: (el.innerHTML || '').slice(0, 500),
              outerHTML: (el.outerHTML || '').slice(0, 1000),
              textContent: (el.textContent || '').slice(0, 500),
              attributes: Array.from(el.attributes || []).map(a => ({ name: a.name, value: a.value })),
            };

            // Send via console.log which will be caught by console-message event
            console.log('GREP_INSPECTOR:' + JSON.stringify(context));

            // Cleanup
            document.body.style.cursor = '';
            overlay.remove();
            tooltip.remove();
            document.removeEventListener('mouseover', handleMove);
            document.removeEventListener('click', handleClick, true);

            console.log('[GREP] Inspector cleaned up');
          }

          document.addEventListener('mouseover', handleMove);
          document.addEventListener('click', handleClick, true);

          console.log('[GREP] Inspector initialized successfully');
        })();
      `);
      console.log('[BrowserPreview] Inspector injected successfully');
    } catch (error) {
      console.error('[BrowserPreview] Failed to inject inspector:', error);
    }
  };

  const cancelInspector = async () => {
    setInspectorActive(false);
    const webview = webviewRef.current;
    if (webview) {
      // Cleanup event listeners
      if ((webview as any)._inspectorCleanup) {
        (webview as any)._inspectorCleanup();
        delete (webview as any)._inspectorCleanup;
      }

      // Remove inspector elements from page
      await webview.executeJavaScript(`
        document.body.style.cursor = '';
        document.getElementById('grep-inspector')?.remove();
        document.getElementById('grep-inspector-tooltip')?.remove();
      `);
    }
  };

  const navigate = (targetUrl: string) => {
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'http://' + targetUrl;
    }
    setUrl(targetUrl);
    setInputUrl(targetUrl);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(inputUrl);
  };

  if (session.status !== 'running') {
    return (
      <div className="h-full flex items-center justify-center bg-claude-bg text-claude-text-secondary">
        <p>Start the session to preview</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-claude-bg">
      {/* Toolbar */}
      <div className="h-10 flex items-center gap-2 px-2 bg-claude-surface border-b border-claude-border">
        {/* Navigation */}
        <button
          onClick={() => webviewRef.current?.goBack()}
          disabled={!canGoBack}
          className="p-1.5 rounded hover:bg-claude-bg transition-colors disabled:opacity-30"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={() => webviewRef.current?.goForward()}
          disabled={!canGoForward}
          className="p-1.5 rounded hover:bg-claude-bg transition-colors disabled:opacity-30"
        >
          <ArrowRight size={16} />
        </button>
        <button
          onClick={() => webviewRef.current?.reload()}
          className="p-1.5 rounded hover:bg-claude-bg transition-colors"
        >
          <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>

        {/* URL bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full px-3 py-1 bg-claude-bg border border-claude-border rounded text-sm focus:outline-none focus:border-claude-accent font-mono"
          />
        </form>

        {/* Actions */}
        <button
          onClick={() => setInspectorActive(true)}
          className={`p-1.5 rounded transition-colors ${
            isInspectorActive
              ? 'bg-blue-600 text-white'
              : 'hover:bg-claude-bg'
          }`}
          title="Select element"
        >
          <Target size={16} />
        </button>
        <button
          onClick={() => webviewRef.current?.openDevTools()}
          className="p-1.5 rounded hover:bg-claude-bg transition-colors"
          title="Open DevTools"
        >
          <Code size={16} />
        </button>
        <button
          onClick={() => window.electronAPI.app.openExternal(url)}
          className="p-1.5 rounded hover:bg-claude-bg transition-colors"
          title="Open in browser"
        >
          <ExternalLink size={16} />
        </button>
      </div>

      {/* Inspector mode banner */}
      {isInspectorActive && (
        <div className="h-8 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm">
          <Target size={14} />
          <span>Click any element to select it</span>
          <button
            onClick={cancelInspector}
            className="ml-2 p-0.5 rounded hover:bg-blue-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Webview */}
      <div className="flex-1 relative">
        <webview
          ref={webviewRef}
          src={url}
          className="absolute inset-0 w-full h-full"
          partition={`persist:session-${session.id}`}
          allowpopups={true}
          webpreferences="contextIsolation=yes,nodeIntegration=no,sandbox=no,enableRemoteModule=no"
        />
      </div>
    </div>
  );
}
