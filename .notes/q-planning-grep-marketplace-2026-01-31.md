# Q's Strategic Briefing: Grep Build Marketplace Feature

**Classification:** TOP SECRET - EYES ONLY
**Date:** 2026-01-31
**Operation:** Marketplace Intelligence Gathering
**Prepared by:** Q Branch, Her Majesty's Secret Service

---

## Executive Summary

Right then, Sir. I've conducted a thorough reconnaissance operation across the plugin and MCP ecosystem. What we have here is a well-established infrastructure with clear patterns we can leverage - though naturally, the field agents have made it more complicated than strictly necessary.

---

## Section 1: Claude Code Plugin System

### 1.1 Plugin Architecture

Anthropic launched plugins support on **October 9, 2025**. The system is mature and well-documented.

**Plugin Structure:**
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata (ONLY this goes here)
├── .mcp.json                # MCP server configuration (optional)
├── commands/                # Slash commands (optional)
├── agents/                  # Agent definitions (optional)
├── skills/                  # Skill definitions (optional)
└── README.md                # Documentation
```

### 1.2 Installation Commands

**CLI Installation:**
```bash
# Install from marketplace with scope
claude plugin install <plugin>@<marketplace>
claude plugin install <plugin>@<marketplace> --scope project
claude plugin install <plugin>@<marketplace> --scope local

# Organization-scoped plugins
claude plugin install formatter@your-org --scope project
```

**REPL Installation:**
```
/plugin install {plugin-name}@claude-plugin-directory
```

### 1.3 Marketplace Management

```bash
# Add marketplace
claude plugin marketplace add <url-or-repo>
claude plugin marketplace add anthropics/claude-code

# List/Update/Remove
claude plugin marketplace list
claude plugin marketplace update <n>
claude plugin marketplace remove <n>
```

### 1.4 Interactive Plugin Manager

Within Claude Code: `/plugin` opens a tabbed interface with:
- Installed plugins tab
- Available plugins tab
- **Discover tab** - Browse plugins from all marketplaces
- Settings tab

---

## Section 2: Official MCP Registry

### 2.1 Registry Overview

- **Official Registry:** https://registry.modelcontextprotocol.io
- **GitHub Repo:** https://github.com/modelcontextprotocol/registry
- **Launch Date:** September 8, 2025 (preview)
- **API Freeze:** v0.1 as of October 24, 2025 (stable, no breaking changes)

The registry is community-owned, backed by Anthropic, GitHub, PulseMCP, and Microsoft.

### 2.2 API Endpoints

**Base URL:** `https://registry.modelcontextprotocol.io/v0/servers`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v0/servers` | GET | List all servers (paginated) |
| `/v0/servers/{name}/versions` | GET | Get server versions |
| `/v0/servers/{name}/versions/{version}` | GET | Get version details |

**Parameters:**
- `cursor`: Pagination cursor
- `limit`: 1-1000 items (default: 100)

**Response Schema:**
```json
{
  "servers": [
    {
      "name": "io.example/server-name",
      "description": "Server description",
      "version": "1.0.0",
      "vendor": "Vendor Name",
      "repository": "https://github.com/...",
      "websiteUrl": "https://...",
      "packages": {}
    }
  ],
  "nextCursor": "eyJpZCI6..."
}
```

### 2.3 Server JSON Schema

Published servers use schema at:
`https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json`

---

## Section 3: Top 10 MCP Servers for Engineers

Based on extensive reconnaissance, here are the most valuable MCP servers for engineering teams:

### 3.1 The Essential Ten

| Rank | Server | Category | Installation | Configuration |
|------|--------|----------|--------------|---------------|
| 1 | **Linear** | Project Management | npm/Remote | API key required |
| 2 | **GitHub** | Version Control | Remote HTTP | GitHub PAT |
| 3 | **Sentry** | Error Tracking | npm | API key |
| 4 | **Slack** | Communication | npm/OAuth | OAuth2 flow |
| 5 | **Notion** | Documentation | npm/Remote | API token |
| 6 | **Datadog** | Observability | npm | API + App keys |
| 7 | **Playwright** | Browser Automation | npm | None |
| 8 | **Kubernetes** | Infrastructure | npm | kubeconfig |
| 9 | **Terraform** | IaC | npm | None |
| 10 | **Supabase** | Backend/Database | npm | Project keys |

### 3.2 Detailed Installation Configurations

#### Linear MCP (Official Remote)
```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"]
    }
  }
}
```
Then run `/mcp` for OAuth authentication.

#### Linear MCP (Local with API Key)
```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@larryhudson/linear-mcp-server"],
      "env": {
        "LINEAR_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```

#### GitHub MCP
```bash
claude mcp add-json github '{"type":"http","url":"https://api.githubcopilot.com/mcp","headers":{"Authorization":"Bearer YOUR_GITHUB_PAT"}}'
```

#### Sentry MCP
```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server"],
      "env": {
        "SENTRY_AUTH_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```
npm package: `@sentry/mcp-server` (v0.26.0)

#### Slack MCP
```bash
npx @composio/mcp@latest setup "https://mcp.composio.dev/partner/composio/slack/mcp?customerId=<your_id>"
```
Or use `@korotovsky/slack-mcp-server` (30,000+ monthly users)

#### Notion MCP (Official)
```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "YOUR_KEY",
        "NOTION_PAGE_ID": "YOUR_PAGE_ID"
      }
    }
  }
}
```

#### Datadog MCP
```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["-y", "@winor30/mcp-server-datadog"],
      "env": {
        "DATADOG_API_KEY": "<YOUR_API_KEY>",
        "DATADOG_APP_KEY": "<YOUR_APP_KEY>",
        "DATADOG_SITE": "<YOUR_SITE>"
      }
    }
  }
}
```

#### Playwright MCP (Microsoft Official)
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-playwright"]
    }
  }
}
```

#### Kubernetes MCP
```json
{
  "mcpServers": {
    "k8s": {
      "command": "npx",
      "args": ["-y", "@alexei-led/k8s-mcp-server"]
    }
  }
}
```

#### Terraform MCP (HashiCorp Official)
```json
{
  "mcpServers": {
    "terraform": {
      "command": "npx",
      "args": ["-y", "@hashicorp/terraform-mcp-server"]
    }
  }
}
```

#### Supabase MCP
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "<YOUR_URL>",
        "SUPABASE_KEY": "<YOUR_KEY>"
      }
    }
  }
}
```

---

## Section 4: Top 10 Claude Code Plugins

### 4.1 By GitHub Stars (Community Adoption)

| Rank | Plugin | Stars | Description |
|------|--------|-------|-------------|
| 1 | **context7** | 44,220 | Up-to-date code documentation for LLMs |
| 2 | **superpowers** | 40,598 | Agentic skills framework & dev methodology |
| 3 | **everything-claude-code** | 35,476 | Comprehensive config collection |
| 4 | **awesome-claude-skills** | 28,324 | Curated skills and resources |
| 5 | **agents** | 27,350 | Multi-agent orchestration |
| 6 | **ui-ux-pro-max-skill** | 25,349 | Design intelligence for interfaces |
| 7 | **claude-task-master** | 25,168 | AI-powered task management |
| 8 | **chrome-devtools-mcp** | 22,815 | Chrome DevTools integration |
| 9 | **code-review** | N/A | Multi-agent automated PR review |
| 10 | **pr-review-toolkit** | N/A | PR review specialists |

### 4.2 Official Anthropic Plugins (36 Total)

#### LSP Plugins (10)
| Plugin | Language | Key Features |
|--------|----------|--------------|
| typescript-lsp | TypeScript/JS | Real-time type checking, auto-imports |
| pyright-lsp | Python | Type inference, venv awareness |
| rust-analyzer-lsp | Rust | Borrow checker, lifetime analysis |
| gopls-lsp | Go | Module resolution, interface checks |
| jdtls-lsp | Java | Maven/Gradle dependency resolution |
| csharp-lsp | C# | NuGet, .NET framework targeting |
| swift-lsp | Swift | Xcode integration, protocols |
| php-lsp | PHP | Composer autoloading, namespaces |
| lua-lsp | Lua | Love2D, Roblox API completion |
| clangd-lsp | C/C++ | Header resolution, compile commands |

#### Internal Workflow Plugins (5)
| Plugin | Purpose |
|--------|---------|
| security-guidance | Security issue warnings |
| code-review | Multi-agent automated review |
| pr-review-toolkit | Comments, tests, error handling |
| feature-dev | Feature development workflow |
| frontend-design | UI/UX specialist |

#### External Service Plugins (21+)
- **Repository:** GitHub, GitLab, Greptile
- **Backend:** Supabase, Firebase, Laravel Boost
- **Testing:** Playwright
- **Payments:** Stripe
- **Project Management:** Linear, Asana, Slack
- **Code Analysis:** Serena

---

## Section 5: Programmatic Installation

### 5.1 Plugin Installation via CLI

```bash
# Programmatically install a plugin
claude plugin install <plugin-name>@<marketplace> --scope <project|local|user>

# Example
claude plugin install code-review@anthropics/claude-plugins-official --scope project
```

### 5.2 MCP Server Installation via CLI

```bash
# Add MCP server
claude mcp add --transport stdio --env KEY=value <name> -- <command> [args...]

# Add from JSON
claude mcp add-json <name> '<json>'

# Example
claude mcp add --transport stdio linear -- npx -y mcp-remote https://mcp.linear.app/mcp
```

### 5.3 Scope Options

| Scope | Location | Visibility |
|-------|----------|------------|
| `local` | Local config | You only, this project |
| `project` | `.mcp.json` | Everyone in project |
| `user` | `~/.claude.json` | You, all projects |

---

## Section 6: Marketplace Design Recommendations

### 6.1 Data Sources to Aggregate

1. **Official MCP Registry API:** `https://registry.modelcontextprotocol.io/v0/servers`
2. **Anthropic Official Plugins:** `github.com/anthropics/claude-plugins-official`
3. **Community Marketplaces:** `github.com/ananddtyagi/cc-marketplace`
4. **Awesome Lists:** `github.com/punkpeye/awesome-mcp-servers`

### 6.2 Recommended Categories for Grep Build

1. **Development Tools**
   - LSP integrations (TypeScript, Python, Rust, etc.)
   - Code review & analysis
   - Testing frameworks

2. **DevOps & Infrastructure**
   - Kubernetes, Terraform, Pulumi
   - Datadog, Sentry monitoring
   - CI/CD integrations

3. **Productivity & Communication**
   - Slack, Linear, Notion, Asana
   - GitHub, GitLab

4. **Backend Services**
   - Supabase, Firebase
   - Database connectors

5. **Browser & Automation**
   - Playwright, Chrome DevTools
   - Web scraping tools

### 6.3 Metadata to Display

For each server/plugin:
- Name & Icon
- Description (short)
- Category tags
- Installation method (npm/GitHub/Remote)
- Configuration requirements (API keys, OAuth)
- GitHub stars / popularity indicator
- Last updated date
- Official/Community badge

### 6.4 Installation Flow

1. User selects server/plugin from marketplace
2. Show configuration requirements (API keys needed)
3. User provides configuration values
4. Execute: `claude mcp add-json` or `claude plugin install`
5. Verify installation with `claude mcp list` or `/plugin list`
6. Show success/failure status

---

## Section 7: Security Considerations

### 7.1 Plugin Security

- Users must verify trust before installing external plugins
- Anthropic cannot control/verify external MCP servers or files
- Some plugins require sensitive credentials (API keys, tokens)

### 7.2 API Key Storage

- Store credentials via electron-store (encrypted)
- Never log or expose API keys
- Support environment variable injection

### 7.3 Scope Considerations

- `local` scope for personal, sensitive configs
- `project` scope shares via `.mcp.json` (review before committing)
- Consider git-ignoring sensitive configurations

---

## Section 8: Implementation Roadmap

### Phase 1: MVP
- [ ] Fetch and display MCP servers from official registry
- [ ] Show basic metadata (name, description, category)
- [ ] One-click install with `claude mcp add-json`
- [ ] API key input modal for required credentials

### Phase 2: Enhanced Discovery
- [ ] Aggregate multiple sources (registry, awesome lists)
- [ ] Search and filter by category
- [ ] Popularity sorting (GitHub stars)
- [ ] Official vs Community badges

### Phase 3: Plugin Support
- [ ] Claude Code plugin installation
- [ ] Plugin marketplace aggregation
- [ ] Installed plugins management view

### Phase 4: Advanced Features
- [ ] Configuration profiles
- [ ] Export/import configurations
- [ ] Team sharing via project scope
- [ ] Auto-update notifications

---

## Appendix A: Key URLs

| Resource | URL |
|----------|-----|
| MCP Registry | https://registry.modelcontextprotocol.io |
| MCP Registry API | https://registry.modelcontextprotocol.io/v0/servers |
| MCP Registry Docs | https://registry.modelcontextprotocol.io/docs |
| Official Plugins | https://github.com/anthropics/claude-plugins-official |
| MCP Servers Repo | https://github.com/modelcontextprotocol/servers |
| Awesome MCP Servers | https://github.com/punkpeye/awesome-mcp-servers |
| Claude Code Docs | https://code.claude.com/docs/en/mcp |
| Plugin Docs | https://code.claude.com/docs/en/plugins |

---

## Appendix B: NPM Packages for Top MCP Servers

| Server | Package | Version |
|--------|---------|---------|
| Linear (community) | `@larryhudson/linear-mcp-server` | latest |
| Linear (community) | `@tacticlaunch/mcp-linear` | latest |
| Sentry | `@sentry/mcp-server` | 0.26.0 |
| Notion (official) | `@notionhq/notion-mcp-server` | latest |
| Datadog (community) | `@winor30/mcp-server-datadog` | latest |
| Slack (community) | `@korotovsky/slack-mcp-server` | latest |
| MCP SDK | `@modelcontextprotocol/sdk` | latest |

---

**End of Briefing**

*"Try not to blow up the marketplace, 007. I've put considerable effort into this research."*

— Q
