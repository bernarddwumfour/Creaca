// app/[lang]/courses/[id]/CourseDetailClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Clock,
    Zap,
    Star,
    PlayCircle,
    CheckCircle2,
    Globe2,
    Layout,
    Lock,
    Loader2,
    ArrowRight,
    ShoppingBag,
    BookOpen,
    Crown,
    Code,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import CourseContent from './CourseContent';
import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';

interface CourseModule {
    id: string;
    name: string;
    slug: string;
    description: string;
    order: number;
}

interface Course {
    id: string;
    name: string;
    slug: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    duration: number | null;
    status: string;
    price: string | null;
    is_purchasable: boolean;
    subject: {
        id: string;
        name: string;
        slug: string;
    };
    modules?: CourseModule[];
}

interface Registration {
    id: string;
    course: {
        id: string;
        name: string;
    };
    status: string;
    progress: number;
}

interface Purchase {
    id: string;
    course: {
        id: string;
        name: string;
    };
    status: string;
}

interface CourseDetailClientProps {
    course: Course;
    lang: string;
    dictionary: any;
}

const difficultyMap = {
    beginner: { label: 'Beginner', color: 'bg-emerald-500/10 text-emerald-600' },
    intermediate: { label: 'Intermediate', color: 'bg-blue-500/10 text-blue-600' },
    advanced: { label: 'Advanced', color: 'bg-amber-500/10 text-amber-600' },
    expert: { label: 'Expert', color: 'bg-rose-500/10 text-rose-600' },
};

export default function CourseDetailClient({ course, lang, dictionary }: CourseDetailClientProps) {
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isRegistering, setIsRegistering] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    // Fetch user's registered courses
    const { data: registrationsResponse, refetch: refetchRegistrations } = useQuery({
        queryKey: [ENDPOINTS.COURSES.MY_REGISTRATIONS],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.MY_REGISTRATIONS);
            return data;
        },
        enabled: !!user,
    });

    // Fetch user's purchased courses
    const { data: purchasesResponse, refetch: refetchPurchases } = useQuery({
        queryKey: [ENDPOINTS.COURSES.MY_PURCHASES],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.MY_PURCHASES);
            return data;
        },
        enabled: !!user,
    });

    // Check if user has registered for this course
    const isRegistered = registrationsResponse?.data?.results?.some(
        (reg: Registration) => reg.course.id === course.id && reg.status === 'active'
    ) || false;

    // Check if user has purchased this course
    const isPurchased = purchasesResponse?.data?.results?.some(
        (purchase: Purchase) => purchase.course.id === course.id && purchase.status === 'active'
    ) || false;

    // Find registration to get progress
    const registration = registrationsResponse?.data?.results?.find(
        (reg: Registration) => reg.course.id === course.id
    );
    const progress = registration?.progress || 0;
    const isCompleted = progress === 100;

    // User has access if registered OR purchased
    const hasAccess = isRegistered || isPurchased;
    const accessType = isPurchased ? 'purchase' : (isRegistered ? 'subscription' : null);

    const difficultyInfo = difficultyMap[course.difficulty] || difficultyMap.intermediate;
    const allModules = (course.modules || []).slice().sort((a, b) => a.order - b.order);
    const visibleModules = hasAccess ? allModules : allModules.slice(0, 2);
    const lockedModulesCount = allModules.length - visibleModules.length;

    const handleRegister = async () => {
        if (!user) {
            setShowLoginDialog(true);
            return;
        }

        setIsRegistering(true);
        try {
            const response = await api.post(ENDPOINTS.COURSES.REGISTER_FOR_COURSE, {
                course_id: course.id
            });

            toast.success(response.data?.message || `Successfully registered for ${course.name}`);
            await refetchRegistrations();
            await refetchPurchases();
            queryClient.invalidateQueries({ queryKey: ['user-registrations'] });
            queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to register for course.";
            toast.error(errorMessage);
        } finally {
            setIsRegistering(false);
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            setShowLoginDialog(true);
            return;
        }

        setIsPurchasing(true);
        try {
            const response = await api.post(ENDPOINTS.COURSES.INITIATE_PURCHASE, {
                course_id: course.id,
                confirm: true,
            });
            window.location.href = response.data.data.authorization_url;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Purchase failed");
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleStartLearning = () => {
        const target = allModules[0];
        if (target) {
            router.push(`/${lang}/courses/${course.id}/lessons/${target.id}`);
        } else {
            toast.info("This course doesn't have any published lessons yet.");
        }
    };

    const handlePlayClick = (module: CourseModule) => {
        if (!hasAccess) {
            toast.info("Subscribe or purchase this course to access all modules");
            return;
        }
        router.push(`/${lang}/courses/${course.id}/lessons/${module.id}`);
    };

    const lessons = visibleModules.map((module, index) => ({
        title: module.name,
        duration: '',
        locked: hasAccess ? progress < (index + 1) * (100 / visibleModules.length) : false
    }));

    const learningOutcomes = [
        `Master ${course.name} from scratch`,
        `Build real-world projects and applications`,
        `Write clean, maintainable code`,
        `Understand best practices and industry standards`,
        `Prepare for job interviews and certifications`,
    ];

    const renderActionButtons = () => {
        if (hasAccess) {
            return (
                <Button
                    onClick={handleStartLearning}
                    className="w-full py-6 md:py-7 rounded-xl font-bold text-base md:text-lg shadow-lg"
                >
                    {isCompleted ? "Review Course" : "Continue Learning"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            );
        }

        if (user) {
            return (
                <div className="flex gap-3">
                    <Button
                        onClick={handleRegister}
                        disabled={isRegistering}
                        className="w-full flex-1 font-bold py-6 bg-primary hover:bg-orange-600"
                    >
                        {isRegistering ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            "Access with Subscription"
                        )}
                    </Button>

                    {course.is_purchasable && course.price && !isPurchased && (
                        <Button
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                            variant="outline"
                            className="w-full flex-1 font-bold py-6"
                        >
                            {isPurchasing ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                `Buy Now - $${course.price}`
                            )}
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className="flex gap-3">
                <Button
                    onClick={() => setShowLoginDialog(true)}
                    className="w-full flex-1 font-bold py-6 bg-primary hover:bg-orange-600"
                >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Log in to Access
                </Button>

                {course.is_purchasable && course.price && (
                    <Button
                        onClick={() => setShowLoginDialog(true)}
                        variant="outline"
                        className="w-full flex-1 font-bold py-6"
                    >
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Buy Now - ${course.price}
                    </Button>
                )}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-white dark:bg-[#09090b] relative">
            {/* Hero Section */}
            <section className="bg-zinc-50 dark:bg-zinc-900 pt-28 pb-12 md:pt-40 md:pb-32 text-zinc-900 dark:text-white relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full translate-x-1/2 pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="lg:w-2/3 space-y-5">
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">
                                    {course.subject.name}
                                </span>
                                <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-bold">
                                    <Star size={14} fill="currentColor" />
                                    4.9 <span className="text-zinc-400 font-medium">(1,234 ratings)</span>
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-[1.15] text-zinc-900 dark:text-zinc-50">
                                {course.name}
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed">
                                {course.description}
                            </p>

                            <div className="flex flex-col gap-4 w-fit">
                                <div className="flex flex-wrap gap-5 pt-2 text-xs md:text-sm font-bold text-zinc-500 dark:text-zinc-400">
                                    <div className="flex items-center gap-2"><Clock className="text-primary" size={16} />{course.duration ? `${course.duration} min` : 'Self-paced'}</div>
                                    <div className="flex items-center gap-2"><Zap className="text-primary" size={16} />{difficultyInfo.label}</div>
                                    <div className="flex items-center gap-2"><Code className="text-primary" size={16} />Hands-on Coding</div>
                                </div>

                                {hasAccess && (
                                    <div className="mt-4 pt-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium">Your Progress</span>
                                            <span className="font-bold text-primary">{progress}%</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <Progress value={progress} className="h-2 rounded-full" />
                                            {isCompleted && (
                                                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                                                    <CheckCircle2 size={12} />
                                                    Course completed! 🎉
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-2">
                                            {accessType === 'purchase' ? '✓ Lifetime access' : '✓ Subscription access'}
                                        </p>
                                    </div>
                                )}

                                {/* Requirements */}
                                <div className="pt-4">
                                    <h3 className="font-bold mb-3 text-lg">Course Requirements</h3>
                                    <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <li className="flex items-center gap-2">• No prior coding experience required</li>
                                        <li className="flex items-center gap-2">• A computer (Windows, Mac, or Linux)</li>
                                        <li className="flex items-center gap-2">• Willingness to learn and practice</li>
                                        <li className="flex items-center gap-2">• Internet connection for accessing course materials</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Preview Card */}
                        <div className="lg:w-1/3 relative lg:-mb-24 z-20">
                            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden sticky top-28">
                                <div className="relative aspect-video group cursor-pointer bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                                    <Code className="w-16 h-16 text-primary/40" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                        <PlayCircle className="text-white w-14 h-14" />
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 space-y-6">
                                    {!hasAccess && course.is_purchasable && course.price && (
                                        <div className="text-center">
                                            <span className="text-2xl font-black">${course.price}</span>
                                            <span className="text-zinc-500 text-sm"> one-time purchase</span>
                                        </div>
                                    )}

                                    {renderActionButtons()}

                                    {hasAccess && (
                                        <div className="text-center text-xs text-emerald-600 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                            <CheckCircle2 className="inline-block w-3 h-3 mr-1" />
                                            You have {accessType === 'purchase' ? 'lifetime access' : 'subscription access'}
                                        </div>
                                    )}
                                    {!hasAccess && user && (
                                        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                            <Crown className="inline-block w-3 h-3 mr-1 text-primary" />
                                            Subscribe or purchase this course for unlimited access .
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Content Section */}
            <section className="py-20 md:py-32 container mx-auto px-6">
                <div className="space-y-16 grid md:grid-cols-3 gap-6 md:gap-12">
                    {/* Curriculum */}
                    <div className="space-y-8 md:col-span-2">
                        <div className="flex justify-between items-end">
                            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white">Course Curriculum</h2>
                            <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">
                                {visibleModules.length} / {allModules.length} Modules
                                {!hasAccess && lockedModulesCount > 0 && ` (${lockedModulesCount} locked)`}
                            </p>
                        </div>

                        <CourseContent
                            lessons={lessons}
                            lessonModules={visibleModules}
                            onPlayClick={handlePlayClick}
                            hasAccess={hasAccess}
                            progress={progress}
                        />

                        {!hasAccess && lockedModulesCount > 0 && (
                            <div className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-orange-500/5 rounded-xl border border-primary/20 text-center">
                                <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                                <h3 className="font-bold text-lg mb-2">Unlock Full Course Content</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                    Subscribe or purchase this course to access all {allModules.length} modules, coding exercises, quizzes, and certificate of completion.
                                </p>
                                <Button onClick={handleRegister} variant="default">
                                    Get Full Access
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Learning Outcomes */}
                    <div className="space-y-8">
                        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                            <Layout className="text-primary" size={28} />
                            What You'll Learn
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {learningOutcomes.map((outcome, idx) => (
                                <div key={idx} className="flex gap-3 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                    <CheckCircle2 className="text-primary shrink-0" size={18} />
                                    <span className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">{outcome}</span>
                                </div>
                            ))}
                        </div>


                    </div>
                </div>
            </section>

            {/* Login Dialog */}
            <CustomDialog
                title="Login Required"
                description="Please log in to access this course"
                open={showLoginDialog}
                onOpenChange={setShowLoginDialog}
                contentWidth="max-w-md"
            >
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className='rounded-full p-8 bg-gradient-to-br from-primary/20 to-orange-500/20'>
                        <ShieldAlert className='w-[60px] h-[60px] text-primary' />
                    </div>
                    <p className='text-sm py-4'>
                        You need to be logged in to access this course. Please choose an option below.
                    </p>
                    <div className="flex gap-3 w-full">
                        <Button
                            asChild
                            className="flex-1 bg-primary hover:bg-orange-600"
                            onClick={() => setShowLoginDialog(false)}
                        >
                            <Link href={`/${lang}/login?redirect=/${lang}/courses/${course.id}`}>
                                Log In
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowLoginDialog(false)}
                        >
                            <Link href={`/${lang}/signup?redirect=/${lang}/courses/${course.id}`}>
                                Create Account
                            </Link>
                        </Button>
                    </div>
                </div>
            </CustomDialog>
        </main>
    );
}
