// app/[lang]/courses/[id]/CourseContent.tsx
'use client';

import { PlayCircle, Lock, CheckCircle2 } from 'lucide-react';
import { Lesson } from './types';

interface CourseContentProps {
    lessons: Lesson[];
    lessonModules: any[];
    onPlayClick: (module: any) => void;
    hasAccess?: boolean;
    progress?: number;
}

export default function CourseContent({ lessons, lessonModules, onPlayClick, hasAccess, progress }: CourseContentProps) {
    // Calculate completed lessons based on progress
    const completedLessonsCount = Math.floor((progress || 0) / 100 * lessons.length);

    return (
        <div className="space-y-4">
            {lessons.map((lesson, index) => {
                const isUnlocked = hasAccess ? (progress || 0) >= (index * (100 / lessons.length)) : index === 0;
                const isCompleted = (progress || 0) >= ((index + 1) * (100 / lessons.length));

                return (
                    <div
                        key={index}
                        className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all"
                    >
                        <div className="p-5 md:p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : isUnlocked
                                        ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm md:text-base text-zinc-900 dark:text-zinc-200">{lesson.title}</h4>
                                    <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-tighter">{lesson.duration}</p>
                                </div>
                            </div>
                            {!isUnlocked ? (
                                <Lock size={16} className="text-zinc-300 dark:text-zinc-600" />
                            ) : (
                                <button
                                    onClick={() => onPlayClick(lessonModules[index])}
                                    className="focus:outline-none"
                                    aria-label={`Play lesson: ${lesson.title}`}
                                >
                                    <PlayCircle size={20} className="text-primary hover:scale-110 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}