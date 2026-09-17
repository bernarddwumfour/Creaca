// Shared visual language for every scene, plus small animation helpers so the
// whole video reads as one system.
import type { CSSProperties } from 'react';

export const THEME = {
    bg: '#0A0A0B',
    panel: '#151518',
    panelBorder: '#26262B',
    text: '#FAFAFA',
    textMuted: '#A1A1AA',
    accent: '#F97316', // orange (brand)
    accent2: '#A855F7', // violet
    accent3: '#22C55E', // green
    accent4: '#3B82F6', // blue
    fontSans: 'Arial, Helvetica, sans-serif',
    fontMono: 'Menlo, Consolas, "Courier New", monospace',
    width: 1920,
    height: 1080,
};

export const EYEBROW: CSSProperties = {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: 5,
    textTransform: 'uppercase',
    color: THEME.accent,
};

// Cubic ease-out for smooth reveals.
export const EASE = (t: number) => 1 - Math.pow(1 - t, 3);

// A 0..1 progress value that ramps from `start` to `start+duration` frames.
export function ramp(frame: number, start: number, duration: number): number {
    if (duration <= 0) return frame >= start ? 1 : 0;
    const t = Math.min(1, Math.max(0, (frame - start) / duration));
    return EASE(t);
}

// Evenly spaces N reveal start-frames across the usable part of a scene so
// items appear one-by-one in sync with the narration.
export function revealSchedule(count: number, totalFrames: number, opts?: { lead?: number; tailPad?: number }): number[] {
    const lead = opts?.lead ?? 12; // frames before the first item appears
    const tailPad = opts?.tailPad ?? Math.round(totalFrames * 0.25); // hold at the end
    if (count <= 0) return [];
    const usable = Math.max(totalFrames - lead - tailPad, count * 8);
    const gap = usable / count;
    return Array.from({ length: count }, (_, i) => Math.round(lead + i * gap));
}
