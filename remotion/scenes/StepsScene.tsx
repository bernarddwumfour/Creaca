import React from 'react';
import { useCurrentFrame } from 'remotion';
import { THEME, ramp, revealSchedule } from './theme';
import { SceneFrame } from './SceneFrame';
import type { StepsScene as StepsSceneData } from './types';

export function StepsScene({ scene }: { scene: StepsSceneData }) {
    const frame = useCurrentFrame();
    const steps = (scene.steps || []).slice(0, 7);
    const schedule = revealSchedule(steps.length, scene.durationInFrames);

    return (
        <SceneFrame eyebrow="Steps" heading={scene.heading} accent={THEME.accent3}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, justifyContent: 'center', height: '100%' }}>
                {steps.map((step, i) => {
                    const p = ramp(frame, schedule[i], 16);
                    return (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 28,
                                opacity: p,
                                transform: `translateY(${(1 - p) * 24}px)`,
                            }}
                        >
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    background: THEME.accent3,
                                    color: THEME.bg,
                                    fontSize: 30,
                                    fontWeight: 900,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    transform: `scale(${0.5 + p * 0.5})`,
                                }}
                            >
                                {i + 1}
                            </div>
                            <div style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.3 }}>{step}</div>
                        </div>
                    );
                })}
            </div>
        </SceneFrame>
    );
}
