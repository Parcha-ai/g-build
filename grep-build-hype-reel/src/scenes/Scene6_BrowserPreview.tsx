import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { TextReveal } from "../components/TextReveal";
import { COLORS } from "../constants";
import {
  GrepTitleBar,
  GrepSidebar,
  GrepChatHeader,
  GrepInputArea,
  GrepStatusBar,
  GrepBrowserPreview,
  MessageBubble,
} from "../components/grep-ui";
import { MOCK_SESSIONS, MOCK_MESSAGES_AUTH } from "../mocks/mockData";

export const Scene6_BrowserPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Inspector highlight animation
  const inspectorPhase = Math.floor(interpolate(frame, [60, 120, 180], [0, 1, 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Checkmark
  const checkSpring = spring({
    frame: frame - 220,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  // Content fade-in
  const contentOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Browser panel slide in from right
  const browserSlide = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      <SceneTransition>
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Title bar with browser toggle active */}
          <div style={{ opacity: contentOpacity }}>
            <GrepTitleBar
              isSidebarOpen={true}
              isBrowserOpen={true}
              clockTime="14:35:18"
            />
          </div>

          {/* Main area */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{ opacity: contentOpacity, height: '100%' }}>
              <GrepSidebar
                sessions={MOCK_SESSIONS.slice(0, 2)}
                activeSessionId="session-auth"
                width={240}
              />
            </div>

            {/* Chat panel (left half) */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                opacity: contentOpacity,
                minWidth: 0,
              }}
            >
              <GrepChatHeader sessionName="Auth refactor" />
              <div style={{ flex: 1, padding: 16, overflow: 'hidden' }}>
                <div className="space-y-3">
                  {MOCK_MESSAGES_AUTH.slice(0, 2).map((msg, i) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOldMessage={true}
                    />
                  ))}
                </div>
              </div>
              <GrepInputArea
                permissionMode="acceptEdits"
                effortLevel="high"
                modelLabel="Opus 4.6"
              />
            </div>

            {/* Divider */}
            <div
              className="w-1 bg-claude-border"
              style={{ opacity: contentOpacity }}
            />

            {/* Browser panel (right half) - slides in */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                transform: `translateX(${interpolate(browserSlide, [0, 1], [100, 0])}px)`,
                opacity: browserSlide,
                overflow: 'hidden',
              }}
            >
              {/* Panel header (matches MainContent.tsx) */}
              <div className="h-10 flex items-center justify-between px-3 border-b border-claude-border bg-claude-surface">
                <span className="text-sm font-medium text-claude-text">Browser Preview</span>
              </div>

              {/* Browser content */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <GrepBrowserPreview url="http://localhost:3000" isInspectorActive={inspectorPhase > 0}>
                  {/* Simulated page with inspector highlights */}
                  <div className="h-full flex flex-col bg-white">
                    {/* Header bar */}
                    <div
                      className="h-14 flex items-center px-6"
                      style={{
                        backgroundColor: '#111827',
                        border: inspectorPhase === 0 ? '2px solid #3b82f6' : 'none',
                        boxShadow: inspectorPhase === 0 ? '0 0 12px rgba(59, 130, 246, 0.4)' : 'none',
                      }}
                    >
                      <div className="w-24 h-4 bg-white/20 rounded" />
                      <div className="ml-auto flex gap-4">
                        <div className="w-12 h-3 bg-white/15 rounded" />
                        <div className="w-12 h-3 bg-white/15 rounded" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 bg-gradient-to-b from-gray-50 to-white">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="h-6 w-48 bg-gray-200 rounded" />
                        <div className="h-4 w-64 bg-gray-100 rounded" />
                      </div>

                      <div className="flex gap-4 mt-6">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className="flex-1 h-28 bg-gray-50 border border-gray-200 rounded-lg p-4"
                            style={{
                              border: inspectorPhase === 1 && i === 2 ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                              boxShadow: inspectorPhase === 1 && i === 2 ? '0 0 12px rgba(139, 92, 246, 0.4)' : 'none',
                            }}
                          >
                            <div className="w-12 h-3 bg-gray-300 rounded mb-2" />
                            <div className="w-full h-2 bg-gray-200 rounded mb-1" />
                            <div className="w-3/4 h-2 bg-gray-200 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Green checkmark */}
                    {frame > 220 && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 30,
                          top: 80,
                          transform: `scale(${checkSpring})`,
                          width: 40,
                          height: 40,
                          backgroundColor: '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
                        }}
                      >
                        <span style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{"\u2713"}</span>
                      </div>
                    )}
                  </div>
                </GrepBrowserPreview>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div style={{ opacity: contentOpacity }}>
            <GrepStatusBar branch="aj/auth-refactor" port={3000} />
          </div>

          {/* Feature text overlay */}
          <div style={{ position: 'absolute', bottom: 50, left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
            <div style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: 'rgba(10, 10, 10, 0.85)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${COLORS.primary}40`,
            }}>
              <TextReveal
                text="Live browser. DOM inspection. Auto-test."
                delay={40}
                fontSize={30}
              />
            </div>
          </div>
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};
