'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Sparkles,
    Check,
    Loader2,
    BookOpen,
    HelpCircle,
    Layers,
    Rocket,
    Archive,
    AlertTriangle,
    Clapperboard,
    Film,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { apiMessage } from '@/lib/api-message';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/widgets/page-header/PageHeader';
import { MarkdownContent } from '@/widgets/markdown-content/MarkdownContent';
import { Spinner } from '@/widgets/loaders/Spinner';
import type { VideoScript } from './ScriptStudio';

// The Script Studio embeds @remotion/player, which requires the DOM and pulls
// in the whole Remotion runtime — load it client-side only, so it never runs
// during SSR and stays out of the main page bundle.
const ScriptStudio = dynamic(() => import('./ScriptStudio').then(m => m.ScriptStudio), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center py-12">
            <Spinner size={28} />
        </div>
    ),
});

type ContentStatus = 'none' | 'draft' | 'approved';
type GenerationJobStatus = 'pending' | 'running' | 'succeeded' | 'failed';

interface ContentBlock {
    id: string; block_type: string; title: string; body: string; code: string;
    language: string; media_url: string; caption: string; order: number; is_approved: boolean;
}
interface AnswerChoice { id: string; text: string; latex: string; is_correct: boolean }
interface Question {
    id: string; question_type: string; text: string; hint: string; order: number;
    marks: number; is_approved: boolean; choices: AnswerChoice[];
    solution: { text: string; explanation: string } | null;
}
interface Flashcard { id: string; front: string; back: string; hint: string; order: number; is_approved: boolean }
interface Video { id: string; url: string; duration_seconds: number; is_approved: boolean }
interface GenerationJob {
    id: string; content_type: 'lesson' | 'quiz' | 'flashcards' | 'script' | 'video'; status: GenerationJobStatus;
    error_message: string; created_at: string; updated_at: string;
}
interface ModuleDetail {
    id: string; name: string; description: string; order: number; status: 'draft' | 'active' | 'inactive';
    passing_score: number; course: { id: string; name: string };
    content_blocks: ContentBlock[]; questions: Question[]; flashcards: Flashcard[]; videos: Video[];
    scripts: VideoScript[];
    generation_jobs: GenerationJob[];
}

type ContentTypeKey = 'lesson' | 'quiz' | 'flashcards' | 'script' | 'video';

const CONTENT_TYPES: { key: ContentTypeKey; label: string; icon: React.ElementType }[] = [
    { key: 'lesson', label: 'Lesson', icon: BookOpen },
    { key: 'quiz', label: 'Quiz', icon: HelpCircle },
    { key: 'flashcards', label: 'Flashcards', icon: Layers },
    { key: 'script', label: 'Video Script', icon: Film },
    { key: 'video', label: 'Video', icon: Clapperboard },
];

// counts of draft/approved rows for each content type, plus the gate that must
// be satisfied before this type can be generated.
function countsFor(module: ModuleDetail, key: ContentTypeKey): { draft: number; approved: number } {
    const rows: { is_approved: boolean }[] =
        key === 'lesson' ? module.content_blocks
            : key === 'quiz' ? module.questions
                : key === 'flashcards' ? module.flashcards
                    : key === 'script' ? module.scripts
                        : module.videos;
    return {
        draft: rows.filter(r => !r.is_approved).length,
        approved: rows.filter(r => r.is_approved).length,
    };
}

// Video narrates the approved lesson and renders via Remotion — much
// slower than a single OpenAI JSON call (TTS per block + a full render),
// so it gets a generous per-request timeout instead of the axios default.
const VIDEO_GENERATE_TIMEOUT_MS = 5 * 60 * 1000;

export default function ModuleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const moduleId = params.id as string;
    const [pendingType, setPendingType] = useState<string | null>(null);

    const queryKey = [ENDPOINTS.MODULES.ADMIN_MODULE_DETAIL, moduleId];

    const { data: response, isLoading } = useQuery<{ data: ModuleDetail }>({
        queryKey,
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.MODULES.ADMIN_MODULE_DETAIL.replace(':id', moduleId));
            return data;
        },
        refetchInterval: (query) => {
            const jobs = query.state.data?.data?.generation_jobs || [];
            const hasActiveJob = jobs.some(j => j.status === 'pending' || j.status === 'running');
            return hasActiveJob ? 3000 : false;
        },
    });

    const module = response?.data;

    const invalidate = () => queryClient.invalidateQueries({ queryKey });

    if (isLoading || !module) {
        return (
            <div className="flex items-center justify-center py-24">
                <Spinner size={32} />
            </div>
        );
    }

    const latestJobFor = (type: string) =>
        module.generation_jobs.filter(j => j.content_type === type)[0];

    const handleGenerate = async (type: ContentTypeKey) => {
        setPendingType(type);
        try {
            const { data } = await api.post(
                ENDPOINTS.MODULES.TRIGGER_GENERATION.replace(':id', moduleId),
                { content_types: [type] },
                type === 'video' ? { timeout: VIDEO_GENERATE_TIMEOUT_MS } : undefined
            );
            if (data.data?.warnings?.length) {
                data.data.warnings.forEach((w: string) => toast.warning(w));
            } else {
                toast.success(data.message || `Generating ${type}...`);
            }
            invalidate();
        } catch (error: any) {
            toast.error(apiMessage(error, `Failed to start ${type} generation.`));
        } finally {
            setPendingType(null);
        }
    };

    const handleApprove = async (type: ContentTypeKey) => {
        try {
            const { data } = await api.post(ENDPOINTS.MODULES.APPROVE_CONTENT.replace(':id', moduleId), {
                content_type: type,
            });
            toast.success(data.message || `${type} approved.`);
            invalidate();
        } catch (error: any) {
            toast.error(apiMessage(error, `Failed to approve ${type}.`));
        }
    };

    const handlePublishToggle = async () => {
        const endpoint = module.status === 'active' ? ENDPOINTS.MODULES.UNPUBLISH_MODULE : ENDPOINTS.MODULES.PUBLISH_MODULE;
        try {
            const { data } = await api.post(endpoint.replace(':id', moduleId));
            toast.success(data.message || (module.status === 'active' ? 'Module unpublished.' : 'Module published.'));
            invalidate();
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to update module status."));
        }
    };

    const statusColor: Record<ContentStatus, string> = {
        none: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500',
        draft: 'bg-amber-500/10 text-amber-600',
        approved: 'bg-emerald-500/10 text-emerald-600',
    };

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow={module.course.name}
                onBack={() => router.push('/admin/subjects/modules')}
                title={<>{module.name}</>}
                description={module.description || 'No description provided.'}
                actions={
                    <Button
                        onClick={handlePublishToggle}
                        variant={module.status === 'active' ? 'outline' : 'default'}
                        className="rounded-xl font-black uppercase tracking-widest h-11 px-6 text-[10px] transition-all gap-2"
                    >
                        {module.status === 'active' ? <Archive size={16} /> : <Rocket size={16} />}
                        {module.status === 'active' ? 'Unpublish' : 'Publish Module'}
                    </Button>
                }
            />

            {module.status === 'active' && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                    <Check size={16} /> This module is live — students can see its approved content.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {CONTENT_TYPES.map(({ key, label, icon: Icon }) => {
                    const job = latestJobFor(key);
                    const isRunning = job?.status === 'pending' || job?.status === 'running';
                    const isGenerating = pendingType === key || isRunning;

                    const { draft: draftCount, approved: approvedCount } = countsFor(module, key);
                    const status: ContentStatus = approvedCount > 0 ? 'approved' : draftCount > 0 ? 'draft' : 'none';

                    // Prerequisite gates: a script needs approved lesson content;
                    // a video needs an approved script.
                    const lessonApproved = module.content_blocks.some(b => b.is_approved);
                    const scriptApproved = module.scripts.some(s => s.is_approved);
                    const blockedReason = key === 'script' && !lessonApproved
                        ? 'Approve the lesson content first — the script is built from it.'
                        : key === 'video' && !scriptApproved
                            ? 'Approve a video script first — the video renders from it.'
                            : null;

                    return (
                        <Card key={key} className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-black flex items-center gap-2">
                                        <Icon size={16} className="text-primary" /> {label}
                                    </CardTitle>
                                    <Badge className={`${statusColor[status]} border-none text-[9px] font-black uppercase tracking-widest`}>
                                        {status}
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                    {approvedCount > 0 && `${approvedCount} live`}
                                    {approvedCount > 0 && draftCount > 0 && ' · '}
                                    {draftCount > 0 && `${draftCount} pending review`}
                                    {approvedCount === 0 && draftCount === 0 && 'Nothing generated yet'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {blockedReason ? (
                                    <div className="flex items-start gap-2 text-[10px] font-bold text-amber-600 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
                                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                        {blockedReason}
                                    </div>
                                ) : job?.status === 'failed' && (
                                    <div className="flex items-start gap-2 text-[10px] font-bold text-rose-600 bg-rose-500/5 border border-rose-500/20 rounded-lg p-2.5">
                                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                        {job.error_message || 'Generation failed.'}
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-full rounded-xl font-black text-[9px] uppercase tracking-widest h-10 gap-2"
                                    disabled={isGenerating || !!blockedReason}
                                    onClick={() => handleGenerate(key)}
                                >
                                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    {key === 'video'
                                        ? (approvedCount > 0 || draftCount > 0 ? 'Re-render' : 'Render')
                                        : (approvedCount > 0 || draftCount > 0 ? 'Regenerate' : 'Generate')}
                                </Button>
                                {/* Script is reviewed/approved in the studio below; every other
                                    type approves its draft inline. */}
                                {draftCount > 0 && key !== 'script' && (
                                    <Button
                                        className="w-full rounded-xl font-black text-[9px] uppercase tracking-widest h-10 gap-2 bg-primary hover:bg-orange-600"
                                        onClick={() => handleApprove(key)}
                                    >
                                        <Check size={14} /> Approve draft
                                    </Button>
                                )}
                                {key === 'script' && (draftCount > 0 || approvedCount > 0) && (
                                    <p className="text-[9px] text-zinc-400 text-center">Edit &amp; approve in the studio below.</p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <LessonPreview module={module} />
            {module.scripts.length > 0 && (
                <ScriptStudio moduleId={moduleId} scripts={module.scripts} onChanged={invalidate} />
            )}
            <QuizPreview module={module} />
            <FlashcardsPreview module={module} />
            <VideoPreview module={module} />
        </div>
    );
}

function VideoPreview({ module }: { module: ModuleDetail }) {
    if (module.videos.length === 0) return null;
    const approved = module.videos.filter(v => v.is_approved);
    const draft = module.videos.filter(v => !v.is_approved);

    const renderVideo = (video: Video, pending: boolean) => (
        <div key={video.id} className={`rounded-xl p-4 border space-y-2 ${pending ? 'border-dashed border-amber-500/30' : 'border-zinc-100 dark:border-zinc-800'}`}>
            <video controls className="w-full rounded-lg bg-black" src={video.url} />
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
            </p>
        </div>
    );

    return (
        <Card className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle className="text-sm font-black flex items-center gap-2"><Clapperboard size={16} className="text-primary" /> Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {draft.length > 0 && (
                    <div className="space-y-3">
                        <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black uppercase tracking-widest">Pending Review</Badge>
                        {draft.map(v => renderVideo(v, true))}
                    </div>
                )}
                {approved.length > 0 && (
                    <div className="space-y-3">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest">Live</Badge>
                        {approved.map(v => renderVideo(v, false))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function LessonPreview({ module }: { module: ModuleDetail }) {
    if (module.content_blocks.length === 0) return null;
    const approved = module.content_blocks.filter(b => b.is_approved);
    const draft = module.content_blocks.filter(b => !b.is_approved);

    return (
        <Card className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle className="text-sm font-black flex items-center gap-2"><BookOpen size={16} className="text-primary" /> Lesson Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {draft.length > 0 && (
                    <div className="space-y-4">
                        <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black uppercase tracking-widest">Pending Review</Badge>
                        {draft.sort((a, b) => a.order - b.order).map(block => (
                            <div key={block.id} className="border border-dashed border-amber-500/30 rounded-xl p-4">
                                {block.title && <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">{block.title}</p>}
                                <MarkdownContent content={block.body} />
                                {block.code && <pre className="mt-2 text-xs bg-zinc-950 text-zinc-100 rounded-lg p-3 overflow-x-auto"><code>{block.code}</code></pre>}
                            </div>
                        ))}
                    </div>
                )}
                {approved.length > 0 && (
                    <div className="space-y-4">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest">Live</Badge>
                        {approved.sort((a, b) => a.order - b.order).map(block => (
                            <div key={block.id} className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-4">
                                {block.title && <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">{block.title}</p>}
                                <MarkdownContent content={block.body} />
                                {block.code && <pre className="mt-2 text-xs bg-zinc-950 text-zinc-100 rounded-lg p-3 overflow-x-auto"><code>{block.code}</code></pre>}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function QuizPreview({ module }: { module: ModuleDetail }) {
    if (module.questions.length === 0) return null;
    const approved = module.questions.filter(q => q.is_approved);
    const draft = module.questions.filter(q => !q.is_approved);

    const renderQuestion = (q: Question, pending: boolean) => (
        <div key={q.id} className={`rounded-xl p-4 border ${pending ? 'border-dashed border-amber-500/30' : 'border-zinc-100 dark:border-zinc-800'}`}>
            <p className="text-sm font-bold mb-3">{q.order + 1}. {q.text}</p>
            <div className="space-y-1.5">
                {q.choices.map(c => (
                    <div key={c.id} className={`text-xs px-3 py-2 rounded-lg ${c.is_correct ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500'}`}>
                        {c.is_correct && <Check size={12} className="inline mr-1.5" />}{c.text}
                    </div>
                ))}
            </div>
            {q.solution?.explanation && (
                <p className="text-[11px] text-zinc-400 mt-2 italic">{q.solution.explanation}</p>
            )}
        </div>
    );

    return (
        <Card className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle className="text-sm font-black flex items-center gap-2"><HelpCircle size={16} className="text-primary" /> Quiz Questions</CardTitle>
                <CardDescription className="text-xs">Passing score: {module.passing_score}%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {draft.length > 0 && (
                    <div className="space-y-3">
                        <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black uppercase tracking-widest">Pending Review</Badge>
                        {draft.sort((a, b) => a.order - b.order).map(q => renderQuestion(q, true))}
                    </div>
                )}
                {approved.length > 0 && (
                    <div className="space-y-3">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest">Live</Badge>
                        {approved.sort((a, b) => a.order - b.order).map(q => renderQuestion(q, false))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function FlashcardsPreview({ module }: { module: ModuleDetail }) {
    if (module.flashcards.length === 0) return null;
    const approved = module.flashcards.filter(f => f.is_approved);
    const draft = module.flashcards.filter(f => !f.is_approved);

    const renderCard = (card: Flashcard, pending: boolean) => (
        <div key={card.id} className={`rounded-xl p-4 border space-y-2 ${pending ? 'border-dashed border-amber-500/30' : 'border-zinc-100 dark:border-zinc-800'}`}>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Front</p>
            <p className="text-sm font-bold">{card.front}</p>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 pt-1">Back</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{card.back}</p>
        </div>
    );

    return (
        <Card className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle className="text-sm font-black flex items-center gap-2"><Layers size={16} className="text-primary" /> Flashcards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {draft.length > 0 && (
                    <div className="space-y-3">
                        <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black uppercase tracking-widest">Pending Review</Badge>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {draft.sort((a, b) => a.order - b.order).map(c => renderCard(c, true))}
                        </div>
                    </div>
                )}
                {approved.length > 0 && (
                    <div className="space-y-3">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest">Live</Badge>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {approved.sort((a, b) => a.order - b.order).map(c => renderCard(c, false))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
