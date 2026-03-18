import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { TextReveal } from "../components/TextReveal";
import { COLORS } from "../constants";
import {
  GrepSidebar,
  GrepTitleBar,
  GrepChatHeader,
  GrepInputArea,
  GrepStatusBar,
  MessageBubble,
} from "../components/grep-ui";
import { MOCK_SESSIONS, MOCK_MESSAGES_AUTH, MOCK_MESSAGES_API } from "../mocks/mockData";

export const Scene4_MultiSession: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate active session switching
  const activeIndex = Math.floor(interpolate(frame, [60, 90, 150, 180], [0, 1, 2, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  const sessionIds = ['session-auth', 'session-api', 'session-bug', 'session-fork'];
  const activeSessionId = sessionIds[activeIndex];
  const activeSession = MOCK_SESSIONS.find(s => s.id === activeSessionId) || MOCK_SESSIONS[0];

  // Pick messages based on active session
  const messages = activeIndex === 0 ? MOCK_MESSAGES_AUTH :
                   activeIndex === 1 ? MOCK_MESSAGES_API :
                   MOCK_MESSAGES_AUTH.slice(0, 2);

  // Number of visible messages (typewriter reveal)
  const visibleMsgCount = Math.floor(interpolate(frame, [30, 120], [0, messages.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Sidebar slide in
  const sidebarSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Main content fade
  const contentOpacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Feature text at bottom
  const textDelay = 200;

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      <SceneTransition>
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Title bar */}
          <div style={{ opacity: contentOpacity }}>
            <GrepTitleBar
              isSidebarOpen={true}
              isTerminalOpen={false}
              isBrowserOpen={false}
              clockTime="14:30:42"
            />
          </div>

          {/* Main area */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
            {/* Sidebar - slides in from left */}
            <div
              style={{
                transform: `translateX(${interpolate(sidebarSpring, [0, 1], [-280, 0])}px)`,
                opacity: sidebarSpring,
                height: '100%',
              }}
            >
              <GrepSidebar
                sessions={MOCK_SESSIONS}
                activeSessionId={activeSessionId}
                width={280}
              />
            </div>

            {/* Chat area */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                opacity: contentOpacity,
                minWidth: 0,
              }}
            >
              {/* Chat header with fork tabs */}
              <GrepChatHeader
                sessionName={activeSession.name}
                status="running"
                forkTabs={
                  MOCK_SESSIONS
                    .filter(s => s.parentSessionId === (activeSession.parentSessionId || activeSession.id))
                    .map(s => ({ id: s.id, name: s.forkName || s.name }))
                }
                activeTabId={activeSession.parentSessionId ? activeSession.id : 'root'}
              />

              {/* Messages */}
              <div style={{ flex: 1, padding: 16, overflow: 'hidden' }}>
                <div className="space-y-4">
                  {messages.slice(0, visibleMsgCount).map((msg, i) => {
                    const msgSpring = spring({
                      frame: frame - 30 - i * 15,
                      fps,
                      config: { damping: 15, stiffness: 150 },
                    });

                    return (
                      <div
                        key={msg.id}
                        style={{
                          opacity: msgSpring,
                          transform: `translateY(${interpolate(msgSpring, [0, 1], [20, 0])}px)`,
                        }}
                      >
                        <MessageBubble
                          message={msg}
                          isOldMessage={i < visibleMsgCount - 2}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Input area */}
              <GrepInputArea
                permissionMode="acceptEdits"
                effortLevel="high"
                modelLabel={activeIndex === 1 ? 'Sonnet 4.5' : activeIndex === 2 ? 'Haiku 3.5' : 'Opus 4.6'}
              />
            </div>
          </div>

          {/* Status bar */}
          <div style={{ opacity: contentOpacity }}>
            <GrepStatusBar
              branch={activeSession.branch}
              port={activeSession.ports.web}
            />
          </div>

          {/* Feature text overlay */}
          {frame > textDelay && (
            <div
              style={{
                position: 'absolute',
                bottom: 50,
                left: 0,
                right: 0,
                textAlign: 'center',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '12px 32px',
                  backgroundColor: 'rgba(10, 10, 10, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${COLORS.primary}40`,
                }}
              >
                <TextReveal
                  text="Multiple AI sessions. Fork conversations."
                  delay={textDelay}
                  fontSize={32}
                  color={COLORS.text}
                />
              </div>
            </div>
          )}
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};
