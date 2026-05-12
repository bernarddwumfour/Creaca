// CourseCard.tsx - Updated
'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Zap, ArrowRightCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lang } from '@/lib/dictionary/dictionary';

interface Course {
    id: string;
    name: string;
    slug: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    duration: number | null;
    status: string;
    is_purchasable: boolean;
    price: number;
    subject: {
        id: string;
        name: string;
        slug: string;
    };
}

interface CourseCardProps {
    course: Course;
    lang: Lang;
    isRegistered: boolean;
    isPurchased: boolean;
    isRegistering: boolean;
    isPurchasing: boolean;
    onRegister: (course: Course) => void;
    onPurchase: (course: Course) => void;
    t: any;
}

const getDifficultyInfo = (difficulty: string) => {
    const map: Record<string, { display: string; level: number }> = {
        beginner: { display: 'Beginner', level: 1 },
        intermediate: { display: 'Intermediate', level: 2 },
        advanced: { display: 'Advanced', level: 3 },
        expert: { display: 'Expert', level: 4 },
    };
    return map[difficulty] || { display: difficulty, level: 2 };
};

const getDifficultyColor = (difficulty: string) => {
    const map: Record<string, string> = {
        beginner: 'bg-emerald-500/10 text-emerald-600',
        intermediate: 'bg-blue-500/10 text-blue-600',
        advanced: 'bg-amber-500/10 text-amber-600',
        expert: 'bg-rose-500/10 text-rose-600',
    };
    return map[difficulty] || 'bg-zinc-100 text-zinc-600';
};

export function CourseCard({
    course,
    lang,
    isRegistered,
    isPurchased,
    isRegistering,
    isPurchasing,
    onRegister,
    onPurchase,
    t
}: CourseCardProps) {
    const difficultyInfo = getDifficultyInfo(course.difficulty);
    const hasAccess = isRegistered || isPurchased;

    return (
        <div className="group p-[3px] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-slate-100/50 dark:bg-zinc-900/50 relative z-10">
            <div className="absolute w-[98%] h-[98%] top-[1%] left-[1%] overflow-hidden bg-slate-100 dark:bg-zinc-900 shadow-xs hover:shadow-sm rounded-sm" />
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '3s' }} />

            <div className="relative h-full bg-white/50 dark:bg-[#111114]/80 backdrop-blur-2xl z-10 border border-slate-100 dark:border-white/5 overflow-hidden rounded-lg">
                {/* Placeholder Image */}
                <div className="relative h-[240px] w-full overflow-hidden bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                    <div className="text-6xl font-black text-primary/30">
                        {course.subject.name[0]}
                    </div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                        {course.subject.name}
                    </div>
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getDifficultyColor(course.difficulty)}`}>
                        {difficultyInfo.display}
                    </div>
                    {/* Show "Purchased" badge if already purchased */}
                    {isPurchased && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-sm">
                            Purchased ✓
                        </div>
                    )}
                </div>

                <div className="p-6 pb-4 space-y-4 flex flex-col flex-grow">
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-20 bg-gradient-to-r from-transparent via-white/2 to-transparent animate-[shimmer_3s_infinite]" />

                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            {course.duration ? `${course.duration} min` : 'Self-paced'}
                        </span>
                    </div>
                    <Link href={`/${lang}/courses/${course.id}`} className='hover:underline'>
                        <h3 className="text-[20px] font-black text-zinc-900 dark:text-gray-200 leading-tight">
                            {course.name}
                        </h3>
                    </Link>


                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                        {course.description}
                    </p>

                    <div className="mt-auto grid grid-cols-2 gap-4 border-b pb-4 border-zinc-50 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-gray-400">
                            <Clock size={16} className="text-primary" />
                            <span className="text-xs font-medium">
                                {course.duration ? `${course.duration} min` : 'Self-paced'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-gray-400">
                            <Zap size={16} className="text-primary" />
                            <span className="text-xs font-medium">{difficultyInfo.display}</span>
                        </div>
                    </div>


                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {/* Start Learning Button - Always show if has access */}
                        {hasAccess && (
                            <Button asChild className="flex-1 font-bold py-6 bg-primary hover:bg-orange-600">
                                <Link href={`/${lang}/courses/${course.id}`}>
                                    Start Learning <ArrowRightCircle className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        )}

                        {/* Register Button - Show if not registered (even if purchased) */}
                        {!hasAccess && (
                            <Button
                                onClick={() => onRegister(course)}
                                disabled={isRegistering}
                                className={`flex-1 font-bold py-6 ${hasAccess ? 'bg-blue-500 hover:bg-blue-600' : 'bg-primary hover:bg-orange-600'}`}
                            >
                                {isRegistering ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                    hasAccess ? "Add to Subscription" : t.register
                                )}
                            </Button>
                        )}

                        {/* Purchase Button - Show if course is purchasable AND not already purchased */}
                        {course.is_purchasable && !isPurchased && (
                            <Button
                                onClick={() => onPurchase(course)}
                                disabled={isPurchasing}
                                variant="outline"
                                className="flex-1 font-bold py-6"
                            >
                                {isPurchasing ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                    `Buy Now $${course.price}`
                                )}
                            </Button>
                        )}

                        {/* If already purchased and registered, show single button layout */}
                        {isPurchased && isRegistered && (
                            <Button
                                disabled
                                variant="outline"
                                className="flex-1 font-bold py-6 text-emerald-600 border-emerald-600"
                            >
                                Already Purchased ✓
                            </Button>
                        )}
                    </div>


                    {/* Access Status Indicator */}
                    {isRegistered && !isPurchased && (
                        <p className="text-[10px] text-center text-blue-600  rounded-lg">
                            ✓ Access via active subscription
                        </p>
                    )}
                    {isPurchased && (
                        <p className="text-[10px] text-center text-emerald-600  py-1 rounded-lg">
                            ✓ Lifetime access - Already purchased
                        </p>
                    )}

                    {/* If already purchased but not registered, encourage subscription */}
                    {/* {isPurchased && !isRegistered && course.is_purchasable && (
                        <p className="text-[10px] text-center text-zinc-500">
                            You own this course. Subscribe to access additional courses.
                        </p>
                    )} */}
                </div>
            </div>
        </div>
    );
}