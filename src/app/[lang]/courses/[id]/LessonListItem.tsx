'use client';

import { PlayCircle, Lock } from 'lucide-react';
import { Lesson } from './types';

interface LessonListItemProps {
    lesson: Lesson;
    index: number;
    onPlayClick: (lessonTitle: string) => void;
}

export default function LessonListItem({ lesson, index, onPlayClick }: LessonListItemProps) {
    return (
        <div className="p-5 md:p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500 group-hover:bg-primary group-hover:text-white transition-all">
                    {index + 1}
                </div>
                <div>
                    <h4 className="font-bold text-sm md:text-base text-zinc-900 dark:text-zinc-200">{lesson.title}</h4>
                    <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-tighter">{lesson.duration}</p>
                </div>
            </div>
            {lesson.locked ? (
                <Lock size={16} className="text-zinc-300 dark:text-zinc-600" />
            ) : (
                <button
                    onClick={() => onPlayClick(lesson.title)}
                    className="focus:outline-none"
                    aria-label={`Play lesson: ${lesson.title}`}
                >
                    <PlayCircle size={20} className="text-primary hover:scale-110 transition-transform" />
                </button>
            )}
        </div>
    );
}