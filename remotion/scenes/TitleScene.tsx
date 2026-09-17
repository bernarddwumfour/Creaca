import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { THEME, ramp } from './theme';
import type { TitleScene as TitleSceneData } from './types';

export function TitleScene({ scene }: { scene: TitleSceneData }) {
    const frame = useCurrentFrame();
    const inOpacity = ramp(frame, 0, 18);
    const rise = (1 - ramp(frame, 0, 22)) * 40;
    const barW = ramp(frame, 10, 24) * 220;

    return (
        <AbsoluteFill
            style={{
                background: `radial-gradient(circle at 30% 30%, ${THEME.accent}1a, ${THEME.bg} 60%)`,
                color: THEME.text,
                fontFamily: THEME.fontSans,
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 160px',
                textAlign: 'center',
            }}
        >
            <div style={{ opacity: inOpacity, transform: `translateY(${rise}px)` }}>
                <div style={{ height: 8, width: barW, background: THEME.accent, borderRadius: 8, margin: '0 auto 40px' }} />
                <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1 }}>
                    {scene.heading || 'Lesson'}
                </div>
                {scene.subtitle ? (
                    <div style={{ fontSize: 36, color: THEME.textMuted, marginTop: 28, fontWeight: 500 }}>
                        {scene.subtitle}
                    </div>
                ) : null}
            </div>
        </AbsoluteFill>
    );
}
