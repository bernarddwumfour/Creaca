'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    Sparkles,
    Loader2,
    Settings2,
    Layers,
    Clock,
    Target,
    Library,
    GraduationCap,
    ArrowRight,
    GitBranch,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { apiMessage } from '@/lib/api-message';
import { PageHeader } from '@/widgets/page-header/PageHeader';
import { Spinner } from '@/widgets/loaders/Spinner';

interface CourseModule {
    id: string;
    name: string;
    slug: string;
    description: string;
    order: number;
    status: 'draft' | 'active' | 'inactive';
    created_at: string;
}

interface Prerequisite {
    id: string;
    slug: string;
    name: string;
    difficulty: string;
    is_purchasable: boolean;
    price: string | null;
}

interface CourseDetail {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    duration: number | null;
    status: string;
    subject: { id: string; name: string; slug: string };
    modules: CourseModule[];
    prerequisites: Prerequisite[];
    prerequisites_count: number;
    requirements: string[];
}

interface SiblingCourse {
    id: string;
    slug: string;
    name: string;
    description: string;
    difficulty: string;
    status: 'active' | 'inactive' | 'draft';
}

const STATUS_COLOR: Record<string, string> = {
    draft: 'bg-amber-500/10 text-amber-600',
    active: 'bg-emerald-500/10 text-emerald-600',
    inactive: 'bg-rose-500/10 text-rose-600',
};

const DIFFICULTY_COLOR: Record<string, string> = {
    beginner: 'bg-emerald-500/10 text-emerald-600',
    intermediate: 'bg-blue-500/10 text-blue-600',
    advanced: 'bg-amber-500/10 text-amber-600',
    expert: 'bg-rose-500/10 text-rose-600',
};

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const courseSlug = params.slug as string;
    const [isGenerating, setIsGenerating] = useState(false);

    const queryKey = [ENDPOINTS.COURSES.COURSE_DETAIL, courseSlug];

    const { data: response, isLoading } = useQuery<{ data: CourseDetail }>({
        queryKey,
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.COURSE_DETAIL.replace(':id', courseSlug));
            return data;
        },
    });

    const course = response?.data;
    const subjectSlug = course?.subject?.slug;

    // Sibling courses = the other courses under the same subject. The subject
    // detail endpoint already returns its full `courses[]`, so we reuse it.
    const { data: subjectResponse } = useQuery<{ data: { courses?: SiblingCourse[] } }>({
        queryKey: [ENDPOINTS.SUBJECTS.SUBJECT_DETAIL, subjectSlug],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.SUBJECTS.SUBJECT_DETAIL.replace(':id', subjectSlug as string));
            return data;
        },
        enabled: !!subjectSlug,
    });

    // Exclude the current course from its own sibling list (compare by id,
    // which is stable regardless of the slug-based routing).
    const siblingCourses = (subjectResponse?.data?.courses || []).filter((c) => c.id !== course?.id);

    const invalidate = () => queryClient.invalidateQueries({ queryKey });

    const handleGenerateModules = async () => {
        setIsGenerating(true);
        try {
            const { data } = await api.post(ENDPOINTS.COURSES.GENERATE_MODULES.replace(':id', courseSlug));
            toast.success(data.message || 'Modules generated successfully.');
            invalidate();
        } catch (error: any) {
            toast.error(apiMessage(error, 'Failed to generate modules.'));
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading || !course) {
        return (
            <div className="flex items-center justify-center py-24">
                <Spinner size={32} />
            </div>
        );
    }

    const modules = [...course.modules].sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow={course.subject.name}
                onBack={() => router.push('/admin/subjects/courses')}
                title={<>{course.name}</>}
                description={course.description || 'No description provided.'}
                actions={
                    <Button
                        onClick={handleGenerateModules}
                        disabled={isGenerating}
                        className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all gap-2"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        {modules.length > 0 ? 'Generate More Modules' : 'Generate Modules'}
                    </Button>
                }
            />

            <div className="flex items-center gap-5 text-zinc-400 text-xs font-bold uppercase tracking-widest flex-wrap">
                <Link
                    href="/admin/subjects"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                    <Library size={14} className="text-primary/60" />
                    {course.subject.name}
                </Link>
                <span className="flex items-center gap-1.5">
                    <Layers size={14} className="text-primary/60" />
                    {modules.length} Modules
                </span>
                {course.duration && (
                    <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-primary/60" />
                        {course.duration} min
                    </span>
                )}
                <span className="flex items-center gap-1.5">
                    <Target size={14} className="text-primary/60" />
                    {course.difficulty}
                </span>
            </div>

            {modules.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900/80 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <Sparkles className="mx-auto h-10 w-10 text-zinc-400 mb-4" />
                    <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No modules yet</h3>
                    <p className="text-sm text-zinc-500 mt-1 mb-6">Let AI draft a set of lesson modules for this course.</p>
                    <Button
                        onClick={handleGenerateModules}
                        disabled={isGenerating}
                        className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] gap-2"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        Generate Modules
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {modules.map((module) => (
                        <Card key={module.id} className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-black text-zinc-400 tracking-widest">#{module.order}</span>
                                        <h3 className="font-bold text-sm truncate">{module.name}</h3>
                                        <Badge className={`${STATUS_COLOR[module.status]} border-none text-[9px] font-black uppercase tracking-widest`}>
                                            {module.status}
                                        </Badge>
                                    </div>
                                    {module.description && (
                                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{module.description}</p>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/admin/subjects/modules/${module.id}`)}
                                    className="rounded-xl font-black text-[9px] uppercase tracking-widest h-9 px-4 gap-2 shrink-0"
                                >
                                    <Settings2 size={14} /> Manage Content
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Prerequisites — courses a student must complete first */}
            {course.prerequisites.length > 0 && (
                <div className="pt-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                        <GitBranch size={14} className="text-primary/60" />
                        Prerequisites ({course.prerequisites_count})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {course.prerequisites.map((prereq) => (
                            <Link
                                key={prereq.id}
                                href={`/admin/subjects/courses/${prereq.slug}`}
                                className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                            >
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm truncate">{prereq.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${DIFFICULTY_COLOR[prereq.difficulty] || 'bg-zinc-100 text-zinc-600'}`}>
                                            {prereq.difficulty}
                                        </span>
                                        {prereq.is_purchasable && prereq.price && (
                                            <Badge variant="outline" className="text-[9px]">${prereq.price}</Badge>
                                        )}
                                    </div>
                                </div>
                                <ArrowRight size={14} className="text-zinc-400 group-hover:text-primary transition-colors shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Other courses under the same subject */}
            {siblingCourses.length > 0 && (
                <div className="pt-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
                        Other courses in {course.subject.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {siblingCourses.map((sibling) => (
                            <Link
                                key={sibling.id}
                                href={`/admin/subjects/courses/${sibling.slug}`}
                                className="group flex flex-col gap-3 p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary shrink-0">
                                        <GraduationCap size={20} />
                                    </div>
                                    <Badge className={`${STATUS_COLOR[sibling.status]} border-none text-[9px] font-black uppercase tracking-widest`}>
                                        {sibling.status}
                                    </Badge>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm truncate">{sibling.name}</h4>
                                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                                        {sibling.description || 'No description.'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${DIFFICULTY_COLOR[sibling.difficulty] || 'bg-zinc-100 text-zinc-600'}`}>
                                        {sibling.difficulty}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-primary transition-colors">
                                        Open <ArrowRight size={12} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
