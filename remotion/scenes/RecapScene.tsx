import React from 'react';
import { useCurrentFrame } from 'remotion';
import { THEME, ramp, revealSchedule } from './theme';
import { SceneFrame } from './SceneFrame';
import type { RecapScene as RecapSceneData } from './types';

export function RecapScene({ scene }: { scene: RecapSceneData }) {
    const frame = useCurrentFrame();
    const points = (scene.points || []).slice(0, 6);
    const schedule = revealSchedule(points.length, scene.durationInFrames);

    return (
        <SceneFrame eyebrow="Recap" heading={scene.heading || 'Key Takeaways'} accent={THEME.accent}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26, justifyContent: 'center', height: '100%' }}>
                {points.map((point, i) => {
                    const p = ramp(frame, schedule[i], 16);
                    return (
                        <div
                            key={i}
                            style={{ display: 'flex', alignItems: 'center', gap: 28, opacity: p, transform: `translateX(${(1 - p) * 32}px)` }}
                        >
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '50%',
                                    border: `4px solid ${THEME.accent3}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    transform: `scale(${0.5 + p * 0.5})`,
                                }}
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M4 12.5l5 5L20 6"
                                        stroke={THEME.accent3}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray="40"
                                        strokeDashoffset={(1 - p) * 40}
                                    />
                                </svg>
                            </div>
                            <div style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.3 }}>{point}</div>
                        </div>
                    );
                })}
            </div>
        </SceneFrame>
    );
}
