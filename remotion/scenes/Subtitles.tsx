import React from 'react';
import { useCurrentFrame } from 'remotion';
import { THEME } from './theme';

const MAX_CHARS = 90;

// Break narration into short caption chunks (sentence-ish, wrapped to a
// readable width) so they can be revealed one at a time like real subtitles.
function chunkNarration(text: string): string[] {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return [];
    const sentences = clean.match(/[^.!?]+[.!?]?/g) || [clean];
    const chunks: string[] = [];
    for (const raw of sentences) {
        const sentence = raw.trim();
        if (!sentence) continue;
        if (sentence.length <= MAX_CHARS) {
            chunks.push(sentence);
            continue;
        }
        // wrap long sentences at word boundaries
        let line = '';
        for (const word of sentence.split(' ')) {
            if ((line + ' ' + word).trim().length > MAX_CHARS) {
                if (line) chunks.push(line.trim());
                line = word;
            } else {
                line = (line + ' ' + word).trim();
            }
        }
        if (line) chunks.push(line.trim());
    }
    return chunks;
}

/** Bottom-pinned caption band. Chunks are timed across `durationInFrames`
 *  weighted by length (longer text lingers), approximating speech pacing. */
export function Subtitles({ text, durationInFrames }: { text?: string; durationInFrames: number }) {
    const frame = useCurrentFrame();
    const chunks = chunkNarration(text || '');
    if (chunks.length === 0) return null;

    const totalChars = chunks.reduce((sum, c) => sum + c.length, 0) || 1;
    let acc = 0;
    let active = '';
    let localStart = 0;
    for (const chunk of chunks) {
        const start = (acc / totalChars) * durationInFrames;
        const end = ((acc + chunk.length) / totalChars) * durationInFrames;
        if (frame >= start && frame < end) {
            active = chunk;
            localStart = start;
            break;
        }
        acc += chunk.length;
    }
    if (!active) {
        // hold the last chunk through any trailing padding
        active = chunks[chunks.length - 1];
    }

    const fade = Math.min(1, Math.max(0, (frame - localStart) / 6));

    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 56,
                display: 'flex',
                justifyContent: 'center',
                padding: '0 120px',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    maxWidth: '78%',
                    background: 'rgba(0,0,0,0.72)',
                    color: '#FFFFFF',
                    fontFamily: THEME.fontSans,
                    fontSize: 34,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    textAlign: 'center',
                    padding: '16px 32px',
                    borderRadius: 14,
                    border: `1px solid ${THEME.panelBorder}`,
                    opacity: fade,
                }}
            >
                {active}
            </div>
        </div>
    );
}
