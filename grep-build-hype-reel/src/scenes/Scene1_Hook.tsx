import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Particles } from "../components/Particles";
import { COLORS } from "../constants";

export const Scene1_Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow behind text
  const glowOpacity = interpolate(frame, [15, 45], [0, 0.8], {
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
      <Particles count={30} color={COLORS.glow} />

      {/* Radial glow behind text */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}30 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />

      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          fontSize: 80,
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          color: COLORS.text,
          textAlign: "center",
          lineHeight: 1.2,
          textShadow: `0 0 40px ${COLORS.glow}60`,
          zIndex: 1,
        }}
      >
        What if your IDE
        <br />
        could <span style={{ color: COLORS.primary }}>think</span>?
      </div>
    </AbsoluteFill>
  );
};
