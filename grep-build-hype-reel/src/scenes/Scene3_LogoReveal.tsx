import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { GlowText } from "../components/GlowText";
import { Particles } from "../components/Particles";
import { COLORS } from "../constants";

export const Scene3_LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo icon spring entrance
  const logoSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  // Radial glow expands
  const glowScale = interpolate(frame, [10, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Tagline fades in after logo
  const taglineOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [50, 70], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Particles count={40} color={COLORS.primary} />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}25 0%, ${COLORS.secondary}10 40%, transparent 70%)`,
          transform: `scale(${glowScale})`,
          opacity: 0.8,
        }}
      />

      {/* Logo icon -- stylized "G" terminal cursor */}
      <div
        style={{
          transform: `scale(${logoSpring})`,
          opacity: logoSpring,
          marginBottom: 24,
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px ${COLORS.primary}50`,
          }}
        >
          <span style={{ fontSize: 56, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#fff" }}>
            G
          </span>
        </div>
      </div>

      {/* Title */}
      <div style={{ zIndex: 1, transform: `scale(${logoSpring})` }}>
        <GlowText text="GBuild" fontSize={96} glowColor={COLORS.primary} />
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          fontSize: 32,
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          color: COLORS.muted,
          marginTop: 16,
          zIndex: 1,
          letterSpacing: 4,
        }}
      >
        The open-source IDE for Claude Code
      </div>
    </AbsoluteFill>
  );
};
