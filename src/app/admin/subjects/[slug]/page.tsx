'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Layers,
    GraduationCap,
    ArrowRight,
    Settings2,
    Plus,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ENDPOINTS } from '@/lib/endpoints';
import api from '@/lib/axios';
import { PageHeader } from '@/widgets/page-header/PageHeader';
import { Spinner } from '@/widgets/loaders/Spinner';
import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';
import { CourseForm } from '../(components)/CourseForm';

interface SubjectCourse {
    id: string;
    slug: string;
    name: string;
    description: string;
    difficulty: string;
    status: 'active' | 'inactive' | 'draft';
    duration: number | null;
}

interface SubjectDetail {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: 'active' | 'inactive' | 'draft';
    course_count: number;
    courses?: SubjectCourse[];
}

const STATUS_COLOR: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-600',
    inactive: 'bg-rose-500/10 text-rose-600',
    draft: 'bg-amber-500/10 text-amber-600',
};

const DIFFICULTY_COLOR: Record<string, string> = {
    beginner: 'bg-emerald-500/10 text-emerald-600',
    intermediate: 'bg-blue-500/10 text-blue-600',
    advanced: 'bg-amber-500/10 text-amber-600',
    expert: 'bg-rose-500/10 text-rose-600',
};

export default function SubjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const subjectSlug = params.slug as string;
    const [addCourseOpen, setAddCourseOpen] = useState(false);

    const queryKey = [ENDPOINTS.SUBJECTS.SUBJECT_DETAIL, subjectSlug];

    const { data: response, isLoading } = useQuery<{ data: SubjectDetail }>({
        queryKey,
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.SUBJECTS.SUBJECT_DETAIL.replace(':id', subjectSlug));
            return data;
        },
    });

    if (isLoading || !response?.data) {
        return (
            <div className="flex items-center justify-center py-24">
                <Spinner size={32} />
            </div>
        );
    }

    const subject = response.data;
    const courses = subject.courses ?? [];

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="Subject"
                onBack={() => router.push('/admin/subjects')}
                title={
                    <span className="flex items-center gap-3 flex-wrap">
                        {subject.name}
                        <Badge className={`${STATUS_COLOR[subject.status]} border-none text-[10px] font-black uppercase tracking-widest`}>
                            {subject.status}
                        </Badge>
                    </span>
                }
                description={subject.description || 'No description provided.'}
                actions={
                    <Button
                        onClick={() => setAddCourseOpen(true)}
                        className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all gap-2"
                    >
                        <Plus size={16} /> Add Course
                    </Button>
                }
            />

            <div className="flex items-center gap-5 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                    <Layers size={14} className="text-primary/60" />
                    {subject.course_count} Courses
                </span>
            </div>

            <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
                    Courses under this subject
                </h3>

                {courses.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <GraduationCap className="mx-auto h-10 w-10 text-zinc-400 mb-3" />
                        <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-400">No courses yet</h4>
                        <p className="text-xs text-zinc-500 mt-1">This subject has no courses under it.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/admin/subjects/courses/${course.slug}`}
                                className="group flex flex-col gap-3 p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary shrink-0">
                                        <GraduationCap size={20} />
                                    </div>
                                    <Badge className={`${STATUS_COLOR[course.status]} border-none text-[9px] font-black uppercase tracking-widest`}>
                                        {course.status}
                                    </Badge>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm truncate">{course.name}</h4>
                                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                                        {course.description || 'No description.'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${DIFFICULTY_COLOR[course.difficulty] || 'bg-zinc-100 text-zinc-600'}`}>
                                        {course.difficulty}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-primary transition-colors">
                                        <Settings2 size={12} /> Manage <ArrowRight size={12} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <CustomDialog
                title="Add Course"
                description={`Add a new course under ${subject.name}.`}
                open={addCourseOpen}
                onOpenChange={setAddCourseOpen}
            >
                <CourseForm
                    subjectId={subject.id}
                    subjectTitle={subject.name}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey });
                        setAddCourseOpen(false);
                    }}
                />
            </CustomDialog>
        </div>
    );
}
