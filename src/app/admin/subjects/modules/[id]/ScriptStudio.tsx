'use client';

import React, { useMemo, useState } from 'react';
import { Player } from '@remotion/player';
import { ArrowUp, ArrowDown, Trash2, Plus, Save, Check, Loader2, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { apiMessage } from '@/lib/api-message';
import { LessonVideo } from '../../../../../../remotion/LessonVideo';

const FPS = 30;

export interface VideoScript {
    id: string;
    scenes: Scene[];
    is_approved: boolean;
}
type Scene = Record<string, any> & { type: string; narration?: string };

const SCENE_TYPES = ['title', 'concept', 'diagram', 'code', 'steps', 'recap'];
const COMMON_KEYS = new Set(['type', 'narration', 'heading', 'audio_base64', 'durationInFrames', 'audioFile']);

// Preview has no narration audio, so estimate each scene's on-screen time from
// its narration length (~2.6 spoken words/sec) — representative of the final
// render, which times scenes to the real TTS audio.
function estimateFrames(scene: Scene): number {
    const words = (scene.narration || '').trim().split(/\s+/).filter(Boolean).length;
    const seconds = Math.max(words / 2.6, 3);
    return Math.round(seconds * FPS) + 20;
}

export function ScriptStudio({ moduleId, scripts, onChanged }: {
    moduleId: string;
    scripts: VideoScript[];
    onChanged: () => void;
}) {
    // Prefer editing the draft; fall back to the approved script.
    const source = useMemo(
        () => scripts.find(s => !s.is_approved) || scripts.find(s => s.is_approved),
        [scripts]
    );

    const [scenes, setScenes] = useState<Scene[]>(() => source?.scenes || []);
    // Per-scene text buffer for the "visual details" JSON so invalid typing
    // doesn't crash; parsed on save.
    const [visualText, setVisualText] = useState<Record<number, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const visualFor = (scene: Scene, i: number): string => {
        if (visualText[i] !== undefined) return visualText[i];
        const rest: Record<string, any> = {};
        Object.keys(scene).forEach(k => { if (!COMMON_KEYS.has(k)) rest[k] = scene[k]; });
        return JSON.stringify(rest, null, 2);
    };

    const update = (i: number, patch: Partial<Scene>) => {
        setScenes(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
        setDirty(true);
    };

    const move = (i: number, dir: -1 | 1) => {
        setScenes(prev => {
            const next = [...prev];
            const j = i + dir;
            if (j < 0 || j >= next.length) return prev;
            [next[i], next[j]] = [next[j], next[i]];
            return next;
        });
        setVisualText({});
        setDirty(true);
    };

    const remove = (i: number) => {
        setScenes(prev => prev.filter((_, idx) => idx !== i));
        setVisualText({});
        setDirty(true);
    };

    const addScene = () => {
        setScenes(prev => [...prev, { type: 'concept', narration: '', heading: 'New scene', points: [] }]);
        setDirty(true);
    };

    // Merge the per-scene visual JSON buffers back into the scenes; throws on
    // the first invalid buffer.
    const materialize = (): Scene[] => {
        return scenes.map((scene, i) => {
            const merged: Scene = { type: scene.type, narration: scene.narration || '' };
            if (scene.heading !== undefined) merged.heading = scene.heading;
            const raw = visualText[i];
            if (raw !== undefined) {
                let parsed: any;
                try { parsed = JSON.parse(raw || '{}'); }
                catch { throw new Error(`Scene ${i + 1}: on-screen details is not valid JSON`); }
                Object.assign(merged, parsed);
            } else {
                Object.keys(scene).forEach(k => { if (!COMMON_KEYS.has(k)) merged[k] = scene[k]; });
            }
            return merged;
        });
    };

    const handleSave = async () => {
        let payload: Scene[];
        try { payload = materialize(); }
        catch (e: any) { toast.error(e.message); return; }
        setIsSaving(true);
        try {
            await api.patch(ENDPOINTS.MODULES.UPDATE_SCRIPT.replace(':id', moduleId), { scenes: payload });
            toast.success('Script saved');
            setDirty(false);
            setVisualText({});
            onChanged();
        } catch (error: any) {
            toast.error(apiMessage(error, 'Failed to save script.'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleApprove = async () => {
        if (dirty) { toast.warning('Save your edits before approving.'); return; }
        setIsApproving(true);
        try {
            await api.post(ENDPOINTS.MODULES.APPROVE_CONTENT.replace(':id', moduleId), { content_type: 'script' });
            toast.success('Script approved — you can now render the video.');
            onChanged();
        } catch (error: any) {
            toast.error(apiMessage(error, 'Failed to approve script.'));
        } finally {
            setIsApproving(false);
        }
    };

    // Preview scenes (with estimated durations) for the in-browser player.
    // Memoized so the Player's inputProps stay referentially stable across the
    // parent page's polling re-renders (a fresh array each render would thrash
    // the Player). Falls back to saved scenes if an editor JSON buffer is mid-edit.
    const { previewScenes, totalFrames } = useMemo(() => {
        const build = (list: Scene[]) => list.map(s => ({ ...s, durationInFrames: estimateFrames(s) }));
        let ps: any[];
        try { ps = build(materialize()); }
        catch { ps = build(scenes); }
        return { previewScenes: ps, totalFrames: Math.max(ps.reduce((sum, s) => sum + s.durationInFrames, 0), FPS) };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenes, visualText]);

    // No script to show (all hooks above run unconditionally).
    if (!source) return null;

    return (
        <Card className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <CardTitle className="text-sm font-black flex items-center gap-2">
                            <Film size={16} className="text-primary" /> Video Script
                            <Badge className={`${source.is_approved && !scripts.some(s => !s.is_approved) ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'} border-none text-[9px] font-black uppercase tracking-widest`}>
                                {scripts.some(s => !s.is_approved) ? 'Draft' : 'Approved'}
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Preview the animated lesson, edit the narration &amp; scenes, then approve to enable rendering.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleSave} disabled={isSaving || !dirty}
                            className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10 gap-2">
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                        </Button>
                        <Button onClick={handleApprove} disabled={isApproving}
                            className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10 gap-2 bg-primary hover:bg-orange-600">
                            {isApproving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Approve script
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Preview player */}
                <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black">
                    <Player
                        component={LessonVideo as any}
                        inputProps={{ scenes: previewScenes }}
                        durationInFrames={totalFrames}
                        compositionWidth={1920}
                        compositionHeight={1080}
                        fps={FPS}
                        controls
                        style={{ width: '100%' }}
                    />
                </div>
                <p className="text-[10px] text-zinc-400">
                    Preview uses estimated timing (no narration audio yet). The rendered video times each scene to its real narration.
                </p>

                {/* Scene editor */}
                <div className="space-y-4">
                    {scenes.map((scene, i) => (
                        <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-zinc-400">#{i + 1}</span>
                                    <select
                                        value={scene.type}
                                        onChange={(e) => update(i, { type: e.target.value })}
                                        className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2 py-1 outline-none"
                                    >
                                        {SCENE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp size={14} /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, 1)} disabled={i === scenes.length - 1}><ArrowDown size={14} /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600" onClick={() => remove(i)}><Trash2 size={14} /></Button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Heading</label>
                                <input
                                    value={scene.heading ?? ''}
                                    onChange={(e) => update(i, { heading: e.target.value })}
                                    className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                                    placeholder="On-screen heading"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Narration (spoken)</label>
                                <textarea
                                    value={scene.narration ?? ''}
                                    onChange={(e) => update(i, { narration: e.target.value })}
                                    rows={3}
                                    className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary resize-y"
                                    placeholder="What the narrator says over this scene…"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">On-screen details (JSON)</label>
                                <textarea
                                    value={visualFor(scene, i)}
                                    onChange={(e) => { setVisualText(prev => ({ ...prev, [i]: e.target.value })); setDirty(true); }}
                                    rows={5}
                                    className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs font-mono outline-none focus:border-primary resize-y"
                                />
                            </div>
                        </div>
                    ))}

                    <Button variant="outline" onClick={addScene} className="w-full rounded-xl font-black text-[9px] uppercase tracking-widest h-10 gap-2 border-dashed">
                        <Plus size={14} /> Add scene
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
