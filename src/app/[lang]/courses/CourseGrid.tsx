'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Star, ArrowRightCircle, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lang } from '@/lib/dictionary/dictionary';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { useAuth } from '@/context/AuthContext';
import { CustomDialog } from '../../../../widgets/CustomDialog/CustomDialog';

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
    created_at?: string;
    updated_at?: string;
}

interface CoursesResponse {
    status: string;
    code: number;
    message: string;
    data: {
        results: Course[];
        pagination: {
            total: number;
            total_pages: number;
            current_page: number;
            page_size: number;
            has_next: boolean;
            has_previous: boolean;
            next_page: number | null;
            previous_page: number | null;
        };
    };
}

// Map difficulty to display text and level
const getDifficultyInfo = (difficulty: string) => {
    const map: Record<string, { display: string; level: number }> = {
        beginner: { display: 'Beginner', level: 1 },
        intermediate: { display: 'Intermediate', level: 2 },
        advanced: { display: 'Advanced', level: 3 },
        expert: { display: 'Expert', level: 4 },
    };
    return map[difficulty] || { display: difficulty, level: 2 };
};

// Map difficulty to color
const getDifficultyColor = (difficulty: string) => {
    const map: Record<string, string> = {
        beginner: 'bg-emerald-500/10 text-emerald-600',
        intermediate: 'bg-blue-500/10 text-blue-600',
        advanced: 'bg-amber-500/10 text-amber-600',
        expert: 'bg-rose-500/10 text-rose-600',
    };
    return map[difficulty] || 'bg-zinc-100 text-zinc-600';
};

const COURSE_DATA = {
    en: {
        categories: ['All Topics', 'Analysis', 'Algebra', 'Applied'],
        showing: "Showing",
        coursesLabel: "AI Learning Modules",
        learnMore: "Start Solving",
        register: "Register Now",
        registering: "Registering...",
        registered: "Registered",
        loginRequired: "Login Required",
        loginToRegister: "Please log in to register for this course",
    },
    fr: {
        categories: ['Tous les sujets', 'Analyse', 'Algèbre', 'Appliqué'],
        showing: "Affichage de",
        coursesLabel: "Modules d'IA",
        learnMore: "Commencer à résoudre",
        register: "S'inscrire",
        registering: "Inscription...",
        registered: "Inscrit",
        loginRequired: "Connexion requise",
        loginToRegister: "Veuillez vous connecter pour vous inscrire à ce cours",
    },
    es: {
        categories: ['Todos los temas', 'Análisis', 'Álgebra', 'Aplicada'],
        showing: "Mostrando",
        coursesLabel: "Módulos de IA",
        learnMore: "Empezar a resolver",
        register: "Registrarse",
        registering: "Registrando...",
        registered: "Registrado",
        loginRequired: "Inicio de sesión requerido",
        loginToRegister: "Por favor inicie sesión para registrarse en este curso",
    },
};

export default function CourseGrid({ lang }: { lang: Lang }) {
    const t = COURSE_DATA[lang] || COURSE_DATA.en;
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(t.categories[0]);
    const [isRegistering, setIsRegistering] = useState<string | null>(null);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [registeredCourses, setRegisteredCourses] = useState<Set<string>>(new Set());
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null)

    // Fetch courses from API
    const { data: coursesResponse, isLoading, error } = useQuery<CoursesResponse>({
        queryKey: [ENDPOINTS.COURSES.LIST_COURSES, activeTab],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.LIST_COURSES, {
                params: { page_size: 100 }
            });
            return data;
        },
    });

    const courses = coursesResponse?.data?.results || [];

    // Fetch user's registered courses if logged in
    const { data: registrationsResponse } = useQuery({
        queryKey: ['user-registrations'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.MY_REGISTRATIONS);
            return data;
        },
        enabled: !!user,
    });

    const handlePurchase = async (course: Course) => {
        if (!user) {
            setSelectedCourse(course);
            setShowLoginDialog(true);
            return;
        }

        setIsPurchasing(course.id);
        try {
            const response = await api.post(ENDPOINTS.COURSES.PURCHASE_COURSE, {
                course_id: course.id,
                payment_reference: `manual_${Date.now()}` // Integrate with actual payment
            });
            toast.success(response.data?.message || `Successfully purchased ${course.name}`);
            // Redirect to course or refresh
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Purchase failed");
        } finally {
            setIsPurchasing(null);
        }
    };

    // Update registered courses set when data loads
    useEffect(() => {
        if (registrationsResponse?.data?.results) {
            const registeredIds = new Set(
                registrationsResponse.data.results.map((reg: any) => reg.course.id)
            ) as Set<string>;
            setRegisteredCourses(registeredIds);
        }
    }, [registrationsResponse]);

    // Filter courses by category (using subject name for filtering)
    const filteredCourses = activeTab === t.categories[0]
        ? courses
        : courses.filter((course: Course) =>
            course.subject.name === activeTab ||
            (activeTab === 'Analysis' && course.subject.name === 'Analysis') ||
            (activeTab === 'Algebra' && course.subject.name === 'Algebra') ||
            (activeTab === 'Applied' && course.subject.name === 'Applied')
        );

    const handleRegister = async (course: Course) => {
        if (!user) {
            setSelectedCourse(course);
            setShowLoginDialog(true);
            return;
        }

        setIsRegistering(course.id);
        try {
            const response = await api.post(ENDPOINTS.COURSES.REGISTER_FOR_COURSE, {
                course_id: course.id
            });

            toast.success(response.data?.message || `Successfully registered for ${course.name}`);

            // Invalidate registrations cache
            queryClient.invalidateQueries({ queryKey: ['user-registrations'] });

            // Add to registered set
            setRegisteredCourses(prev => new Set([...prev, course.id]));
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to register for course.";
            toast.error(errorMessage);
        } finally {
            setIsRegistering(null);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 py-12">
                <div className="flex justify-center items-center min-h-[400px]">
                    <Loader2 className="animate-spin h-12 w-12 text-primary" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-6 py-12">
                <div className="text-center py-12">
                    <p className="text-red-500 mb-4">Failed to load courses. Please try again later.</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    // Get unique subjects for filter tabs
    const uniqueSubjects = ['All Topics', ...new Set(courses.map((c: Course) => c.subject.name))];

    return (
        <div className="container mx-auto px-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-16">
                <div className="flex bg-gray-100/50 dark:bg-[#18181b] rounded-full p-1 border border-gray-200 dark:border-zinc-800">
                    {uniqueSubjects.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-6 py-2 text-sm rounded-full transition-all duration-300 ${activeTab === cat
                                ? 'bg-white text-black shadow-sm font-bold'
                                : 'text-gray-500 dark:text-gray-300 dark:hover:text-primary hover:text-primary'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="text-sm font-bold text-zinc-900">
                    {t.showing} <span className="text-primary">{filteredCourses.length}</span> {t.coursesLabel}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredCourses.map((course: Course) => {
                    const difficultyInfo = getDifficultyInfo(course.difficulty);
                    const isRegistered = registeredCourses.has(course.id);
                    const isRegisteringThis = isRegistering === course.id;

                    return (
                        <div key={course.id} className="group p-[3px] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-slate-100/50 dark:bg-zinc-900/50 relative z-10">
                            <div className="absolute w-[98%] h-[98%] top-[1%] left-[1%] overflow-hidden bg-slate-100 dark:bg-zinc-900 shadow-xs hover:shadow-sm rounded-sm" />
                            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '3s' }} />

                            <div className="relative h-full bg-white/50 dark:bg-[#111114]/80 backdrop-blur-2xl z-10 border border-slate-100 dark:border-white/5 overflow-hidden rounded-lg">
                                {/* Placeholder Image - Using subject name for placeholder */}
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
                                </div>

                                <div className="p-6 space-y-4 flex flex-col flex-grow">
                                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-20 bg-gradient-to-r from-transparent via-white/2 to-transparent animate-[shimmer_3s_infinite]" />

                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            {course.duration ? `${course.duration} min` : 'Self-paced'}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-gray-200 leading-tight ">
                                        {course.name}
                                    </h3>

                                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                                        {course.description}
                                    </p>

                                    <div className="pt-4 mt-auto grid grid-cols-2 gap-4 border-t border-zinc-50 dark:border-zinc-800">
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


                                    <div>
                                        {course.is_purchasable && (
                                            <Button
                                                onClick={() => handlePurchase(course)}
                                                disabled={isPurchasing === course.id}
                                                variant="outline"
                                                className="flex-1 w-full"
                                            >
                                                {isPurchasing === course.id ? (
                                                    <Loader2 className="animate-spin h-4 w-4" />
                                                ) : (
                                                    `Buy Now $${course.price}`
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        {isRegistered && <Button asChild variant="outline" className="flex-1  font-bold py-6">
                                            <Link href={`/${lang}/courses/${course.slug}`}>
                                                {t.learnMore} <ArrowRightCircle className="ml-2 w-4 h-4" />
                                            </Link>
                                        </Button>}

                                        <Button
                                            onClick={() => handleRegister(course)}
                                            disabled={isRegisteringThis || isRegistered}
                                            className={`flex-1  font-bold py-6 ${isRegistered
                                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                                : 'bg-primary hover:bg-orange-600'
                                                }`}
                                        >
                                            {isRegisteringThis ? (
                                                <Loader2 className="animate-spin h-4 w-4" />
                                            ) : isRegistered ? (
                                                'Registered ✓'
                                            ) : (
                                                t.register
                                            )}
                                        </Button>


                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-zinc-500">No courses found in this category.</p>
                </div>
            )}

            {/* Login Dialog */}
            <CustomDialog
                title={t.loginRequired}
                description={t.loginToRegister}
                open={showLoginDialog}
                onOpenChange={setShowLoginDialog}
                contentWidth="max-w-md"
            >
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        You need to be logged in to register for courses. Please choose an option below.
                    </p>
                    <div className="flex gap-3 w-full">
                        <Button
                            asChild
                            className="flex-1 bg-primary hover:bg-orange-600"
                            onClick={() => setShowLoginDialog(false)}
                        >
                            <Link href={`/${lang}/login?redirect=/${lang}/courses`}>
                                Log In
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowLoginDialog(false)}
                        >
                            <Link href={`/${lang}/signup?redirect=/${lang}/courses`}>
                                Create Account
                            </Link>
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer { 
                    0% { transform: translateX(-150%) skewX(-20deg); } 
                    100% { transform: translateX(450%) skewX(-20deg); } 
                }
            ` }} />
        </div>
    );
}