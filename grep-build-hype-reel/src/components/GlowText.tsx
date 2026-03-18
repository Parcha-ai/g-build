import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../constants";

interface GlowTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  glowColor?: string;
  style?: React.CSSProperties;
}

export const GlowText: React.FC<GlowTextProps> = ({
  text,
  fontSize = 64,
  color = COLORS.text,
  glowColor = COLORS.glow,
  style,
}) => {
  const frame = useCurrentFrame();
  const glowIntensity = 0.5 + 0.3 * Math.sin(frame * 0.15);

  return (
    <div
      style={{
        fontSize,
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        color,
        textShadow: `0 0 ${20 * glowIntensity}px ${glowColor}, 0 0 ${40 * glowIntensity}px ${glowColor}40, 0 0 ${80 * glowIntensity}px ${glowColor}20`,
        textAlign: "center",
        ...style,
      }}
    >
      {text}
    </div>
  );
};
