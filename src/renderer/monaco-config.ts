// Monaco configuration for Electron - load from local node_modules via custom protocol
// This must be imported BEFORE any Monaco Editor components are used

import { loader } from '@monaco-editor/react';

// Configure loader to use our custom protocol that serves Monaco from node_modules
// The main process handles 'monaco-asset://' requests and serves files from disk
loader.config({
  paths: {
    vs: 'monaco-asset://app/node_modules/monaco-editor/min/vs',
  },
});

// Initialize Monaco and configure custom theme
loader.init().then((monaco) => {
  monaco.editor.defineTheme('claudette-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1a1a2e',
    },
  });
}).catch((err) => {
  console.error('[Monaco] Failed to initialize:', err);
});

export {};
