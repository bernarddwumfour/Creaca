import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { THEME, EYEBROW, ramp } from './theme';

/** Shared padded layout with an animated eyebrow + heading, used by the
 *  content scenes (concept, steps, recap, diagram, code). */
export function SceneFrame({
    eyebrow,
    heading,
    accent = THEME.accent,
    children,
}: {
    eyebrow: string;
    heading?: string;
    accent?: string;
    children: React.ReactNode;
}) {
    const frame = useCurrentFrame();
    const headOpacity = ramp(frame, 0, 14);
    const headRise = (1 - ramp(frame, 0, 18)) * 24;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: THEME.bg,
                color: THEME.text,
                fontFamily: THEME.fontSans,
                // extra bottom room reserves the subtitle strip so scene
                // content (e.g. the code caption) never sits under it
                padding: '90px 130px 170px',
            }}
        >
            <div style={{ opacity: headOpacity, transform: `translateY(${headRise}px)`, marginBottom: 48 }}>
                <div style={{ ...EYEBROW, color: accent, marginBottom: 16 }}>{eyebrow}</div>
                {heading ? (
                    <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1 }}>{heading}</div>
                ) : null}
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
        </AbsoluteFill>
    );
}
