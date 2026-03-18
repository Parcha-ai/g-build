import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlowText } from "../components/GlowText";
import { Particles } from "../components/Particles";
import { COLORS } from "../constants";

export const Scene10_CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  // Tagline
  const taglineSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  // URL fade in
  const urlOpacity = interpolate(frame, [70, 100], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Fade to black
  const fadeOut = interpolate(frame, [170, 210], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Particles count={35} color={COLORS.primary} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 30,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoSpring})`,
            opacity: logoSpring,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 32,
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 80px ${COLORS.primary}40`,
            }}
          >
            <span
              style={{
                fontSize: 64,
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              G
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            transform: `scale(${taglineSpring}) translateY(${interpolate(taglineSpring, [0, 1], [20, 0])}px)`,
            opacity: taglineSpring,
          }}
        >
          <GlowText text="The open-source IDE for Claude Code." fontSize={48} />
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: interpolate(taglineSpring, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }),
            fontSize: 22,
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            color: COLORS.muted,
            letterSpacing: 2,
          }}
        >
          Free and open source. Built for developers.
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            fontSize: 28,
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: 500,
            color: COLORS.primary,
            letterSpacing: 3,
            textShadow: `0 0 20px ${COLORS.primary}40`,
          }}
        >
          gbuild.dev
        </div>
      </AbsoluteFill>

      {/* Fade to black with glow residue */}
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.bg,
          opacity: fadeOut,
        }}
      >
        {/* Residual glow */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: 1 - fadeOut,
          }}
        >
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
