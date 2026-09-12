import React from 'react';
import { AbsoluteFill, Audio, Series, staticFile, useCurrentFrame, interpolate } from 'remotion';

export interface LessonVideoBlockInput {
    block_type: string;
    title: string;
    body: string;
    code: string;
    language: string;
    audioFile: string;
    durationInFrames: number;
}

export type LessonVideoProps = {
    blocks: LessonVideoBlockInput[];
} & Record<string, unknown>;

const ACCENT_BY_TYPE: Record<string, string> = {
    callout: '#F59E0B',
    example: '#3B82F6',
    code: '#22C55E',
    diagram: '#A855F7',
};
const DEFAULT_ACCENT = '#F97316';

function Slide({ block }: { block: LessonVideoBlockInput }) {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    const translateY = interpolate(frame, [0, 15], [24, 0], { extrapolateRight: 'clamp' });
    const accent = ACCENT_BY_TYPE[block.block_type] || DEFAULT_ACCENT;
    const isCode = block.block_type === 'code' && block.code;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#0A0A0B',
                color: '#FAFAFA',
                fontFamily: 'Arial, Helvetica, sans-serif',
                padding: '80px 120px',
                justifyContent: 'center',
            }}
        >
            <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
                <div
                    style={{
                        fontSize: 22,
                        fontWeight: 900,
                        letterSpacing: 4,
                        textTransform: 'uppercase',
                        color: accent,
                        marginBottom: 24,
                    }}
                >
                    {block.block_type}
                </div>
                {block.title ? (
                    <div style={{ fontSize: 54, fontWeight: 900, marginBottom: 32, lineHeight: 1.15 }}>
                        {block.title}
                    </div>
                ) : null}
                {isCode ? (
                    <pre
                        style={{
                            fontSize: 26,
                            lineHeight: 1.6,
                            background: '#18181B',
                            border: `1px solid ${accent}55`,
                            borderRadius: 20,
                            padding: '32px 40px',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'Menlo, Consolas, monospace',
                            maxHeight: 560,
                            overflow: 'hidden',
                        }}
                    >
                        {block.code}
                    </pre>
                ) : (
                    <div
                        style={{
                            fontSize: 32,
                            lineHeight: 1.65,
                            color: '#D4D4D8',
                            maxWidth: 1500,
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {block.body}
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
}

export function LessonVideo({ blocks }: LessonVideoProps) {
    return (
        <AbsoluteFill style={{ backgroundColor: '#0A0A0B' }}>
            <Series>
                {blocks.map((block, index) => (
                    <Series.Sequence key={index} durationInFrames={block.durationInFrames}>
                        <Slide block={block} />
                        {block.audioFile ? <Audio src={staticFile(block.audioFile)} /> : null}
                    </Series.Sequence>
                ))}
            </Series>
        </AbsoluteFill>
    );
}
