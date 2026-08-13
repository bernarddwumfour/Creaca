'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Loader2,
    Lock,
    BookOpen,
    HelpCircle,
    Layers,
    ChevronLeft,
    ChevronRight,
    Shuffle,
    X,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { apiMessage } from '@/lib/api-message';
import { useAuth } from '@/context/AuthContext';
import { MarkdownContent } from '@/widgets/markdown-content/MarkdownContent';
import { Spinner } from '@/widgets/loaders/Spinner';

interface ContentBlock {
    id: string; block_type: string; title: string; body: string; code: string; language: string; order: number;
}
interface AnswerChoice { id: string; text: string }
interface Question { id: string; question_type: string; text: string; order: number; choices: AnswerChoice[] }
interface Flashcard { id: string; front: string; back: string; hint: string; order: number }
interface ModuleDetail {
    id: string; name: string; description: string; order: number; passing_score: number;
    course: { id: string; name: string };
    content_blocks: ContentBlock[]; questions: Question[]; flashcards: Flashcard[];
    progress: { status: string; completed_at: string | null };
}
interface CourseModule { id: string; name: string; order: number }

export default function LessonDetailClient({ courseId, moduleId, lang }: { courseId: string; moduleId: string; lang: string }) {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('lesson');
    const [isCompleting, setIsCompleting] = useState(false);

    const moduleQuery = useQuery<{ data: ModuleDetail }>({
        queryKey: [ENDPOINTS.MODULES.MODULE_DETAIL, moduleId],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.MODULES.MODULE_DETAIL.replace(':id', moduleId));
            return data;
        },
        enabled: !!user,
        retry: false,
    });

    const courseQuery = useQuery({
        queryKey: [ENDPOINTS.COURSES.COURSE_DETAIL, courseId],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.COURSE_DETAIL.replace(':id', courseId));
            return data;
        },
        enabled: !!user,
    });

    const courseModules: CourseModule[] = (courseQuery.data?.data?.modules || []).slice().sort((a: CourseModule, b: CourseModule) => a.order - b.order);
    const currentIndex = courseModules.findIndex(m => m.id === moduleId);
    const previousModule = currentIndex > 0 ? courseModules[currentIndex - 1] : undefined;
    const nextModule = currentIndex >= 0 && currentIndex < courseModules.length - 1 ? courseModules[currentIndex + 1] : undefined;

    const handleMarkComplete = async () => {
        setIsCompleting(true);
        try {
            await api.post(ENDPOINTS.MODULES.MARK_COMPLETE.replace(':id', moduleId));
            toast.success('Module marked complete');
            queryClient.invalidateQueries({ queryKey: [ENDPOINTS.MODULES.MODULE_DETAIL, moduleId] });
            if (nextModule) {
                router.push(`/${lang}/courses/${courseId}/lessons/${nextModule.id}`);
            } else {
                router.push(`/${lang}/courses/${courseId}`);
            }
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to mark module complete."));
        } finally {
            setIsCompleting(false);
        }
    };

    if (authLoading) {
        return (
            <main className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center">
                <Spinner size={32} />
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center px-6">
                <div className="text-center space-y-4">
                    <Lock className="mx-auto h-12 w-12 text-zinc-400" />
                    <h1 className="text-xl font-bold">Log in to access this lesson</h1>
                    <div className="flex gap-3 justify-center">
                        <Button asChild variant="outline"><Link href={`/${lang}/login`}>Log In</Link></Button>
                        <Button asChild><Link href={`/${lang}/signup`}>Sign Up</Link></Button>
                    </div>
                </div>
            </main>
        );
    }

    if (moduleQuery.isLoading || (!moduleQuery.data && !moduleQuery.isError)) {
        return (
            <main className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center">
                <Spinner size={32} />
            </main>
        );
    }

    if (moduleQuery.isError) {
        const status = (moduleQuery.error as any)?.response?.status;
        return (
            <main className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center px-6">
                <div className="text-center space-y-4 max-w-md">
                    <Lock className="mx-auto h-12 w-12 text-zinc-400" />
                    <h1 className="text-xl font-bold">
                        {status === 403 ? "You don't have access to this course" : "Lesson not found"}
                    </h1>
                    <p className="text-sm text-zinc-500">
                        {status === 403
                            ? "Subscribe or purchase this course to access its lessons."
                            : "This lesson may not be published yet."}
                    </p>
                    <Button asChild variant="outline">
                        <Link href={`/${lang}/courses/${courseId}`}><ArrowLeft className="mr-2" size={16} /> Back to course</Link>
                    </Button>
                </div>
            </main>
        );
    }

    const module = moduleQuery.data!.data;
    const isCompleted = module.progress?.status === 'completed';

    return (
        <main className="min-h-screen bg-white dark:bg-[#09090b] pt-24 pb-16">
            <div className="container mx-auto px-6 max-w-4xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button asChild variant="ghost">
                        <Link href={`/${lang}/courses/${courseId}`}><ArrowLeft className="mr-2" size={16} /> Back to course</Link>
                    </Button>
                    {isCompleted && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none gap-1.5">
                            <Check size={12} /> Completed
                        </Badge>
                    )}
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 bg-white dark:bg-zinc-950">
                    <div className="mb-7 flex flex-col justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6 sm:flex-row sm:items-start">
                        <div>
                            <Badge variant="outline">Module {module.order + 1}</Badge>
                            <h1 className="mt-3 text-2xl md:text-3xl font-black tracking-tight">{module.name}</h1>
                            {module.description && (
                                <p className="mt-3 text-zinc-500 dark:text-zinc-400">{module.description}</p>
                            )}
                        </div>
                        <Button
                            variant={isCompleted ? 'outline' : 'default'}
                            disabled={isCompleting}
                            onClick={handleMarkComplete}
                            className="shrink-0"
                        >
                            {isCompleting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                            {isCompleted ? 'Completed' : nextModule ? 'Complete & next' : 'Complete module'}
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="lesson" className="gap-2"><BookOpen size={14} /> Lesson</TabsTrigger>
                            <TabsTrigger value="quiz" className="gap-2" disabled={module.questions.length === 0}><HelpCircle size={14} /> Quiz</TabsTrigger>
                            <TabsTrigger value="flashcards" className="gap-2" disabled={module.flashcards.length === 0}><Layers size={14} /> Flashcards</TabsTrigger>
                        </TabsList>

                        <TabsContent value="lesson" className="mt-6 space-y-6">
                            {module.content_blocks.length === 0 ? (
                                <p className="text-sm text-zinc-500 text-center py-12">This lesson's content isn't ready yet.</p>
                            ) : (
                                module.content_blocks.sort((a, b) => a.order - b.order).map(block => (
                                    <div key={block.id}>
                                        {block.title && <h3 className="text-lg font-bold mb-2">{block.title}</h3>}
                                        <MarkdownContent content={block.body} />
                                        {block.code && (
                                            <pre className="mt-3 text-xs bg-zinc-950 text-zinc-100 rounded-xl p-4 overflow-x-auto">
                                                <code>{block.code}</code>
                                            </pre>
                                        )}
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="quiz" className="mt-6">
                            <QuizTab moduleId={moduleId} questions={module.questions} passingScore={module.passing_score} />
                        </TabsContent>

                        <TabsContent value="flashcards" className="mt-6">
                            <FlashcardsTab cards={module.flashcards} />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-5">
                    {previousModule ? (
                        <Button asChild variant="outline">
                            <Link href={`/${lang}/courses/${courseId}/lessons/${previousModule.id}`}>
                                <ArrowLeft size={16} className="mr-2" /> Previous
                            </Link>
                        </Button>
                    ) : <span />}
                    {nextModule ? (
                        <Button asChild variant="outline">
                            <Link href={`/${lang}/courses/${courseId}/lessons/${nextModule.id}`}>
                                Next <ArrowRight size={16} className="ml-2" />
                            </Link>
                        </Button>
                    ) : <span />}
                </div>
            </div>
        </main>
    );
}

function QuizTab({ moduleId, questions, passingScore }: { moduleId: string; questions: Question[]; passingScore: number }) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; passed: boolean; correct_count: number; total: number; per_question_results: { question_id: string; is_correct: boolean; correct_choice_id: string | null }[] } | null>(null);

    if (questions.length === 0) {
        return <p className="text-sm text-zinc-500 text-center py-12">No quiz questions for this module yet.</p>;
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const { data } = await api.post(ENDPOINTS.MODULES.SUBMIT_QUIZ.replace(':id', moduleId), {
                answers: Object.entries(answers).map(([question_id, choice_id]) => ({ question_id, choice_id })),
            });
            setResult(data.data);
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to submit quiz."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setResult(null);
    };

    if (result) {
        return (
            <div className="space-y-6">
                <div className="text-center py-8 space-y-3">
                    <span className={`text-4xl font-black ${result.passed ? 'text-emerald-500' : 'text-rose-500'}`}>{result.score}%</span>
                    <p className="font-bold">{result.passed ? 'Passed! 🎉' : `Not quite — ${passingScore}% needed to pass`}</p>
                    <p className="text-sm text-zinc-500">{result.correct_count}/{result.total} correct</p>
                    <Button variant="outline" onClick={handleRetry}><RotateCcw size={14} className="mr-2" /> Retry quiz</Button>
                </div>
                <div className="space-y-3">
                    {questions.sort((a, b) => a.order - b.order).map((q, idx) => {
                        const questionResult = result.per_question_results.find(r => r.question_id === q.id);
                        return (
                            <div key={q.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                                <div className="flex items-start gap-2 mb-2">
                                    {questionResult?.is_correct
                                        ? <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        : <X size={16} className="text-rose-500 shrink-0 mt-0.5" />}
                                    <p className="text-sm font-bold">{idx + 1}. {q.text}</p>
                                </div>
                                <div className="space-y-1.5 pl-6">
                                    {q.choices.map(choice => (
                                        <div
                                            key={choice.id}
                                            className={`text-xs px-3 py-2 rounded-lg ${choice.id === questionResult?.correct_choice_id
                                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                                                : choice.id === answers[q.id]
                                                    ? 'bg-rose-500/10 text-rose-600'
                                                    : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500'
                                                }`}
                                        >
                                            {choice.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const allAnswered = questions.every(q => answers[q.id]);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">{Object.keys(answers).length}/{questions.length} answered</p>
                <Badge variant="outline">Pass: {passingScore}%</Badge>
            </div>
            {questions.sort((a, b) => a.order - b.order).map((q, idx) => (
                <div key={q.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                    <p className="text-sm font-bold mb-3">{idx + 1}. {q.text}</p>
                    <div className="space-y-2">
                        {q.choices.map((choice, optIdx) => (
                            <button
                                key={choice.id}
                                type="button"
                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: choice.id }))}
                                className={`w-full text-left p-3 border rounded-lg text-sm transition-colors ${answers[q.id] === choice.id ? 'border-primary bg-primary/5' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[10px] shrink-0">
                                        {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    {choice.text}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            <Button className="w-full" disabled={!allAnswered || isSubmitting} onClick={handleSubmit}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                Submit Quiz
            </Button>
        </div>
    );
}

function FlashcardsTab({ cards }: { cards: Flashcard[] }) {
    const [order, setOrder] = useState(() => cards.slice().sort((a, b) => a.order - b.order).map(c => c.id));
    const [activeIndex, setActiveIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [isRating, setIsRating] = useState(false);

    if (cards.length === 0) {
        return <p className="text-sm text-zinc-500 text-center py-12">No flashcards for this module yet.</p>;
    }

    const cardsById = new Map(cards.map(c => [c.id, c]));
    const current = cardsById.get(order[activeIndex]);

    const goTo = (index: number) => {
        setActiveIndex(Math.max(0, Math.min(order.length - 1, index)));
        setRevealed(false);
    };

    const handleRate = async (rating: 'again' | 'good' | 'easy') => {
        if (!current) return;
        setIsRating(true);
        try {
            await api.post(ENDPOINTS.MODULES.REVIEW_FLASHCARD.replace(':id', current.id), { rating });
            goTo(activeIndex + 1 < order.length ? activeIndex + 1 : activeIndex);
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to record review."));
        } finally {
            setIsRating(false);
        }
    };

    if (!current) return null;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">Card {activeIndex + 1} of {order.length}</p>
                <Button variant="ghost" size="sm" onClick={() => setOrder(o => [...o].sort(() => Math.random() - 0.5))}>
                    <Shuffle size={14} className="mr-1.5" /> Shuffle
                </Button>
            </div>

            <button
                type="button"
                onClick={() => setRevealed(r => !r)}
                className="w-full min-h-[220px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center p-8 text-center"
            >
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">{revealed ? 'Back' : 'Front'}</p>
                    <p className="text-lg font-bold">{revealed ? current.back : current.front}</p>
                    {!revealed && current.hint && <p className="text-xs text-zinc-400 mt-3 italic">Hint: {current.hint}</p>}
                    {!revealed && <p className="text-xs text-primary mt-4">Tap to reveal</p>}
                </div>
            </button>

            {revealed ? (
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" disabled={isRating} onClick={() => handleRate('again')} className="text-rose-600 border-rose-200">Again</Button>
                    <Button variant="outline" disabled={isRating} onClick={() => handleRate('good')} className="text-amber-600 border-amber-200">Good</Button>
                    <Button variant="outline" disabled={isRating} onClick={() => handleRate('easy')} className="text-emerald-600 border-emerald-200">Easy</Button>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" disabled={activeIndex === 0} onClick={() => goTo(activeIndex - 1)}>
                        <ChevronLeft size={14} className="mr-1" /> Previous
                    </Button>
                    <Button variant="ghost" size="sm" disabled={activeIndex >= order.length - 1} onClick={() => goTo(activeIndex + 1)}>
                        Next <ChevronRight size={14} className="ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}
