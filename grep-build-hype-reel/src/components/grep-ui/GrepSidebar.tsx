// Faithful recreation of Claudette's Sidebar for hype reel
// Groups sessions by project path, shows starred + recent + project tree

import React from "react";
import { Plus, LogOut, Zap, Star, Folder, ChevronDown, ChevronRight, GitFork } from "lucide-react";
import { SessionCard } from "./SessionCard";
import type { MockSession } from "../../mocks/mockData";

interface GrepSidebarProps {
  sessions: MockSession[];
  activeSessionId: string;
  width?: number;
}

function getProjectName(repoPath: string): string {
  const parts = repoPath.split('/');
  return parts.slice(-2).join('/');
}

export function GrepSidebar({ sessions, activeSessionId, width = 280 }: GrepSidebarProps) {
  const starredSessions = sessions.filter(s => s.isStarred && !s.parentSessionId);
  const forkSessions = sessions.filter(s => s.parentSessionId);

  // Group non-starred, non-fork sessions by project
  const projectGroups = new Map<string, MockSession[]>();
  sessions
    .filter(s => !s.parentSessionId)
    .forEach(s => {
      const project = getProjectName(s.repoPath);
      if (!projectGroups.has(project)) projectGroups.set(project, []);
      projectGroups.get(project)!.push(s);
    });

  return (
    <div className="flex" style={{ height: '100%' }}>
      <div
        className="flex flex-col font-mono bg-claude-surface overflow-y-auto"
        style={{ width, height: '100%' }}
      >
        {/* Sessions Header */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-claude-border flex-shrink-0">
          <h3
            className="text-[10px] font-bold text-claude-text-secondary"
            style={{ letterSpacing: '0.1em' }}
          >
            SESSIONS
          </h3>
          <div className="p-1 text-claude-text-secondary" style={{ borderRadius: 0 }}>
            <Plus size={14} />
          </div>
        </div>

        {/* Scrollable session list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Starred section */}
          {starredSessions.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 flex items-center gap-2">
                <Star size={11} className="text-amber-400" fill="currentColor" />
                <span className="text-[10px] font-bold text-claude-text-secondary uppercase tracking-wider">
                  Starred
                </span>
              </div>
              {starredSessions.map(session => (
                <React.Fragment key={session.id}>
                  <SessionCard
                    session={session}
                    isActive={session.id === activeSessionId}
                  />
                  {forkSessions
                    .filter(f => f.parentSessionId === session.id)
                    .map(fork => (
                      <div key={fork.id} className="ml-4">
                        <SessionCard
                          session={fork}
                          isActive={fork.id === activeSessionId}
                          isFork
                        />
                      </div>
                    ))
                  }
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Project groups */}
          {Array.from(projectGroups.entries()).map(([project, projectSessions]) => {
            const runningCount = projectSessions.filter(s => s.status === 'running').length;
            return (
              <div key={project} className="mb-1">
                <div className="px-3 py-1.5 flex items-center gap-2">
                  <ChevronDown size={11} className="text-claude-text-secondary" />
                  <Folder size={12} className="text-claude-accent" />
                  <span className="text-[10px] font-bold text-claude-text truncate flex-1">
                    {project}
                  </span>
                  {runningCount > 0 && (
                    <span className="text-[9px] text-claude-success">
                      {runningCount} active
                    </span>
                  )}
                </div>
                {projectSessions.map(session => (
                  <React.Fragment key={session.id}>
                    <SessionCard
                      session={session}
                      isActive={session.id === activeSessionId}
                    />
                    {forkSessions
                      .filter(f => f.parentSessionId === session.id)
                      .map(fork => (
                        <div key={fork.id} className="ml-4">
                          <SessionCard
                            session={fork}
                            isActive={fork.id === activeSessionId}
                            isFork
                          />
                        </div>
                      ))
                    }
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-2 flex items-center justify-end border-t border-claude-border">
          <div className="p-1.5 text-claude-text-secondary">
            <LogOut size={12} />
          </div>
        </div>
      </div>

      {/* Resize handle */}
      <div className="w-1 bg-claude-border" style={{ height: '100%' }} />
    </div>
  );
}
