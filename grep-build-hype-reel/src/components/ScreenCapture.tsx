import React from "react";
import { Img, interpolate, useCurrentFrame, useVideoConfig, staticFile } from "remotion";

interface ScreenCaptureProps {
  src: string;
  zoomStart?: number;
  zoomEnd?: number;
  style?: React.CSSProperties;
}

export const ScreenCapture: React.FC<ScreenCaptureProps> = ({
  src,
  zoomStart = 1.0,
  zoomEnd = 1.05,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [zoomStart, zoomEnd], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
};
