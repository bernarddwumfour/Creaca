import React from 'react';
import { useCurrentFrame } from 'remotion';
import { THEME, ramp, revealSchedule } from './theme';
import { SceneFrame } from './SceneFrame';
import type { ConceptScene as ConceptSceneData } from './types';

export function ConceptScene({ scene }: { scene: ConceptSceneData }) {
    const frame = useCurrentFrame();
    const points = (scene.points || []).slice(0, 6);
    const schedule = revealSchedule(points.length, scene.durationInFrames);

    return (
        <SceneFrame eyebrow="Concept" heading={scene.heading} accent={THEME.accent2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, justifyContent: 'center', height: '100%' }}>
                {points.map((point, i) => {
                    const p = ramp(frame, schedule[i], 16);
                    return (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 28,
                                opacity: p,
                                transform: `translateX(${(1 - p) * 40}px)`,
                            }}
                        >
                            <div
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 6,
                                    background: THEME.accent2,
                                    transform: `scale(${0.4 + p * 0.6})`,
                                    flexShrink: 0,
                                }}
                            />
                            <div style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.3, color: THEME.text }}>
                                {point}
                            </div>
                        </div>
                    );
                })}
            </div>
        </SceneFrame>
    );
}
