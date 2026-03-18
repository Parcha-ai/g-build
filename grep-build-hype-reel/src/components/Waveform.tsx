import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../constants";

interface WaveformProps {
  barCount?: number;
  width?: number;
  height?: number;
  color?: string;
  active?: boolean;
}

export const Waveform: React.FC<WaveformProps> = ({
  barCount = 40,
  width = 400,
  height = 100,
  color = COLORS.primary,
  active = true,
}) => {
  const frame = useCurrentFrame();

  const barWidth = width / barCount - 2;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        height,
        width,
      }}
    >
      {Array.from({ length: barCount }, (_, i) => {
        const frequency = 0.15 + (i % 5) * 0.05;
        const phase = i * 0.3;
        const amplitude = active ? 0.3 + 0.7 * Math.abs(Math.sin(frame * frequency * 0.1 + phase)) : 0.1;
        const barHeight = height * amplitude;

        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: barHeight,
              backgroundColor: color,
              borderRadius: 2,
              opacity: 0.6 + amplitude * 0.4,
              boxShadow: active ? `0 0 ${barHeight * 0.3}px ${color}40` : "none",
              transition: "height 0.05s ease",
            }}
          />
        );
      })}
    </div>
  );
};
