import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS } from "../constants";
import {
  GrepTerminal,
  GrepGitExplorer,
  GrepExtensionsExplorer,
  GrepInputArea,
  GrepStatusBar,
  GrepBrowserPreview,
  GrepGStackMenu,
} from "../components/grep-ui";
import { MOCK_TERMINAL_OUTPUT, MOCK_GIT_CHANGES } from "../mocks/mockData";

interface FeatureConfig {
  label: string;
  color: string;
  renderContent: (featureFrame: number, fps: number) => React.ReactNode;
}

const features: FeatureConfig[] = [
  {
    label: "Multi-tab Terminal",
    color: "#22c55e",
    renderContent: (featureFrame, fps) => {
      const visibleLines = Math.floor(interpolate(featureFrame, [5, 50], [0, 15], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }));
      return (
        <div style={{ width: 800, height: 400, overflow: 'hidden', border: '1px solid #333' }}>
          <GrepTerminal output={MOCK_TERMINAL_OUTPUT} visibleLines={visibleLines} />
        </div>
      );
    },
  },
  {
    label: "Git Integration",
    color: "#f59e0b",
    renderContent: (featureFrame, fps) => (
      <div style={{ width: 450, height: 400, overflow: 'hidden', border: '1px solid #333' }}>
        <GrepGitExplorer
          branch="aj/auth-refactor"
          changes={MOCK_GIT_CHANGES}
          commitMessage="feat: add JWT refresh token mutex"
        />
      </div>
    ),
  },
  {
    label: "MCP Extensions",
    color: "#3b82f6",
    renderContent: (featureFrame, fps) => (
      <div style={{ width: 400, height: 400, overflow: 'hidden', border: '1px solid #333' }}>
        <GrepExtensionsExplorer />
      </div>
    ),
  },
  {
    label: "Live Browser Preview",
    color: "#e879f9",
    renderContent: (featureFrame, fps) => (
      <div style={{ width: 700, height: 400, overflow: 'hidden', border: '1px solid #333' }}>
        <GrepBrowserPreview url="http://localhost:3000/dashboard" />
      </div>
    ),
  },
  {
    label: "Model & Mode Switching",
    color: "#8b5cf6",
    renderContent: (featureFrame, fps) => {
      // Cycle through different permission modes
      const modeIndex = Math.floor(featureFrame / 15) % 4;
      const modes: Array<'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'> = ['default', 'acceptEdits', 'bypassPermissions', 'plan'];
      const models = ['Opus 4.6', 'Sonnet 4.5', 'Haiku 3.5', 'Opus 4.6'];
      const efforts: Array<'low' | 'medium' | 'high' | 'max'> = ['low', 'medium', 'high', 'max'];

      return (
        <div style={{ width: 700 }}>
          <GrepInputArea
            permissionMode={modes[modeIndex]}
            effortLevel={efforts[modeIndex]}
            modelLabel={models[modeIndex]}
          />
          <div style={{ marginTop: 16 }}>
            <GrepStatusBar
              branch="aj/feature-branch"
              showSubagent={modeIndex === 2}
              subagentType="IMPLEMENT"
            />
          </div>
        </div>
      );
    },
  },
  {
    label: "GStack Workflows",
    color: "#f59e0b",
    renderContent: (featureFrame, fps) => {
      // Cycle through active modes
      const modeIndex = Math.floor(featureFrame / 20) % 3;
      const activeModes = ['plan-ceo', 'ship', 'qa'];
      return (
        <div style={{ width: 340, overflow: 'hidden', border: '1px solid #333' }}>
          <GrepGStackMenu activeMode={activeModes[modeIndex]} />
        </div>
      );
    },
  },
  {
    label: "Subagent Teams",
    color: "#ef4444",
    renderContent: (featureFrame, fps) => (
      <div style={{ width: 700 }}>
        <GrepStatusBar
          branch="aj/auth-refactor"
          showSubagent={true}
          subagentType={featureFrame < 30 ? 'EXPLORE' : 'IMPLEMENT'}
        />
        {/* Agent color badges (from AGENT_COLORS) */}
        <div className="mt-4 flex items-center gap-3 justify-center">
          {[
            { name: 'bond', color: '#3B82F6' },
            { name: 'q', color: '#8B5CF6' },
            { name: 'moneypenny', color: '#EC4899' },
          ].map(agent => (
            <div key={agent.name} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold uppercase border"
                style={{
                  color: agent.color,
                  backgroundColor: `${agent.color}15`,
                  borderColor: `${agent.color}40`,
                  letterSpacing: '0.08em',
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.color }} />
                {agent.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const FRAMES_PER_FEATURE = 60;

export const Scene9_SpeedMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentFeatureIndex = Math.min(
    Math.floor(frame / FRAMES_PER_FEATURE),
    features.length - 1
  );
  const featureFrame = frame - currentFeatureIndex * FRAMES_PER_FEATURE;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {features.map((feature, i) => {
        const isActive = i === currentFeatureIndex;
        if (!isActive) return null;

        const enterSpring = spring({
          frame: featureFrame,
          fps,
          config: { damping: 10, stiffness: 250 },
        });

        const exitOpacity = interpolate(
          featureFrame,
          [FRAMES_PER_FEATURE - 8, FRAMES_PER_FEATURE],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <AbsoluteFill
            key={feature.label}
            style={{
              justifyContent: "center",
              alignItems: "center",
              opacity: exitOpacity,
              flexDirection: "column",
              gap: 24,
            }}
          >
            {/* Real Grep component */}
            <div
              style={{
                transform: `scale(${enterSpring})`,
                transformOrigin: 'center center',
              }}
            >
              {feature.renderContent(featureFrame, fps)}
            </div>

            {/* Label */}
            <div
              style={{
                fontSize: 38,
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                color: COLORS.text,
                transform: `translateY(${interpolate(enterSpring, [0, 1], [30, 0])}px)`,
                opacity: enterSpring,
              }}
            >
              {feature.label}
            </div>

            {/* Progress dots */}
            <div style={{ display: "flex", gap: 10 }}>
              {features.map((_, j) => (
                <div
                  key={j}
                  style={{
                    width: j === i ? 24 : 8,
                    height: 8,
                    backgroundColor: j === i ? feature.color : `${COLORS.muted}40`,
                  }}
                />
              ))}
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
