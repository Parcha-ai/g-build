import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { useSessionStore } from '../../stores/session.store';
import SessionCard from './SessionCard';
import type { Session } from '../../../shared/types';

interface ProjectGroup {
  path: string;
  name: string;
  sessions: Session[];
  mostRecentUpdate: Date;
}

export default function SessionList() {
  const { sessions, activeSessionId, setActiveSession } = useSessionStore();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  if (sessions.length === 0) {
    return (
      <div className="p-4 text-center text-claude-text-secondary text-sm">
        <p>No sessions yet.</p>
        <p className="mt-1 text-xs">Click + to create one.</p>
      </div>
    );
  }

  // Group sessions by project path
  const projectGroups = new Map<string, ProjectGroup>();

  sessions.forEach(session => {
    const projectPath = session.worktreePath;
    if (!projectGroups.has(projectPath)) {
      projectGroups.set(projectPath, {
        path: projectPath,
        name: session.name.split(' - ')[0], // Remove date suffix
        sessions: [],
        mostRecentUpdate: new Date(session.updatedAt),
      });
    }

    const group = projectGroups.get(projectPath)!;
    group.sessions.push(session);

    // Track most recent update
    const sessionDate = new Date(session.updatedAt);
    if (sessionDate > group.mostRecentUpdate) {
      group.mostRecentUpdate = sessionDate;
    }
  });

  // Sort projects by most recent activity
  const sortedProjects = Array.from(projectGroups.values()).sort((a, b) =>
    b.mostRecentUpdate.getTime() - a.mostRecentUpdate.getTime()
  );

  // Sort sessions within each project by recency
  sortedProjects.forEach(project => {
    project.sessions.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });

  const toggleProject = (projectPath: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectPath)) {
      newExpanded.delete(projectPath);
    } else {
      newExpanded.add(projectPath);
    }
    setExpandedProjects(newExpanded);
  };

  return (
    <div className="pb-2">
      {sortedProjects.map((project) => {
        const isExpanded = expandedProjects.has(project.path);
        const hasActiveSession = project.sessions.some(s => s.id === activeSessionId);

        return (
          <div key={project.path} className="mb-1">
            {/* Project header */}
            <button
              onClick={() => toggleProject(project.path)}
              className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-claude-bg transition-colors ${
                hasActiveSession ? 'bg-claude-bg' : ''
              }`}
              style={{ borderRadius: 0 }}
            >
              {isExpanded ? (
                <ChevronDown size={12} className="flex-shrink-0 text-claude-text-secondary" />
              ) : (
                <ChevronRight size={12} className="flex-shrink-0 text-claude-text-secondary" />
              )}
              <Folder size={14} className="flex-shrink-0 text-claude-accent" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-claude-text truncate block">
                  {project.name}
                </span>
                <span className="text-[10px] text-claude-text-secondary">
                  {project.sessions.length} session{project.sessions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>

            {/* Sessions under this project */}
            {isExpanded && (
              <div className="ml-6">
                {project.sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onClick={() => setActiveSession(session.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
