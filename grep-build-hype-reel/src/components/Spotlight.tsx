import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../constants";

interface SpotlightProps {
  x: number;
  y: number;
  width: number;
  height: number;
  startFrame?: number;
  duration?: number;
  borderColor?: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  x,
  y,
  width,
  height,
  startFrame = 0,
  duration = 60,
  borderColor = COLORS.primary,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || relativeFrame > duration) return null;

  const opacity = interpolate(relativeFrame, [0, 10, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Dark overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          maskImage: `radial-gradient(ellipse ${width}px ${height}px at ${x}px ${y}px, transparent 0%, black 100%)`,
          WebkitMaskImage: `radial-gradient(ellipse ${width}px ${height}px at ${x}px ${y}px, transparent 0%, black 100%)`,
        }}
      />
      {/* Glow border */}
      <div
        style={{
          position: "absolute",
          left: x - width / 2,
          top: y - height / 2,
          width,
          height,
          borderRadius: 12,
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 20px ${borderColor}40, 0 0 40px ${borderColor}20`,
        }}
      />
    </AbsoluteFill>
  );
};
