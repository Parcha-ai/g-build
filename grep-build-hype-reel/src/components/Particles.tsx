import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";

interface ParticlesProps {
  count?: number;
  color?: string;
  maxSize?: number;
}

export const Particles: React.FC<ParticlesProps> = ({
  count = 50,
  color = COLORS.glow,
  maxSize = 4,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Deterministic particle positions based on index (not random)
  const particles = Array.from({ length: count }, (_, i) => {
    const seed = i * 137.508; // Golden angle for distribution
    const baseX = ((seed * 7.3) % width);
    const baseY = ((seed * 13.7) % height);
    const size = (i % maxSize) + 1;
    const speed = 0.2 + (i % 5) * 0.1;
    const phase = (i * 2.4) % (Math.PI * 2);

    const x = baseX + Math.sin(frame * speed * 0.02 + phase) * 30;
    const y = baseY + Math.cos(frame * speed * 0.015 + phase) * 20 - frame * speed * 0.3;
    const opacity = 0.2 + 0.3 * Math.sin(frame * 0.05 + phase);

    return { x: x % width, y: ((y % height) + height) % height, size, opacity };
  });

  return (
    <AbsoluteFill>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
