import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { Waveform } from "../components/Waveform";
import { TextReveal } from "../components/TextReveal";
import { COLORS } from "../constants";
import { GrepInputArea, GrepThinkingBlock } from "../components/grep-ui";

export const Scene5_VoiceMode: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const voiceActive = frame > 30;
  const thinkingExpand = spring({
    frame: frame - 120,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Thinking content typewriter
  const thinkingText = `Analyzing the authentication flow...
The JWT middleware validates tokens at the gateway level,
but the refresh logic has a race condition.
Solution: implement a distributed lock with Redis...`;

  const thinkingChars = Math.floor(interpolate(frame, [130, 220], [0, thinkingText.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      <SceneTransition>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 30,
          }}
        >
          {/* Voice mode indicator */}
          <div style={{ position: "relative" }}>
            {/* Pulse rings */}
            {[0, 1, 2].map((i) => {
              const ringScale = interpolate(
                frame,
                [30 + i * 15, 60 + i * 15],
                [0.8, 2],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              const ringOpacity = interpolate(
                frame,
                [30 + i * 15, 60 + i * 15],
                [0.5, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    border: `2px solid ${COLORS.primary}`,
                    transform: `translate(-50%, -50%) scale(${ringScale})`,
                    opacity: voiceActive ? ringOpacity : 0,
                    left: "50%",
                    top: "50%",
                  }}
                />
              );
            })}

            {/* Mic button - matches Grep's voice mode UI */}
            <div
              style={{
                width: 100,
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: voiceActive ? '#ef4444' : '#242424',
                border: voiceActive ? '2px solid rgba(239, 68, 68, 0.5)' : '2px solid #333',
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: 40, filter: voiceActive ? 'brightness(1.2)' : 'none' }}>
                {"\u{1F3A4}"}
              </span>
            </div>
          </div>

          {/* Waveform */}
          <Waveform
            barCount={50}
            width={600}
            height={80}
            color={COLORS.primary}
            active={voiceActive}
          />

          {/* Title */}
          <TextReveal text="Talk to your code" delay={20} fontSize={56} />

          {/* Real Grep thinking block */}
          {frame > 120 && (
            <div
              style={{
                width: 650,
                opacity: interpolate(thinkingExpand, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(thinkingExpand, [0, 1], [20, 0])}px)`,
              }}
            >
              <div className="border-t border-claude-border bg-claude-surface/30 px-4 py-2">
                <GrepThinkingBlock
                  content={thinkingText}
                  isStreaming={frame < 220}
                  visibleChars={thinkingChars}
                />
              </div>
            </div>
          )}

          {/* Real Grep input area at bottom */}
          <div style={{ width: 650 }}>
            <GrepInputArea
              showVoiceActive={voiceActive}
              permissionMode="bypassPermissions"
              effortLevel="high"
              modelLabel="Opus 4.6"
            />
          </div>
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};
