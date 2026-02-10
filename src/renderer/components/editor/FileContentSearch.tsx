import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  Loader2,
  FileText,
  ChevronRight,
  ChevronDown,
  CaseSensitive,
  WholeWord,
  Regex,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editor.store';
import { useSessionStore } from '../../stores/session.store';

interface SearchMatch {
  lineNumber: number;
  lineContent: string;
}

interface FileResult {
  filePath: string;
  relativePath: string;
  fileName: string;
  matches: SearchMatch[];
  matchCount: number;
}

interface FlatItem {
  type: 'file' | 'match';
  fileIndex: number;
  matchIndex?: number;
  filePath: string;
  relativePath: string;
  fileName: string;
  lineNumber?: number;
  lineContent?: string;
  matchCount?: number;
}

export default function FileContentSearch() {
  const { isFileSearchOpen, closeFileSearch, openFile } = useEditorStore();
  const { activeSessionId } = useSessionStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [collapsedFiles, setCollapsedFiles] = useState<Set<string>>(new Set());

  // Search options
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Build flat list for keyboard navigation
  const flatItems: FlatItem[] = [];
  results.forEach((file, fileIndex) => {
    flatItems.push({
      type: 'file',
      fileIndex,
      filePath: file.filePath,
      relativePath: file.relativePath,
      fileName: file.fileName,
      matchCount: file.matchCount,
    });
    if (!collapsedFiles.has(file.filePath)) {
      file.matches.forEach((match, matchIndex) => {
        flatItems.push({
          type: 'match',
          fileIndex,
          matchIndex,
          filePath: file.filePath,
          relativePath: file.relativePath,
          fileName: file.fileName,
          lineNumber: match.lineNumber,
          lineContent: match.lineContent,
        });
      });
    }
  });

  // Focus input when opened
  useEffect(() => {
    if (isFileSearchOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isFileSearchOpen]);

  // Debounced search
  useEffect(() => {
    if (!isFileSearchOpen || !activeSessionId) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const searchResults = await window.electronAPI.fs.searchFiles(
          activeSessionId,
          query,
          { caseSensitive, wholeWord, regex: useRegex }
        );
        setResults(searchResults);
        setSelectedIndex(0);
        setCollapsedFiles(new Set());
      } catch (err) {
        console.error('[FileContentSearch] Search failed:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, caseSensitive, wholeWord, useRegex, isFileSearchOpen, activeSessionId]);

  // Reset state when closed
  useEffect(() => {
    if (!isFileSearchOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setCollapsedFiles(new Set());
    }
  }, [isFileSearchOpen]);

  const toggleFileCollapsed = useCallback((filePath: string) => {
    setCollapsedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback((item: FlatItem) => {
    if (item.type === 'file') {
      toggleFileCollapsed(item.filePath);
    } else if (item.type === 'match' && item.lineNumber) {
      openFile(item.filePath, item.lineNumber);
      closeFileSearch();
    }
  }, [openFile, closeFileSearch, toggleFileCollapsed]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          handleSelect(flatItems[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeFileSearch();
        break;
    }
  }, [flatItems, selectedIndex, handleSelect, closeFileSearch]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const el = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeFileSearch();
  }, [closeFileSearch]);

  // Highlight search term in line content
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const pattern = useRegex ? searchTerm : searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(wholeWord ? `\\b${pattern}\\b` : pattern, flags);
      const parts = text.split(regex);
      const matches = text.match(regex);
      if (!matches) return text;

      return parts.reduce((acc: React.ReactNode[], part, i) => {
        acc.push(part);
        if (i < matches.length) {
          acc.push(
            <span key={i} className="bg-amber-500/40 text-amber-200 rounded-sm px-0.5">
              {matches[i]}
            </span>
          );
        }
        return acc;
      }, []);
    } catch {
      return text;
    }
  };

  // Summary counts
  const totalFiles = results.length;
  const totalMatches = results.reduce((sum, r) => sum + r.matchCount, 0);

  if (!isFileSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-[700px] max-w-[90vw] bg-claude-surface border border-claude-border shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search input row */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-claude-border">
          <Search size={16} className="text-claude-text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search in files..."
            className="flex-1 bg-transparent text-claude-text text-sm font-mono outline-none placeholder:text-claude-text-secondary"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {/* Option toggles */}
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={`p-1 rounded transition-colors ${
              caseSensitive ? 'bg-claude-accent/30 text-claude-accent' : 'text-claude-text-secondary hover:text-claude-text'
            }`}
            title="Match Case (Aa)"
          >
            <CaseSensitive size={16} />
          </button>
          <button
            onClick={() => setWholeWord(!wholeWord)}
            className={`p-1 rounded transition-colors ${
              wholeWord ? 'bg-claude-accent/30 text-claude-accent' : 'text-claude-text-secondary hover:text-claude-text'
            }`}
            title="Whole Word (Ab|)"
          >
            <WholeWord size={16} />
          </button>
          <button
            onClick={() => setUseRegex(!useRegex)}
            className={`p-1 rounded transition-colors ${
              useRegex ? 'bg-claude-accent/30 text-claude-accent' : 'text-claude-text-secondary hover:text-claude-text'
            }`}
            title="Use Regular Expression (.*)"
          >
            <Regex size={16} />
          </button>

          {isSearching && <Loader2 size={16} className="text-claude-accent animate-spin" />}
          <button onClick={closeFileSearch} className="p-1 hover:bg-claude-bg rounded transition-colors">
            <X size={16} className="text-claude-text-secondary" />
          </button>
        </div>

        {/* Results summary */}
        {query.trim() && !isSearching && (
          <div className="px-4 py-1.5 text-xs text-claude-text-secondary border-b border-claude-border font-mono">
            {totalMatches > 0
              ? `${totalMatches} result${totalMatches !== 1 ? 's' : ''} in ${totalFiles} file${totalFiles !== 1 ? 's' : ''}`
              : 'No results found'}
          </div>
        )}

        {/* Results list */}
        <div ref={resultsRef} className="flex-1 overflow-y-auto">
          {!query.trim() && (
            <div className="px-4 py-8 text-center text-claude-text-secondary text-sm font-mono">
              Type to search file contents...
            </div>
          )}

          {query.trim() && !isSearching && results.length === 0 && (
            <div className="px-4 py-8 text-center text-claude-text-secondary text-sm font-mono">
              No results found
            </div>
          )}

          {flatItems.map((item, index) => {
            if (item.type === 'file') {
              const isCollapsed = collapsedFiles.has(item.filePath);
              return (
                <button
                  key={`file-${item.filePath}`}
                  data-index={index}
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-claude-accent/20 text-claude-text'
                      : 'text-claude-text-secondary hover:bg-claude-bg/50'
                  }`}
                >
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  <FileText size={14} className="text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-mono font-medium text-claude-text truncate">
                    {item.fileName}
                  </span>
                  <span className="text-xs font-mono text-claude-text-secondary truncate flex-1">
                    {item.relativePath}
                  </span>
                  <span className="text-xs font-mono text-claude-text-secondary bg-claude-bg px-1.5 py-0.5 rounded flex-shrink-0">
                    {item.matchCount}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={`match-${item.filePath}-${item.lineNumber}`}
                data-index={index}
                onClick={() => handleSelect(item)}
                className={`w-full flex items-center gap-2 pl-10 pr-3 py-1 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-claude-accent/20 text-claude-text'
                    : 'text-claude-text-secondary hover:bg-claude-bg/50'
                }`}
              >
                <span className="text-xs font-mono text-claude-text-secondary w-8 text-right flex-shrink-0 tabular-nums">
                  {item.lineNumber}
                </span>
                <span className="text-sm font-mono truncate">
                  {highlightMatch(item.lineContent || '', query)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2 border-t border-claude-border text-[10px] text-claude-text-secondary flex items-center gap-4">
          <span><kbd className="px-1 bg-claude-bg rounded">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 bg-claude-bg rounded">↵</kbd> open / toggle</span>
          <span><kbd className="px-1 bg-claude-bg rounded">esc</kbd> close</span>
          <span className="flex-1" />
          <span className="text-claude-text-secondary/50">⌘⇧F</span>
        </div>
      </div>
    </div>
  );
}
