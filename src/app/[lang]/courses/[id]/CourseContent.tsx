'use client';

import { useState } from 'react';
import LessonListItem from './LessonListItem';
import LessonModal from './LessonModal';
import { Lesson } from './types';

interface CourseContentProps {
    lessons: Lesson[];
    lessonModules: Record<string, any>;
}

export default function CourseContent({ lessons, lessonModules }: CourseContentProps) {
    const [selectedLesson, setSelectedLesson] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePlayClick = (lessonTitle: string) => {
        const lessonData = lessonModules[lessonTitle];
        
        if (lessonData) {
            setSelectedLesson(lessonData);
            setIsModalOpen(true);
        } else {
            alert('This lesson is coming soon!');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLesson(null);
    };

    return (
        <>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden shadow-sm">
                {lessons.map((lesson, idx) => (
                    <LessonListItem
                        key={idx}
                        lesson={lesson}
                        index={idx}
                        onPlayClick={handlePlayClick}
                    />
                ))}
            </div>

            {selectedLesson && (
                <LessonModal
                    moduleData={selectedLesson}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
}