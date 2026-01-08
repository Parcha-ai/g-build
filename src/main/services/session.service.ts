import { EventEmitter } from 'events';
import Store from 'electron-store';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { app } from 'electron';
import simpleGit from 'simple-git';
import { DockerService } from './docker.service';
import { GitService } from './git.service';
import type { Session, SessionStatus } from '../../shared/types';

interface SessionCreateConfig {
  name: string;
  repoUrl: string;
  branch: string;
  setupScript?: string;
}

const DEFAULT_SETUP_SCRIPT = `#!/bin/bash
# Grep Session Setup Script
# This script runs when the Docker container starts

# Install dependencies
if [ -f "package.json" ]; then
  npm install
elif [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
fi

# Custom environment variables
export NODE_ENV=development

# Add your custom setup commands below:
`;

export class SessionService extends EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private store: any;
  private dockerService: DockerService;
  private gitService: GitService;
  private sessionsPath: string;

  constructor() {
    super();
    this.store = new Store({ name: 'claudette-sessions' });
    this.dockerService = new DockerService();
    this.gitService = new GitService();
    this.sessionsPath = path.join(app.getPath('userData'), 'sessions');
  }

  private async ensureSessionsDirectory(): Promise<void> {
    await fs.mkdir(this.sessionsPath, { recursive: true });
  }

  private updateSessionStatus(session: Session, status: SessionStatus): Session {
    session.status = status;
    session.updatedAt = new Date();
    this.store.set(`sessions.${session.id}`, session);
    this.emit('statusChanged', session);
    return session;
  }

  async createSession(config: SessionCreateConfig): Promise<Session> {
    await this.ensureSessionsDirectory();

    const sessionId = uuid();
    const sessions = this.getSessions();
    const sessionIndex = sessions.length;
    const ports = this.dockerService.allocatePorts(sessionIndex);

    // Clone repo to sessions directory
    const repoName = config.repoUrl.split('/').pop()?.replace('.git', '') || sessionId;
    const repoPath = path.join(this.sessionsPath, sessionId, repoName);
    const worktreePath = path.join(this.sessionsPath, sessionId, 'worktrees', config.branch);

    const session: Session = {
      id: sessionId,
      name: config.name,
      repoPath,
      worktreePath,
      branch: config.branch,
      status: 'creating',
      ports,
      createdAt: new Date(),
      updatedAt: new Date(),
      setupScript: config.setupScript || DEFAULT_SETUP_SCRIPT,
    };

    // Save session
    this.store.set(`sessions.${sessionId}`, session);
    this.emit('statusChanged', session);

    try {
      // Clone the repository
      await fs.mkdir(path.dirname(repoPath), { recursive: true });
      await this.gitService.clone(config.repoUrl, repoPath);

      // Create worktree for the branch
      await fs.mkdir(path.dirname(worktreePath), { recursive: true });
      await this.gitService.createWorktree(repoPath, worktreePath, config.branch);

      // Create .grep directory with setup script
      const grepDir = path.join(worktreePath, '.grep');
      await fs.mkdir(grepDir, { recursive: true });
      await fs.writeFile(
        path.join(grepDir, 'setup.sh'),
        session.setupScript,
        { mode: 0o755 }
      );

      this.updateSessionStatus(session, 'stopped');
      return session;
    } catch (error) {
      this.updateSessionStatus(session, 'error');
      throw error;
    }
  }

  async startSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Simply activate the session - no Docker needed
    this.updateSessionStatus(session, 'running');
  }

  async stopSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Simply deactivate the session
    this.updateSessionStatus(session, 'stopped');
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Stop and remove container
    if (session.containerId) {
      await this.dockerService.stopContainer(session.containerId);
      await this.dockerService.removeContainer(session.containerId);
    }

    // Release ports
    this.dockerService.releasePorts(session.ports);

    // Remove session directory
    const sessionDir = path.join(this.sessionsPath, sessionId);
    await fs.rm(sessionDir, { recursive: true, force: true });

    // Remove from store
    this.store.delete(`sessions.${sessionId}`);
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const session = this.store.get(`sessions.${sessionId}`) as Session | undefined;
    return session || null;
  }

  async listSessions(): Promise<Session[]> {
    // Discover sessions from ~/.claude/projects/ directory
    const claudeSessions = await this.discoverClaudeSessions();

    // Merge with any sessions in our store (shouldn't be many since we discover from Claude)
    const storedSessions = this.getSessions();

    // Deduplicate by SESSION ID (not path - multiple sessions per path is valid!)
    const sessionMap = new Map<string, Session>();

    storedSessions.forEach(s => sessionMap.set(s.id, s));
    claudeSessions.forEach(s => sessionMap.set(s.id, s));  // Override with discovered sessions

    // Sort by updatedAt (most recent first)
    const allSessions = Array.from(sessionMap.values());
    allSessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return allSessions;
  }

  private getSessions(): Session[] {
    const sessions = this.store.get('sessions') as Record<string, Session> | undefined;
    if (!sessions) return [];
    return Object.values(sessions);
  }

  private async discoverClaudeSessions(): Promise<Session[]> {
    const sessions: Session[] = [];
    const homeDir = require('os').homedir();
    const claudeProjectsDir = path.join(homeDir, '.claude', 'projects');

    console.log('[Session Discovery] Scanning:', claudeProjectsDir);

    try {
      const entries = await fs.readdir(claudeProjectsDir, { withFileTypes: true });
      console.log('[Session Discovery] Found', entries.length, 'entries');

      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

        const projectDir = path.join(claudeProjectsDir, entry.name);
        console.log('[Session Discovery] Scanning project directory:', entry.name);

        // Read actual path from session transcript
        let projectPath: string | null = null;
        try {
          // Find .jsonl files (skip agent files and summary files)
          const files = await fs.readdir(projectDir);
          const jsonlFiles = files.filter(f =>
            f.endsWith('.jsonl') &&
            !f.startsWith('agent-') &&
            f.length > 20  // Skip short summary files
          );

          // Create a session for EACH .jsonl transcript file
          for (const jsonlFile of jsonlFiles) {
            try {
              const transcriptPath = path.join(projectDir, jsonlFile);
              const stats = await fs.stat(transcriptPath);
              const content = await fs.readFile(transcriptPath, 'utf-8');
              const lines = content.split('\n').filter(l => l.trim());

              // Parse lines to find cwd and sessionId
              let sessionCwd: string | null = null;
              let transcriptSessionId: string | null = null;

              for (const line of lines.slice(0, 50)) {
                try {
                  const parsed = JSON.parse(line);
                  if (parsed.cwd) sessionCwd = parsed.cwd;
                  if (parsed.sessionId) transcriptSessionId = parsed.sessionId;
                  if (sessionCwd && transcriptSessionId) break;
                } catch {
                  // Not valid JSON, skip
                }
              }

              if (!sessionCwd) continue;  // Skip if no cwd found

              // Verify path exists
              await fs.access(sessionCwd);

              // Get git branch
              let branch = 'main';
              try {
                const git = simpleGit(sessionCwd);
                const status = await git.status();
                branch = status.current || 'main';
              } catch {
                // Not a git repo or can't get branch
              }

              // Use transcript session ID if available, otherwise hash the transcript file name
              const sessionId = transcriptSessionId || jsonlFile.replace('.jsonl', '');

              // Check if this session already exists in store
              let existingSession = this.store.get(`sessions.${sessionId}`) as Session | undefined;

              if (existingSession) {
                existingSession.branch = branch;
                existingSession.updatedAt = stats.mtime;  // Use file modification time
                sessions.push(existingSession);
              } else {
                // Create new session from transcript
                const session: Session = {
                  id: sessionId,
                  name: `${path.basename(sessionCwd)} - ${new Date(stats.mtime).toLocaleDateString()}`,
                  repoPath: sessionCwd,
                  worktreePath: sessionCwd,
                  branch,
                  status: 'running',
                  ports: { web: 3000, api: 8080, debug: 9229 },
                  setupScript: DEFAULT_SETUP_SCRIPT,
                  isDevMode: true,
                  createdAt: stats.birthtime,
                  updatedAt: stats.mtime,  // Use file modification time for sorting
                };

                this.store.set(`sessions.${sessionId}`, session);
                sessions.push(session);
                console.log('[Session Discovery] Created session:', session.name);
              }
            } catch (fileError) {
              // Error reading this transcript file, skip it
              console.log('[Session Discovery] Error reading transcript:', jsonlFile, fileError);
            }
          }
        } catch (dirError) {
          console.log('[Session Discovery] Error reading project directory:', entry.name, dirError);
        }
      }

      console.log('[Session Discovery] Total discovered:', sessions.length, 'sessions');
    } catch (error) {
      console.error('[Session Discovery] Failed to scan projects directory:', error);
    }

    return sessions;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const updatedSession = {
      ...session,
      ...updates,
      id: session.id, // Prevent ID changes
      updatedAt: new Date(),
    };

    // If setup script changed, update the file
    if (updates.setupScript) {
      const setupPath = path.join(session.worktreePath, '.grep', 'setup.sh');
      await fs.writeFile(setupPath, updates.setupScript, { mode: 0o755 });
    }

    this.store.set(`sessions.${sessionId}`, updatedSession);
    return updatedSession;
  }
}
