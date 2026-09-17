import React from 'react';
import { useCurrentFrame } from 'remotion';
import { THEME, ramp } from './theme';
import { SceneFrame } from './SceneFrame';
import type { CodeScene as CodeSceneData } from './types';

// Minimal, dependency-free token coloring — enough to read as code without
// pulling a full highlighter into the Remotion bundle.
const KEYWORDS = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class',
    'import', 'from', 'export', 'default', 'new', 'await', 'async', 'try', 'catch',
    'def', 'self', 'None', 'True', 'False', 'print', 'in', 'not', 'and', 'or', 'elif',
    'public', 'private', 'static', 'void', 'int', 'string', 'bool', 'type', 'interface',
]);

function TokenizedLine({ text }: { text: string }) {
    // split keeping delimiters: strings, comments, words, punctuation
    const parts = text.split(/(\s+|"[^"]*"|'[^']*'|#.*$|\/\/.*$|[(){}[\].,;:=<>+\-*/])/g).filter((p) => p !== '');
    return (
        <>
            {parts.map((part, i) => {
                let color = THEME.text;
                if (/^".*"$|^'.*'$/.test(part)) color = THEME.accent3;
                else if (/^#|^\/\//.test(part)) color = THEME.textMuted;
                else if (/^\d+$/.test(part)) color = THEME.accent;
                else if (KEYWORDS.has(part)) color = THEME.accent2;
                else if (/^[(){}[\].,;:=<>+\-*/]$/.test(part)) color = '#71717A';
                return (
                    <span key={i} style={{ color, whiteSpace: 'pre' }}>
                        {part}
                    </span>
                );
            })}
        </>
    );
}

export function CodeScene({ scene }: { scene: CodeSceneData }) {
    const frame = useCurrentFrame();
    const lines = (scene.code || '').replace(/\n+$/, '').split('\n');
    const total = scene.durationInFrames;

    // Fit the panel: shrink for long snippets.
    const fontSize = lines.length > 18 ? 22 : lines.length > 12 ? 26 : 30;
    const lineH = Math.round(fontSize * 1.55);

    // Reveal lines across the first third of the scene.
    const revealWindow = Math.round(total * 0.3);
    const perLine = revealWindow / Math.max(lines.length, 1);

    // Walk the highlight steps across the rest of the scene.
    const highlights = scene.highlights || [];
    const walkStart = revealWindow + 6;
    const walkDur = Math.max(total - walkStart, 1);
    const stepDur = walkDur / Math.max(highlights.length, 1);
    const activeStep = highlights.length
        ? Math.min(highlights.length - 1, Math.max(0, Math.floor((frame - walkStart) / stepDur)))
        : -1;
    const active = activeStep >= 0 && frame >= walkStart ? highlights[activeStep] : undefined;
    const activeLines = (active?.lines || []).filter((n) => n >= 1 && n <= lines.length);

    const bandTop = activeLines.length ? (Math.min(...activeLines) - 1) * lineH : 0;
    const bandHeight = activeLines.length ? (Math.max(...activeLines) - Math.min(...activeLines) + 1) * lineH : 0;

    return (
        <SceneFrame eyebrow={scene.language ? `Code · ${scene.language}` : 'Code'} heading={scene.heading} accent={THEME.accent3}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div
                    style={{
                        position: 'relative',
                        flex: 1,
                        minHeight: 0,
                        background: THEME.panel,
                        border: `1px solid ${THEME.panelBorder}`,
                        borderRadius: 20,
                        padding: '28px 36px',
                        fontFamily: THEME.fontMono,
                        overflow: 'hidden',
                    }}
                >
                    {/* per-step label, pinned top-right so it never collides with subtitles */}
                    {active?.caption ? (
                        <div
                            style={{
                                position: 'absolute',
                                top: 20,
                                right: 24,
                                maxWidth: '55%',
                                fontFamily: THEME.fontSans,
                                fontSize: 24,
                                fontWeight: 700,
                                color: THEME.accent3,
                                background: `${THEME.accent3}14`,
                                border: `1px solid ${THEME.accent3}40`,
                                borderRadius: 12,
                                padding: '10px 18px',
                                textAlign: 'right',
                            }}
                        >
                            {active.caption}
                        </div>
                    ) : null}
                    {/* moving highlight band */}
                    {activeLines.length ? (
                        <div
                            style={{
                                position: 'absolute',
                                left: 12,
                                right: 12,
                                top: 28 + bandTop,
                                height: bandHeight,
                                background: `${THEME.accent3}1f`,
                                borderLeft: `4px solid ${THEME.accent3}`,
                                borderRadius: 8,
                                transition: 'none',
                            }}
                        />
                    ) : null}

                    <div style={{ position: 'relative' }}>
                        {lines.map((line, i) => {
                            const p = ramp(frame, Math.round(i * perLine), 10);
                            return (
                                <div key={i} style={{ display: 'flex', height: lineH, opacity: p, fontSize }}>
                                    <span style={{ width: 46, color: '#52525B', flexShrink: 0, textAlign: 'right', marginRight: 24, userSelect: 'none' }}>
                                        {i + 1}
                                    </span>
                                    <span>
                                        <TokenizedLine text={line || ' '} />
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </SceneFrame>
    );
}
