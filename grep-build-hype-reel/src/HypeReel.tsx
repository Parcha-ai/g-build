import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Scene1_Hook } from "./scenes/Scene1_Hook";
import { Scene2_PainPoint } from "./scenes/Scene2_PainPoint";
import { Scene3_LogoReveal } from "./scenes/Scene3_LogoReveal";
import { Scene4_MultiSession } from "./scenes/Scene4_MultiSession";
import { Scene5_VoiceMode } from "./scenes/Scene5_VoiceMode";
import { Scene6_BrowserPreview } from "./scenes/Scene6_BrowserPreview";
import { Scene7_SSHTeleport } from "./scenes/Scene7_SSHTeleport";
import { Scene8_ExtendedThinking } from "./scenes/Scene8_ExtendedThinking";
import { Scene9_SpeedMontage } from "./scenes/Scene9_SpeedMontage";
import { Scene10_CTA } from "./scenes/Scene10_CTA";
import { SCENE_DURATIONS, COLORS } from "./constants";

export const HypeReel: React.FC = () => {
  // Calculate cumulative offsets
  const durations = Object.values(SCENE_DURATIONS);
  const offsets = durations.reduce<number[]>((acc, d, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + durations[i - 1]);
    return acc;
  }, []);

  const scenes = [
    Scene1_Hook,
    Scene2_PainPoint,
    Scene3_LogoReveal,
    Scene4_MultiSession,
    Scene5_VoiceMode,
    Scene6_BrowserPreview,
    Scene7_SSHTeleport,
    Scene8_ExtendedThinking,
    Scene9_SpeedMontage,
    Scene10_CTA,
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {scenes.map((SceneComponent, i) => (
        <Sequence
          key={i}
          from={offsets[i]}
          durationInFrames={durations[i]}
        >
          <SceneComponent />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
