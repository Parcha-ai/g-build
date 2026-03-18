import React from "react";
import { Composition } from "remotion";
import { HypeReel } from "./HypeReel";
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
import { FPS, WIDTH, HEIGHT, SCENE_DURATIONS, TOTAL_DURATION } from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main composition */}
      <Composition
        id="HypeReel"
        component={HypeReel}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* Individual scene compositions for testing */}
      <Composition id="Scene1-Hook" component={Scene1_Hook} durationInFrames={SCENE_DURATIONS.hook} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Scene2-PainPoint" component={Scene2_PainPoint} durationInFrames={SCENE_DURATIONS.painPoint} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Scene3-LogoReveal" component={Scene3_LogoReveal} durationInFrames={SCENE_DURATIONS.logoReveal} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Scene4-MultiSession" component={Scene4_MultiSession} durationInFrames={SCENE_DURATIONS.multiSession} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Scene5-VoiceMode" component={Scene5_VoiceMode} durationInFrames={SCENE_DURATIONS.voiceMode} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Scene6-BrowserPreview" component={Scene6_BrowserPreview} durationInFrames={SCENE_DURATIONS.browserPreview} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Scene7-SSHTeleport" component={Scene7_SSHTeleport} durationInFrames={SCENE_DURATIONS.sshTeleport} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Scene8-ExtendedThinking" component={Scene8_ExtendedThinking} durationInFrames={SCENE_DURATIONS.extendedThinking} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Scene9-SpeedMontage" component={Scene9_SpeedMontage} durationInFrames={SCENE_DURATIONS.speedMontage} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Scene10-CTA" component={Scene10_CTA} durationInFrames={SCENE_DURATIONS.cta} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  );
};
