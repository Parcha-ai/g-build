# Q's Strategic Planning Brief: MCP/Plugins Sidebar Implementation

**Mission Codename**: Operation Protocol Bridge
**Date**: 2026-01-30
**Classification**: Technical Architecture Planning
**Status**: RECONNAISSANCE COMPLETE

---

## Executive Summary

Right then, 007. You've asked me to research how MCP servers, plugins, and marketplace integration work so we can implement a proper sidebar panel for managing these connections. I've conducted a thorough reconnaissance of the official documentation, the Agent SDK, and our existing codebase. Here's what you need to know before charging in.

---

## 1. MCP Server Configuration in Claude Code

### Configuration File Locations & Scopes

Claude Code supports **three configuration scopes** for MCP servers:

| Scope | Storage Location | Purpose |
|-------|------------------|---------|
| **local** (default) | `~/.claude.json` under project paths | Private to you, current project only |
| **project** | `.mcp.json` at project root | Shared with team via version control |
| **user** | `~/.claude.json` (mcpServers field) | Available across all your projects |

Additionally, there's **managed configuration** for enterprise:
- macOS: `/Library/Application Support/ClaudeCode/managed-mcp.json`
- Linux/WSL: `/etc/claude-code/managed-mcp.json`
- Windows: `C:\Program Files\ClaudeCode\managed-mcp.json`

### JSON Configuration Format

The canonical format for MCP server configuration:

```json
{
  "mcpServers": {
    "server-name": {
      "type": "stdio",           // Transport: "stdio", "http", or "sse"
      "command": "npx",          // For stdio: executable command
      "args": ["-y", "@package/name"],  // Command arguments
      "env": {                   // Environment variables
        "API_KEY": "${API_KEY}"  // Supports ${VAR} expansion
      }
    },
    "remote-server": {
      "type": "http",            // For remote servers
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${TOKEN}"
      }
    }
  }
}
```

### CLI Commands for MCP Management

```bash
# Add servers
claude mcp add <name> --transport stdio -- <command> [args...]
claude mcp add <name> --transport http <url>
claude mcp add <name> --transport sse <url>
claude mcp add-json <name> '<json>'

# Manage servers
claude mcp list
claude mcp get <name>
claude mcp remove <name>

# Import from Claude Desktop
claude mcp add-from-claude-desktop

# Reset project approvals
claude mcp reset-project-choices
```

### Dynamic Features

- **list_changed notifications**: MCP servers can dynamically update tools without reconnection
- **Tool Search**: Automatically enabled when tools exceed 10% of context window
- **OAuth 2.0 authentication**: Built-in support for remote servers
- **Environment variable expansion**: `${VAR}` and `${VAR:-default}` syntax

---

## 2. Agent SDK MCP Integration

### SDK Installation & Basic Usage

```bash
npm install @anthropic-ai/claude-agent-sdk
```

### mcpServers Configuration Options

The SDK accepts MCP servers in the `options.mcpServers` object:

```typescript
import { query, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';

// Option 1: In-code configuration
const options = {
  mcpServers: {
    "filesystem": {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      env: { /* environment vars */ }
    },
    "remote-api": {
      type: "http",  // or "sse"
      url: "https://api.example.com/mcp",
      headers: {
        "Authorization": `Bearer ${process.env.API_TOKEN}`
      }
    },
    // SDK MCP Server (in-process custom tools)
    "custom-tools": createSdkMcpServer({
      name: 'my-tools',
      version: '1.0.0',
      tools: [/* tool definitions */]
    })
  },
  allowedTools: ["mcp__filesystem__*", "mcp__remote-api__*"]
};

// Option 2: File-based (.mcp.json at project root - auto-loaded)
```

### Transport Types

| Type | Use Case | Configuration |
|------|----------|---------------|
| **stdio** | Local processes (npx, python scripts) | `command`, `args`, `env` |
| **http** | Cloud-hosted servers | `type: "http"`, `url`, `headers` |
| **sse** | Server-Sent Events (deprecated) | `type: "sse"`, `url`, `headers` |
| **SDK MCP** | In-process custom tools | `createSdkMcpServer()` |

### Tool Naming Convention

MCP tools follow the pattern: `mcp__<server-name>__<tool-name>`

Example: `mcp__github__list_issues`

### Allowing MCP Tools

```typescript
// Wildcard for all tools from a server
allowedTools: ["mcp__github__*"]

// Specific tools only
allowedTools: ["mcp__db__query", "mcp__slack__send_message"]

// Alternative: Change permission mode
permissionMode: "acceptEdits"  // Auto-approves tool usage
permissionMode: "bypassPermissions"  // Skips all safety prompts
```

### Tool Search Configuration

```typescript
// Control via environment variable
options: {
  env: {
    ENABLE_TOOL_SEARCH: "auto:5"  // Enable at 5% threshold
  }
}
```

| Value | Behaviour |
|-------|-----------|
| `auto` | Activates when MCP tools exceed 10% of context (default) |
| `auto:N` | Activates at custom N% threshold |
| `true` | Always enabled |
| `false` | Disabled, all tools loaded upfront |

---

## 3. Plugin/Marketplace System

### How Plugins Work

Plugins extend Claude Code with:
- **Skills**: Instructions, scripts, and resources for specialized tasks
- **Agents**: Automated workflows
- **Hooks**: Event-driven customizations
- **MCP Servers**: Bundled tool integrations

### Official Anthropic Marketplace

Automatically available via `/plugin` command. Categories include:
- **Code Intelligence**: LSP plugins (TypeScript, Python, Rust, etc.)
- **External Integrations**: GitHub, Linear, Slack, Notion, Figma, etc.
- **Development Workflows**: commit-commands, pr-review-toolkit
- **Output Styles**: explanatory-output-style, learning-output-style

### Plugin Installation

```bash
# From official marketplace
/plugin install plugin-name@claude-plugins-official

# From custom marketplace
/plugin marketplace add owner/repo
/plugin install plugin-name@marketplace-name

# Scopes
--scope user     # Available across all projects (default)
--scope project  # Shared with team
--scope local    # Current project only
```

### Plugin MCP Server Configuration

Plugins can bundle MCP servers in two ways:

**Option 1: .mcp.json at plugin root**
```json
{
  "database-tools": {
    "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
    "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
    "env": {
      "DB_URL": "${DB_URL}"
    }
  }
}
```

**Option 2: Inline in plugin.json**
```json
{
  "name": "my-plugin",
  "mcpServers": {
    "plugin-api": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/api-server",
      "args": ["--port", "8080"]
    }
  }
}
```

### Marketplace Configuration

For team/project shared marketplaces, add to `.claude/settings.json`:
```json
{
  "extraKnownMarketplaces": ["owner/repo"],
  "enabledPlugins": ["plugin-name@marketplace-name"]
}
```

---

## 4. Existing Claudette Implementation Analysis

### Current MCP Integration

Our `ClaudeService` already implements MCP servers:

```typescript
// src/main/services/claude.service.ts

// 1. Browser tools via createSdkMcpServer
const mcpServer = createSdkMcpServer({
  name: 'claudette-browser',
  version: '2.0.0',
  tools: [browserSnapshotTool, browserNavigateTool, browserActTool, ...]
});

// 2. QMD semantic search (when enabled)
mcpServersConfig['qmd'] = {
  type: 'stdio',
  command: qmdConfig.command,
  args: qmdConfig.args,
};

// 3. Passed to SDK query
const messages = query({
  options: {
    mcpServers: mcpServersConfig,
    // ...
  }
});
```

### Storage Pattern

Uses `electron-store` for persistence:
- `claudette-settings`: App settings, API keys
- `claudette-sessions`: Session data

---

## 5. Implementation Strategy for MCP/Plugins Sidebar

### Phase 1: Data Model & Storage

**New Store**: `claudette-mcp-config`
```typescript
interface MCPServerConfig {
  id: string;           // Unique identifier
  name: string;         // Display name
  type: 'stdio' | 'http' | 'sse' | 'sdk';
  status: 'connected' | 'disconnected' | 'failed' | 'pending';
  scope: 'user' | 'project' | 'local' | 'plugin';

  // For stdio
  command?: string;
  args?: string[];
  env?: Record<string, string>;

  // For http/sse
  url?: string;
  headers?: Record<string, string>;

  // Metadata
  description?: string;
  toolCount?: number;
  tools?: string[];     // List of available tool names
  lastConnected?: string;
  error?: string;

  // Plugin association
  pluginId?: string;
  pluginName?: string;
}

interface MCPStore {
  servers: Record<string, MCPServerConfig>;
  enabledServers: string[];  // IDs of enabled servers
  serverOrder: string[];     // Display order in sidebar
}
```

### Phase 2: IPC Channels

```typescript
// src/shared/constants/channels.ts
export const MCP_CHANNELS = {
  LIST_SERVERS: 'mcp:list-servers',
  ADD_SERVER: 'mcp:add-server',
  REMOVE_SERVER: 'mcp:remove-server',
  UPDATE_SERVER: 'mcp:update-server',
  TOGGLE_SERVER: 'mcp:toggle-server',
  GET_SERVER_STATUS: 'mcp:get-status',
  SERVER_STATUS_UPDATE: 'mcp:status-update',
  DISCOVER_TOOLS: 'mcp:discover-tools',
  IMPORT_FROM_CLAUDE_DESKTOP: 'mcp:import-claude-desktop',
};
```

### Phase 3: Main Process Service

**New File**: `src/main/services/mcp.service.ts`

Key responsibilities:
1. Read/write MCP configurations
2. Track server connection status
3. Discover available tools from servers
4. Sync with Claude Desktop config if requested
5. Handle `.mcp.json` project files

### Phase 4: Renderer Components

**New Components** in `src/renderer/components/mcp/`:

```
src/renderer/components/mcp/
  MCPSidebar.tsx          # Main sidebar panel
  MCPServerCard.tsx       # Individual server display card
  AddServerDialog.tsx     # Dialog for adding new servers
  ServerConfigForm.tsx    # Form for server configuration
  ToolsList.tsx           # Collapsible list of server tools
  MCPStatusIndicator.tsx  # Connection status badge
```

### Phase 5: UI Metadata Display

For each server in the sidebar, display:
- **Name**: Server display name
- **Status Badge**: Connected (green), Disconnected (grey), Failed (red), Pending (yellow)
- **Type Icon**: Stdio, HTTP, SSE, SDK
- **Tool Count**: Number of available tools
- **Scope Badge**: User, Project, Plugin
- **Actions**: Enable/Disable toggle, Edit, Remove
- **Expandable Tools List**: Clickable to see all tools

### Phase 6: Integration with ClaudeService

Modify `ClaudeService.streamChat()` to:
1. Load enabled MCP servers from store
2. Build `mcpServersConfig` dynamically
3. Monitor `system.init` messages for server status
4. Emit status updates to renderer

---

## 6. Risk Assessment

### Potential Failure Modes

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Server startup timeouts** | Blocked queries | 60s default timeout; show status in UI |
| **Invalid credentials** | Failed connections | Validate before save; clear error display |
| **Tool context overflow** | Degraded performance | Enable Tool Search; show tool count warnings |
| **Process zombies (stdio)** | Resource exhaustion | Track PIDs; cleanup on disconnect |
| **Config corruption** | Lost settings | Validation on load; backup before write |

### Security Considerations

1. **Credential Storage**: Use OS keychain for API tokens (not plain electron-store)
2. **Environment Expansion**: Sanitize user input in `${VAR}` patterns
3. **Project Scope Approval**: Require user consent for `.mcp.json` servers
4. **Command Injection**: Validate stdio commands against allowlist

### Backward Compatibility

- Existing `claudette-browser` MCP server must remain functional
- QMD integration pattern should be preserved
- No breaking changes to `ClaudeService` public API

---

## 7. Dependencies & Requirements

### No New Dependencies Required

The Agent SDK already provides:
- `createSdkMcpServer()` for custom tools
- MCP configuration types
- Status reporting via `system.init` messages

### Environment Variables

```bash
# Optional: Tool search threshold
ENABLE_TOOL_SEARCH=auto:5

# Optional: MCP output limits
MAX_MCP_OUTPUT_TOKENS=50000

# Optional: Server timeout
MCP_TIMEOUT=60000
```

---

## 8. Testing Strategy

### Unit Tests

1. MCP configuration validation
2. Server status state transitions
3. Tool discovery parsing
4. Config file read/write

### Integration Tests

1. Stdio server lifecycle (spawn/connect/disconnect)
2. HTTP server connection with auth
3. SDK MCP server tool invocation
4. Multi-server concurrent operations

### E2E Tests

1. Add server via UI flow
2. Remove server and verify cleanup
3. Enable/disable toggle behavior
4. Import from Claude Desktop

---

## 9. Implementation Checklist

- [ ] Create `MCPService` in main process
- [ ] Add IPC handlers for MCP operations
- [ ] Create MCP store with electron-store
- [ ] Build `MCPSidebar` component
- [ ] Build `MCPServerCard` component
- [ ] Build `AddServerDialog` component
- [ ] Integrate with `ClaudeService.streamChat()`
- [ ] Add status monitoring for server connections
- [ ] Implement tool discovery on server connect
- [ ] Add import from Claude Desktop feature
- [ ] Write unit tests
- [ ] Write E2E tests

---

## 10. References

### Official Documentation

- [Claude Code MCP Configuration](https://code.claude.com/docs/en/mcp)
- [Agent SDK MCP Integration](https://platform.claude.com/docs/en/agent-sdk/mcp)
- [Plugin Marketplace](https://code.claude.com/docs/en/discover-plugins)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)

### MCP Registry API

Claude Code fetches available servers from:
```
https://api.anthropic.com/mcp-registry/v0/servers
```

This could be used for a "Browse Available Servers" feature.

### Community Resources

- [MCP Server Directory](https://github.com/modelcontextprotocol/servers)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [Plugin Marketplaces Curated List](https://github.com/Chat2AnyLLM/awesome-claude-plugins)

---

## Summary Quip

"So you want to add a sidebar for managing MCP servers, do you? Well, at least you had the good sense to ask for proper reconnaissance first. The architecture is reasonably straightforward - configuration files, three transport types, and a registry API for discovery. The real danger, as always, lies in the details: credential management, process lifecycle, and the seventeen ways users will find to misconfigure their servers.

Do try not to leave zombie stdio processes scattered across the user's system. The reputation of Her Majesty's Secret Service depends on it."

---

**Document Location**: `/Users/aj/dev/parcha/claudette/.notes/q-planning-mcp-sidebar-2026-01-30.md`

*Q - Quartermaster, Technical Division*
