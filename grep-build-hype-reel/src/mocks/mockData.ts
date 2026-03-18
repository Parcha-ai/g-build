// Mock data for Grep Build hype reel — realistic sessions, messages, and tool calls
// Mirrors the exact types from Claudette's shared/types/index.ts

export interface MockSession {
  id: string;
  name: string;
  repoPath: string;
  worktreePath: string;
  branch: string;
  status: 'running' | 'stopped' | 'error';
  ports: { web: number; api: number; debug: number };
  createdAt: Date;
  updatedAt: Date;
  setupScript: string;
  isDevMode: boolean;
  model?: string;
  isWorktree?: boolean;
  parentRepoPath?: string;
  forkName?: string;
  isStarred?: boolean;
  starredAt?: Date;
  parentSessionId?: string;
  childSessionIds?: string[];
  aiGeneratedName?: string;
  isRoot?: boolean;
}

export interface MockToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: unknown;
  startedAt?: Date;
  completedAt?: Date;
}

export interface MockContentBlock {
  type: 'text' | 'tool_use';
  text?: string;
  toolCallId?: string;
}

export interface MockMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentBlocks?: MockContentBlock[];
  toolCalls?: MockToolCall[];
  timestamp: Date;
  interrupted?: boolean;
}

// ---- Sessions ----

export const MOCK_SESSIONS: MockSession[] = [
  {
    id: 'session-auth',
    name: 'Auth refactor',
    repoPath: '/Users/aj/dev/parcha/claudette',
    worktreePath: '/Users/aj/dev/parcha/claudette',
    branch: 'aj/auth-refactor',
    status: 'running',
    ports: { web: 3000, api: 8080, debug: 9229 },
    createdAt: new Date('2026-03-15T10:00:00'),
    updatedAt: new Date('2026-03-15T14:30:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-opus-4-6',
    isStarred: true,
    starredAt: new Date('2026-03-15T10:05:00'),
    isRoot: true,
  },
  {
    id: 'session-api',
    name: 'API endpoints',
    repoPath: '/Users/aj/dev/parcha/claudette',
    worktreePath: '/Users/aj/dev/parcha/claudette',
    branch: 'aj/api-endpoints',
    status: 'running',
    ports: { web: 3001, api: 8081, debug: 9230 },
    createdAt: new Date('2026-03-15T09:00:00'),
    updatedAt: new Date('2026-03-15T13:45:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-sonnet-4-5',
  },
  {
    id: 'session-bug',
    name: 'Bug fix #342',
    repoPath: '/Users/aj/dev/parcha/claudette',
    worktreePath: '/Users/aj/dev/parcha/claudette',
    branch: 'fix/issue-342',
    status: 'running',
    ports: { web: 3002, api: 8082, debug: 9231 },
    createdAt: new Date('2026-03-15T11:00:00'),
    updatedAt: new Date('2026-03-15T12:30:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-haiku-3-5',
  },
  {
    id: 'session-fork',
    name: 'Alt approach',
    repoPath: '/Users/aj/dev/parcha/claudette',
    worktreePath: '/Users/aj/dev/parcha/claudette/.claudette-worktrees/worktree-abc123',
    branch: 'aj/auth-refactor-v2',
    status: 'running',
    ports: { web: 3003, api: 8083, debug: 9232 },
    createdAt: new Date('2026-03-15T13:00:00'),
    updatedAt: new Date('2026-03-15T14:00:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-opus-4-6',
    isWorktree: true,
    parentRepoPath: '/Users/aj/dev/parcha/claudette',
    forkName: 'fuzzy-tiger',
    parentSessionId: 'session-auth',
    aiGeneratedName: 'Alt approach',
  },
  {
    id: 'session-fork-2',
    name: 'Redis lock variant',
    repoPath: '/Users/aj/dev/parcha/claudette',
    worktreePath: '/Users/aj/dev/parcha/claudette/.claudette-worktrees/worktree-def456',
    branch: 'aj/auth-redis-lock',
    status: 'running',
    ports: { web: 3006, api: 8086, debug: 9235 },
    createdAt: new Date('2026-03-15T13:30:00'),
    updatedAt: new Date('2026-03-15T14:10:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-sonnet-4-5',
    isWorktree: true,
    parentRepoPath: '/Users/aj/dev/parcha/claudette',
    forkName: 'bouncy-penguin',
    parentSessionId: 'session-auth',
    aiGeneratedName: 'Redis lock variant',
  },
  {
    id: 'session-perf',
    name: 'Perf optimization',
    repoPath: '/Users/aj/dev/parcha/claudette',
    worktreePath: '/Users/aj/dev/parcha/claudette',
    branch: 'aj/perf-bundle-size',
    status: 'stopped',
    ports: { web: 3004, api: 8084, debug: 9233 },
    createdAt: new Date('2026-03-14T16:00:00'),
    updatedAt: new Date('2026-03-14T18:30:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-sonnet-4-5',
  },
  {
    id: 'session-tests',
    name: 'E2E test suite',
    repoPath: '/Users/aj/dev/parcha/claudette',
    worktreePath: '/Users/aj/dev/parcha/claudette',
    branch: 'aj/e2e-tests',
    status: 'stopped',
    ports: { web: 3005, api: 8085, debug: 9234 },
    createdAt: new Date('2026-03-14T10:00:00'),
    updatedAt: new Date('2026-03-14T14:00:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-opus-4-6',
  },
  {
    id: 'session-backend',
    name: 'Payment webhooks',
    repoPath: '/Users/aj/dev/parcha/parcha-backend',
    worktreePath: '/Users/aj/dev/parcha/parcha-backend',
    branch: 'aj/stripe-webhooks',
    status: 'running',
    ports: { web: 4000, api: 8090, debug: 9240 },
    createdAt: new Date('2026-03-15T08:00:00'),
    updatedAt: new Date('2026-03-15T14:15:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-opus-4-6',
    isStarred: true,
    starredAt: new Date('2026-03-15T08:05:00'),
    isRoot: true,
  },
  {
    id: 'session-backend-db',
    name: 'DB migrations',
    repoPath: '/Users/aj/dev/parcha/parcha-backend',
    worktreePath: '/Users/aj/dev/parcha/parcha-backend',
    branch: 'aj/migrate-v3',
    status: 'stopped',
    ports: { web: 4001, api: 8091, debug: 9241 },
    createdAt: new Date('2026-03-13T09:00:00'),
    updatedAt: new Date('2026-03-13T17:00:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-sonnet-4-5',
  },
  {
    id: 'session-fe',
    name: 'Dashboard redesign',
    repoPath: '/Users/aj/dev/parcha/parcha-fe',
    worktreePath: '/Users/aj/dev/parcha/parcha-fe',
    branch: 'aj/dashboard-v2',
    status: 'running',
    ports: { web: 5173, api: 8095, debug: 9245 },
    createdAt: new Date('2026-03-15T11:30:00'),
    updatedAt: new Date('2026-03-15T14:20:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-sonnet-4-5',
  },
  {
    id: 'session-fe-a11y',
    name: 'Accessibility audit',
    repoPath: '/Users/aj/dev/parcha/parcha-fe',
    worktreePath: '/Users/aj/dev/parcha/parcha-fe',
    branch: 'aj/a11y-fixes',
    status: 'stopped',
    ports: { web: 5174, api: 8096, debug: 9246 },
    createdAt: new Date('2026-03-14T13:00:00'),
    updatedAt: new Date('2026-03-14T16:00:00'),
    setupScript: '',
    isDevMode: true,
    model: 'claude-haiku-3-5',
  },
];

// ---- Messages for Auth refactor session ----

export const MOCK_MESSAGES_AUTH: MockMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Refactor the authentication middleware to use JWT refresh tokens with a mutex to prevent race conditions when multiple tabs refresh simultaneously.',
    timestamp: new Date('2026-03-15T10:05:00'),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: "I'll analyze the current authentication flow and implement the JWT refresh token mutex. Let me start by examining the existing middleware.",
    contentBlocks: [
      { type: 'text', text: "I'll analyze the current authentication flow and implement the JWT refresh token mutex. Let me start by examining the existing middleware." },
      { type: 'tool_use', toolCallId: 'tc-1' },
      { type: 'tool_use', toolCallId: 'tc-2' },
      { type: 'text', text: "I can see the issue. The current `refreshToken` function doesn't have any locking mechanism. When multiple tabs detect an expired token simultaneously, they all race to refresh it, causing 401 errors.\n\nHere's my plan:\n1. Add a Redis-based distributed lock with a 5-second TTL\n2. Implement a token refresh queue that deduplicates requests\n3. Add proper error handling for lock acquisition failures" },
    ],
    toolCalls: [
      {
        id: 'tc-1',
        name: 'Read',
        input: { file_path: '/src/middleware/auth.ts' },
        status: 'completed',
        result: 'export function authMiddleware(req, res, next) {\n  const token = req.headers.authorization?.split(" ")[1];\n  if (!token) return res.status(401).json({ error: "No token" });\n  // ... existing validation\n}',
        startedAt: new Date('2026-03-15T10:05:05'),
        completedAt: new Date('2026-03-15T10:05:06'),
      },
      {
        id: 'tc-2',
        name: 'Bash',
        input: { command: 'grep -rn "refreshToken" src/' },
        status: 'completed',
        result: 'src/middleware/auth.ts:45:  async function refreshToken(oldToken: string) {\nsrc/lib/api-client.ts:23:    return refreshToken(config.token);\nsrc/hooks/useAuth.ts:18:  const refresh = useCallback(() => refreshToken(), []);',
        startedAt: new Date('2026-03-15T10:05:07'),
        completedAt: new Date('2026-03-15T10:05:08'),
      },
    ],
    timestamp: new Date('2026-03-15T10:05:10'),
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Good analysis. Go ahead and implement the mutex approach.',
    timestamp: new Date('2026-03-15T10:06:00'),
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: "I'll implement the distributed lock pattern using Redis. Here's the implementation:",
    contentBlocks: [
      { type: 'text', text: "I'll implement the distributed lock pattern using Redis." },
      { type: 'tool_use', toolCallId: 'tc-3' },
      { type: 'tool_use', toolCallId: 'tc-4' },
      { type: 'text', text: "The mutex is now in place. The `TokenRefreshMutex` class uses Redis `SET NX EX` for atomic lock acquisition with a 5-second TTL. If a refresh is already in progress, subsequent requests will wait and receive the new token once the first refresh completes.\n\nKey improvements:\n- **No race condition**: Only one refresh happens at a time\n- **Automatic cleanup**: TTL ensures locks are released even if the process crashes\n- **Transparent to callers**: The API client automatically retries with the new token" },
    ],
    toolCalls: [
      {
        id: 'tc-3',
        name: 'Write',
        input: { file_path: '/src/lib/token-mutex.ts', content: '// TokenRefreshMutex implementation...' },
        status: 'completed',
        result: 'File written successfully',
        startedAt: new Date('2026-03-15T10:06:05'),
        completedAt: new Date('2026-03-15T10:06:06'),
      },
      {
        id: 'tc-4',
        name: 'Edit',
        input: { file_path: '/src/middleware/auth.ts', old_string: 'async function refreshToken', new_string: 'async function refreshTokenWithMutex' },
        status: 'completed',
        result: 'Edit applied successfully',
        startedAt: new Date('2026-03-15T10:06:07'),
        completedAt: new Date('2026-03-15T10:06:08'),
      },
    ],
    timestamp: new Date('2026-03-15T10:06:10'),
  },
];

// ---- Messages for API endpoints session ----

export const MOCK_MESSAGES_API: MockMessage[] = [
  {
    id: 'api-msg-1',
    role: 'user',
    content: 'Create REST endpoints for the user dashboard data. Need GET /api/dashboard/stats and GET /api/dashboard/activity.',
    timestamp: new Date('2026-03-15T09:05:00'),
  },
  {
    id: 'api-msg-2',
    role: 'assistant',
    content: "I'll set up the dashboard API endpoints with proper typing and validation.",
    contentBlocks: [
      { type: 'text', text: "I'll create the dashboard API endpoints with TypeScript types and Zod validation." },
      { type: 'tool_use', toolCallId: 'api-tc-1' },
      { type: 'text', text: 'Both endpoints are ready with full TypeScript types, Zod schema validation, and error handling.' },
    ],
    toolCalls: [
      {
        id: 'api-tc-1',
        name: 'Write',
        input: { file_path: '/src/routes/dashboard.ts', content: '// Dashboard routes...' },
        status: 'completed',
        result: 'File written successfully',
        startedAt: new Date('2026-03-15T09:05:05'),
        completedAt: new Date('2026-03-15T09:05:08'),
      },
    ],
    timestamp: new Date('2026-03-15T09:05:10'),
  },
];

// ---- Thinking content for extended thinking scene ----

export const MOCK_THINKING_CONTENT = `Analyzing the authentication flow...

The JWT middleware validates tokens at the gateway level, but the refresh logic has a race condition when multiple tabs request new tokens simultaneously.

Let me trace through the code:
1. Tab A detects expired token -> calls refreshToken()
2. Tab B detects expired token -> calls refreshToken()
3. Tab A gets new token, invalidates old refresh token
4. Tab B tries to use old refresh token -> FAILS with 401

The root cause is that refreshToken() is not idempotent. Each call generates a new refresh token and invalidates the previous one.

Solution: Implement a token refresh mutex using Redis distributed locks with a 5-second TTL. This ensures:
- Only one refresh happens at a time per user
- Other tabs wait for the first refresh to complete
- The TTL prevents deadlocks if the process crashes

Implementation plan:
1. Create TokenRefreshMutex class using Redis SET NX EX
2. Wrap refreshToken() in mutex.acquire() / mutex.release()
3. Add a token refresh queue for waiting requests
4. Add retry logic with exponential backoff`;

// ---- Tool calls for speed montage ----

export const MOCK_TERMINAL_OUTPUT = `\x1b[32m$\x1b[0m npm run test
\x1b[90m> gbuild@0.0.69 test\x1b[0m
\x1b[90m> jest --coverage\x1b[0m

\x1b[32mPASS\x1b[0m src/middleware/__tests__/auth.test.ts
  \x1b[32m\u2713\x1b[0m should validate JWT tokens (3ms)
  \x1b[32m\u2713\x1b[0m should refresh expired tokens with mutex (12ms)
  \x1b[32m\u2713\x1b[0m should handle concurrent refresh requests (8ms)
  \x1b[32m\u2713\x1b[0m should timeout if lock not acquired (5ms)

\x1b[1mTest Suites:\x1b[0m 1 passed, 1 total
\x1b[1mTests:\x1b[0m       \x1b[32m4 passed\x1b[0m, 4 total
\x1b[1mTime:\x1b[0m        1.847s`;

export const MOCK_GIT_CHANGES = [
  { path: 'src/lib/token-mutex.ts', status: 'added' as const, additions: 87, deletions: 0 },
  { path: 'src/middleware/auth.ts', status: 'modified' as const, additions: 23, deletions: 8 },
  { path: 'src/lib/api-client.ts', status: 'modified' as const, additions: 12, deletions: 4 },
  { path: 'src/hooks/useAuth.ts', status: 'modified' as const, additions: 6, deletions: 2 },
  { path: 'src/middleware/__tests__/auth.test.ts', status: 'added' as const, additions: 94, deletions: 0 },
];
