import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { GlowText } from "../components/GlowText";
import { COLORS } from "../constants";
import { GrepThinkingBlock, GrepInputArea, GrepChatHeader, MessageBubble } from "../components/grep-ui";
import { MOCK_THINKING_CONTENT, MOCK_MESSAGES_AUTH } from "../mocks/mockData";

export const Scene8_ExtendedThinking: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Thinking block expand
  const expandSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Token counter
  const tokenCount = Math.floor(interpolate(frame, [50, 200], [0, 14847], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Typewriter effect for thinking content
  const visibleChars = Math.floor(interpolate(frame, [40, 200], [0, MOCK_THINKING_CONTENT.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Toggle between collapsed and expanded at frame 100
  const isExpanded = frame > 100;

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      <SceneTransition>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Title at top */}
          <div style={{ padding: '40px 0 20px 0', textAlign: 'center' }}>
            <GlowText text="Watch it think" fontSize={52} glowColor={COLORS.primary} />
          </div>

          {/* Simulated Grep chat with thinking block */}
          <div
            style={{
              flex: 1,
              maxWidth: 900,
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              transform: `scaleY(${expandSpring})`,
              transformOrigin: 'top',
              overflow: 'hidden',
            }}
          >
            {/* Chat header */}
            <GrepChatHeader sessionName="Auth refactor" />

            {/* User question */}
            <div style={{ padding: '16px 16px 8px 16px' }}>
              <MessageBubble message={MOCK_MESSAGES_AUTH[0]} />
            </div>

            {/* Thinking section - matches ChatContainer's thinking section */}
            <div className="border-t border-claude-border bg-claude-surface/30 px-4 py-2">
              <GrepThinkingBlock
                content={MOCK_THINKING_CONTENT}
                isStreaming={frame < 200}
                isExpanded={isExpanded}
                visibleChars={visibleChars}
              />
            </div>

            {/* Token counter */}
            <div className="px-4 py-1 flex items-center justify-between text-xs font-mono text-claude-text-secondary border-t border-claude-border">
              <span style={{ letterSpacing: '0.05em' }}>EXTENDED THINKING</span>
              <span>{tokenCount.toLocaleString()} tokens</span>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Input area */}
            <GrepInputArea
              isStreaming={true}
              permissionMode="acceptEdits"
              effortLevel="max"
              modelLabel="Opus 4.6"
            />
          </div>

          {/* Blinking cursor indicator */}
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 20,
                backgroundColor: COLORS.primary,
                opacity: Math.sin(frame * 0.15) > 0 ? 0.8 : 0.2,
              }}
            />
          </div>
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};
