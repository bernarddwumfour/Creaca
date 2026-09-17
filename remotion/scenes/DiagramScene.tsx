import React from 'react';
import { useCurrentFrame } from 'remotion';
import { THEME, ramp, revealSchedule } from './theme';
import { SceneFrame } from './SceneFrame';
import type { DiagramScene as DiagramSceneData, DiagramNode } from './types';

// Diagram is drawn in this virtual coordinate space (the body area under the
// header); the SVG scales it to fit.
const VB_W = 1660;
const VB_H = 720;
const NODE_H = 96;

interface Placed extends DiagramNode {
    x: number; // center
    y: number;
    w: number;
}

function nodeWidth(label: string): number {
    return Math.min(Math.max(label.length * 17 + 64, 190), 380);
}

function layoutNodes(nodes: DiagramNode[], layout: string): Placed[] {
    const n = nodes.length;
    if (n === 0) return [];

    if (layout === 'stack') {
        const gap = VB_H / n;
        return nodes.map((node, i) => ({
            ...node,
            x: VB_W / 2,
            y: gap * (i + 0.5),
            w: nodeWidth(node.label),
        }));
    }

    if (layout === 'cycle') {
        const r = Math.min(VB_W, VB_H) / 2 - 120;
        const cx = VB_W / 2;
        const cy = VB_H / 2;
        return nodes.map((node, i) => {
            const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
            return {
                ...node,
                x: cx + r * Math.cos(angle),
                y: cy + r * Math.sin(angle),
                w: nodeWidth(node.label),
            };
        });
    }

    // flow (default): left-to-right, wrapping to a second row past 4 nodes.
    const perRow = n <= 4 ? n : Math.ceil(n / 2);
    const rows = Math.ceil(n / perRow);
    return nodes.map((node, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const colsThisRow = row === rows - 1 ? n - perRow * row : perRow;
        const slotW = VB_W / colsThisRow;
        const rowGap = VB_H / rows;
        return {
            ...node,
            x: slotW * (col + 0.5),
            y: rowGap * (row + 0.5),
            w: nodeWidth(node.label),
        };
    });
}

// Shorten a line so it stops at the node box edges (approx: rectangular).
function edgePoint(from: Placed, to: Placed, atSource: boolean): { x: number; y: number } {
    const node = atSource ? from : to;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const halfW = node.w / 2;
    const halfH = NODE_H / 2;
    // scale so the point lands on the box boundary
    const scale = Math.min(halfW / (Math.abs(ux) || 1e-6), halfH / (Math.abs(uy) || 1e-6));
    const sign = atSource ? 1 : -1;
    return { x: node.x + sign * ux * scale, y: node.y + sign * uy * scale };
}

// Distinct border colors per nesting layer, outermost first.
const LAYER_COLORS = [THEME.accent, THEME.accent4, THEME.accent2, THEME.accent3, '#EC4899', '#14B8A6'];

// Concentric labeled boxes — for containment concepts (the CSS box model,
// layers-within-layers), where the outer node CONTAINS the next. Nodes are
// ordered outermost -> innermost; each becomes a nested rectangle with its
// label tabbed at the top-left, revealed from the outside in.
function NestedDiagram({ nodes, durationInFrames }: { nodes: DiagramNode[]; durationInFrames: number }) {
    const frame = useCurrentFrame();
    const n = nodes.length;
    const margin = 30;
    const availW = VB_W - 2 * margin;
    const availH = VB_H - 2 * margin;
    const sched = revealSchedule(n, Math.round(durationInFrames * 0.7), { tailPad: 0 });

    return (
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            {nodes.map((node, i) => {
                const p = ramp(frame, sched[i] ?? 0, 18);
                if (p <= 0) return null;
                const t = n > 1 ? i / n : 0;
                const insetX = t * availW * 0.42;
                const insetY = t * availH * 0.46;
                const x = margin + insetX;
                const y = margin + insetY;
                const w = availW - 2 * insetX;
                const h = availH - 2 * insetY;
                const color = LAYER_COLORS[i % LAYER_COLORS.length];
                const labelW = node.label.length * 16 + 40;
                const isInner = i === n - 1;
                return (
                    <g key={node.id} opacity={p}>
                        <rect x={x} y={y} width={w} height={h} rx={16} fill={`${color}10`} stroke={color} strokeWidth={3} />
                        {/* label tab at top-left of this layer (centered for the innermost box) */}
                        {isInner ? (
                            <text x={x + w / 2} y={y + h / 2 + 12} fill={THEME.text} fontSize={34} fontWeight={800} fontFamily={THEME.fontSans} textAnchor="middle">
                                {node.label}
                            </text>
                        ) : (
                            <>
                                <rect x={x + 18} y={y + 16} width={labelW} height={44} rx={10} fill={color} />
                                <text x={x + 18 + labelW / 2} y={y + 46} fill={THEME.bg} fontSize={26} fontWeight={800} fontFamily={THEME.fontSans} textAnchor="middle">
                                    {node.label}
                                </text>
                            </>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

export function DiagramScene({ scene }: { scene: DiagramSceneData }) {
    const frame = useCurrentFrame();
    const nodes = (scene.nodes || []).slice(0, 8);
    const edges = scene.edges || [];

    if (scene.layout === 'nested') {
        return (
            <SceneFrame eyebrow="Diagram" heading={scene.heading} accent={THEME.accent2}>
                <NestedDiagram nodes={nodes} durationInFrames={scene.durationInFrames} />
            </SceneFrame>
        );
    }

    const placed = layoutNodes(nodes, scene.layout || 'flow');
    const byId = new Map(placed.map((p) => [p.id, p]));

    const total = scene.durationInFrames;
    const nodeSched = revealSchedule(placed.length, Math.round(total * 0.55), { tailPad: 0 });
    const nodeRevealEnd = (nodeSched[nodeSched.length - 1] ?? 0) + 16;
    const edgeSched = revealSchedule(edges.length, Math.max(total - nodeRevealEnd, edges.length * 10), {
        lead: nodeRevealEnd,
        tailPad: Math.round(total * 0.12),
    });

    return (
        <SceneFrame eyebrow="Diagram" heading={scene.heading} accent={THEME.accent2}>
            <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
                style={{ display: 'block' }}
            >
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M0 0 L10 5 L0 10 z" fill={THEME.accent} />
                    </marker>
                </defs>

                {/* Edges (drawn under nodes) */}
                {edges.map((edge, i) => {
                    const from = byId.get(edge.from);
                    const to = byId.get(edge.to);
                    if (!from || !to) return null;
                    const p = ramp(frame, edgeSched[i] ?? 0, 18);
                    if (p <= 0) return null;
                    const a = edgePoint(from, to, true);
                    const b = edgePoint(from, to, false);
                    const len = Math.hypot(b.x - a.x, b.y - a.y);
                    const midX = (a.x + b.x) / 2;
                    const midY = (a.y + b.y) / 2;
                    return (
                        <g key={i}>
                            <line
                                x1={a.x}
                                y1={a.y}
                                x2={b.x}
                                y2={b.y}
                                stroke={THEME.accent}
                                strokeWidth={4}
                                strokeDasharray={len}
                                strokeDashoffset={(1 - p) * len}
                                markerEnd="url(#arrow)"
                                opacity={0.9}
                            />
                            {edge.label ? (
                                <g opacity={ramp(frame, (edgeSched[i] ?? 0) + 8, 12)}>
                                    <rect x={midX - edge.label.length * 8 - 10} y={midY - 20} width={edge.label.length * 16 + 20} height={36} rx={8} fill={THEME.bg} stroke={THEME.panelBorder} />
                                    <text x={midX} y={midY + 5} fill={THEME.textMuted} fontSize={24} fontFamily={THEME.fontSans} textAnchor="middle">
                                        {edge.label}
                                    </text>
                                </g>
                            ) : null}
                        </g>
                    );
                })}

                {/* Nodes */}
                {placed.map((node, i) => {
                    const p = ramp(frame, nodeSched[i] ?? 0, 16);
                    if (p <= 0) return null;
                    const scale = 0.7 + p * 0.3;
                    const w = node.w;
                    return (
                        <g key={node.id} opacity={p} transform={`translate(${node.x} ${node.y}) scale(${scale})`}>
                            <rect
                                x={-w / 2}
                                y={-NODE_H / 2}
                                width={w}
                                height={NODE_H}
                                rx={18}
                                fill={THEME.panel}
                                stroke={THEME.accent2}
                                strokeWidth={3}
                            />
                            <text
                                x={0}
                                y={9}
                                fill={THEME.text}
                                fontSize={30}
                                fontWeight={700}
                                fontFamily={THEME.fontSans}
                                textAnchor="middle"
                            >
                                {node.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </SceneFrame>
    );
}
