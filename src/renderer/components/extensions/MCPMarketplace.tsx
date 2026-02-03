import React, { useState, useEffect, useMemo } from 'react';
import {
  Server,
  Download,
  Check,
  Loader2,
  Search,
  ExternalLink,
  Key,
  Package,
  Globe,
  Calendar,
  Tag,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { MarketplaceMCPServer, MCPServerInfo } from '../../../shared/types';
import MCPInstallDialog from './MCPInstallDialog';

interface MCPMarketplaceProps {
  sessionId: string;
  projectPath?: string;
  installedServers: MCPServerInfo[];
  onServerInstalled: () => void;
}

// Derive category from keywords or server name
function deriveCategory(server: MarketplaceMCPServer): string {
  const keywords = server.keywords?.map((k) => k.toLowerCase()) || [];
  const name = server.name.toLowerCase();
  const id = server.id.toLowerCase();

  // Check keywords first
  if (keywords.some((k) => ['database', 'sql', 'postgres', 'mysql', 'mongodb', 'redis'].includes(k))) {
    return 'Database';
  }
  if (keywords.some((k) => ['browser', 'web', 'puppeteer', 'playwright', 'selenium'].includes(k))) {
    return 'Browser';
  }
  if (keywords.some((k) => ['api', 'rest', 'graphql', 'http'].includes(k))) {
    return 'API';
  }
  if (keywords.some((k) => ['file', 'filesystem', 'storage', 's3'].includes(k))) {
    return 'Storage';
  }
  if (keywords.some((k) => ['ai', 'llm', 'openai', 'anthropic', 'ml'].includes(k))) {
    return 'AI';
  }
  if (keywords.some((k) => ['search', 'elasticsearch', 'algolia'].includes(k))) {
    return 'Search';
  }
  if (keywords.some((k) => ['git', 'github', 'gitlab', 'bitbucket'].includes(k))) {
    return 'Version Control';
  }
  if (keywords.some((k) => ['slack', 'discord', 'teams', 'communication'].includes(k))) {
    return 'Communication';
  }
  if (keywords.some((k) => ['monitor', 'observability', 'logging', 'metrics'].includes(k))) {
    return 'Monitoring';
  }

  // Check name/id patterns
  if (name.includes('database') || name.includes('db') || id.includes('postgres') || id.includes('sql')) {
    return 'Database';
  }
  if (name.includes('browser') || id.includes('puppeteer') || id.includes('playwright')) {
    return 'Browser';
  }
  if (name.includes('file') || id.includes('filesystem')) {
    return 'Storage';
  }

  return 'Other';
}

export default function MCPMarketplace({
  sessionId,
  projectPath,
  installedServers,
  onServerInstalled,
}: MCPMarketplaceProps) {
  const [servers, setServers] = useState<MarketplaceMCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedServer, setSelectedServer] = useState<MarketplaceMCPServer | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load marketplace servers
  const loadServers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.mcp.getMarketplace();
      setServers(data);
    } catch (err) {
      console.error('[MCPMarketplace] Error loading marketplace:', err);
      setError(err instanceof Error ? err.message : 'Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadServers();
    setRefreshing(false);
  };

  // Derive categories from servers
  const categories = useMemo(() => {
    const cats = new Set<string>();
    servers.forEach((s) => cats.add(deriveCategory(s)));
    return ['All', ...Array.from(cats).sort()];
  }, [servers]);

  // Filter servers by search and category
  const filteredServers = useMemo(() => {
    let result = servers;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((s) => deriveCategory(s) === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.id.toLowerCase().includes(query) ||
          s.keywords?.some((k) => k.toLowerCase().includes(query))
      );
    }

    return result;
  }, [servers, selectedCategory, searchQuery]);

  // Check if a server is already installed
  const isInstalled = (serverId: string) => {
    const simpleId = serverId.split('/').pop() || serverId;
    return installedServers.some(
      (s) => s.id === serverId || s.id === simpleId || s.name.toLowerCase() === simpleId.toLowerCase()
    );
  };

  // Handle install button click
  const handleInstallClick = (server: MarketplaceMCPServer) => {
    setSelectedServer(server);
    setShowInstallDialog(true);
  };

  // Handle successful installation
  const handleInstallSuccess = () => {
    setShowInstallDialog(false);
    setSelectedServer(null);
    onServerInstalled();
  };

  // Format date nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-claude-accent" />
          <span className="text-sm text-claude-text-secondary">Loading MCP Registry...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <AlertCircle size={24} className="text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={loadServers}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-claude-surface text-claude-text hover:bg-claude-surface/80 transition-colors"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filter Bar */}
      <div className="p-3 border-b border-claude-border space-y-3 flex-shrink-0">
        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-claude-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search MCP servers..."
            className="w-full pl-9 pr-3 py-2 bg-claude-surface border border-claude-border text-sm text-claude-text placeholder:text-claude-text-secondary focus:outline-none focus:border-claude-accent"
          />
        </div>

        {/* Category Pills + Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-mono whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-claude-accent text-white'
                    : 'bg-claude-surface text-claude-text-secondary hover:text-claude-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 text-claude-text-secondary hover:text-claude-text transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-3 py-2 text-xs text-claude-text-secondary border-b border-claude-border flex-shrink-0">
        {filteredServers.length} server{filteredServers.length !== 1 ? 's' : ''} found
        {searchQuery && ` for "${searchQuery}"`}
        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
      </div>

      {/* Server Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Server size={32} className="text-claude-text-secondary opacity-50 mb-3" />
            <p className="text-sm text-claude-text-secondary">No servers found</p>
            {searchQuery && (
              <p className="text-xs text-claude-text-secondary mt-1">
                Try adjusting your search or category filter
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredServers.map((server) => {
              const installed = isInstalled(server.id);
              const category = deriveCategory(server);
              const publishDate = formatDate(server.publishedAt);
              const hasNpm = server.packages?.some((p) => p.registry_name === 'npm');
              const hasRemote = server.remotes && server.remotes.length > 0;

              return (
                <div
                  key={server.id}
                  className="p-4 border border-claude-border hover:border-claude-accent/50 transition-colors bg-claude-bg group"
                >
                  {/* Header Row */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Icon */}
                    <div className="w-10 h-10 flex items-center justify-center bg-claude-surface border border-claude-border flex-shrink-0">
                      {server.icon ? (
                        <img src={server.icon} alt="" className="w-6 h-6 object-contain" />
                      ) : (
                        <Server size={20} className="text-claude-accent" />
                      )}
                    </div>

                    {/* Title and Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-mono text-sm text-claude-text font-medium truncate">
                          {server.name}
                        </h3>
                        <span className="text-[10px] text-claude-text-secondary bg-claude-surface px-1.5 py-0.5">
                          v{server.version}
                        </span>
                        {server.isLatest && (
                          <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 py-0.5">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-claude-text-secondary font-mono mt-0.5 truncate">
                        {server.id}
                      </p>
                    </div>

                    {/* Install Button */}
                    <div className="flex-shrink-0">
                      {installed ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono bg-green-500/10 text-green-400 border border-green-500/30">
                          <Check size={12} />
                          Installed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInstallClick(server)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono bg-claude-accent text-white hover:bg-claude-accent/80 transition-colors"
                        >
                          <Download size={12} />
                          Install
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-claude-text-secondary mb-3 line-clamp-2">
                    {server.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-4 flex-wrap text-[10px] text-claude-text-secondary">
                    {/* Category */}
                    <span className="flex items-center gap-1">
                      <Tag size={10} />
                      {category}
                    </span>

                    {/* Installation Type */}
                    {hasNpm && (
                      <span className="flex items-center gap-1">
                        <Package size={10} />
                        npm
                      </span>
                    )}
                    {hasRemote && (
                      <span className="flex items-center gap-1">
                        <Globe size={10} />
                        Remote
                      </span>
                    )}

                    {/* Auth Required */}
                    {server.requiresAuth && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Key size={10} />
                        Auth Required
                      </span>
                    )}

                    {/* Publish Date */}
                    {publishDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {publishDate}
                      </span>
                    )}

                    {/* Links */}
                    {(server.repositoryUrl || server.websiteUrl) && (
                      <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        {server.repositoryUrl && (
                          <a
                            href={server.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-claude-accent transition-colors"
                            title="View Repository"
                            onClick={(e) => {
                              e.preventDefault();
                              window.electronAPI.app.openExternal(server.repositoryUrl!);
                            }}
                          >
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {server.websiteUrl && server.websiteUrl !== server.repositoryUrl && (
                          <a
                            href={server.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-claude-accent transition-colors"
                            title="View Website"
                            onClick={(e) => {
                              e.preventDefault();
                              window.electronAPI.app.openExternal(server.websiteUrl!);
                            }}
                          >
                            <Globe size={10} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Keywords */}
                  {server.keywords && server.keywords.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {server.keywords.slice(0, 5).map((keyword) => (
                        <span
                          key={keyword}
                          className="text-[10px] text-claude-text-secondary bg-claude-surface px-1.5 py-0.5"
                        >
                          {keyword}
                        </span>
                      ))}
                      {server.keywords.length > 5 && (
                        <span className="text-[10px] text-claude-text-secondary">
                          +{server.keywords.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Install Dialog */}
      {showInstallDialog && selectedServer && (
        <MCPInstallDialog
          server={selectedServer}
          onClose={() => {
            setShowInstallDialog(false);
            setSelectedServer(null);
          }}
          onSuccess={handleInstallSuccess}
        />
      )}
    </div>
  );
}
