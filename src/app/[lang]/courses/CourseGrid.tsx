'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lang } from '@/lib/dictionary/dictionary';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { useAuth } from '@/context/AuthContext';
import { CustomDialog } from '../../../../widgets/CustomDialog/CustomDialog';
import { CourseCard } from './CourseCard';

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

interface Purchase {
    id: string;
    course: {
        id: string;
        name: string;
    };
    status: string;
}

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
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [registeredCourses, setRegisteredCourses] = useState<Set<string>>(new Set());
    const [purchasedCourses, setPurchasedCourses] = useState<Set<string>>(new Set());

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
        queryKey: [ENDPOINTS.COURSES.MY_REGISTRATIONS],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.MY_REGISTRATIONS);
            return data;
        },
        enabled: !!user,
    });

    // Fetch user's purchased courses if logged in
    const { data: purchasesResponse } = useQuery({
        queryKey: [ENDPOINTS.COURSES.MY_PURCHASES],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.MY_PURCHASES);
            return data;
        },
        enabled: !!user,
    });

    // Update registered courses set when data loads
    useEffect(() => {
        if (registrationsResponse?.data?.results) {
            const registeredIds = new Set(
                registrationsResponse.data.results.map((reg: any) => reg.course.id)
            ) as Set<string>;
            setRegisteredCourses(registeredIds);
        }
    }, [registrationsResponse]);

    // Update purchased courses set when data loads
    useEffect(() => {
        if (purchasesResponse?.data?.results) {
            const purchasedIds = new Set(
                purchasesResponse.data.results
                    .filter((p: Purchase) => p.status === 'active')
                    .map((p: Purchase) => p.course.id)
            ) as Set<string>;
            setPurchasedCourses(purchasedIds);
        }
    }, [purchasesResponse]);

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
            queryClient.invalidateQueries({ queryKey: ['user-registrations'] });
            setRegisteredCourses(prev => new Set([...prev, course.id]));
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to register for course.";
            toast.error(errorMessage);
        } finally {
            setIsRegistering(null);
        }
    };

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
                payment_reference: `manual_${Date.now()}`
            });
            toast.success(response.data?.message || `Successfully purchased ${course.name}`);
            queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
            setPurchasedCourses(prev => new Set([...prev, course.id]));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Purchase failed");
        } finally {
            setIsPurchasing(null);
        }
    };

    // Filter courses by category
    const filteredCourses = activeTab === t.categories[0]
        ? courses
        : courses.filter((course: Course) =>
            course.subject.name === activeTab ||
            (activeTab === 'Analysis' && course.subject.name === 'Analysis') ||
            (activeTab === 'Algebra' && course.subject.name === 'Algebra') ||
            (activeTab === 'Applied' && course.subject.name === 'Applied')
        );

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
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-300">
                    {t.showing} <span className="text-primary">{filteredCourses.length}</span> {t.coursesLabel}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredCourses.map((course: Course) => {
                    const isRegistered = registeredCourses.has(course.id);
                    const isPurchased = purchasedCourses.has(course.id);
                    const isRegisteringThis = isRegistering === course.id;
                    const isPurchasingThis = isPurchasing === course.id;

                    return (
                        <CourseCard
                            key={course.id}
                            course={course}
                            lang={lang}
                            isRegistered={isRegistered}
                            isPurchased={isPurchased}
                            isRegistering={isRegisteringThis}
                            isPurchasing={isPurchasingThis}
                            onRegister={handleRegister}
                            onPurchase={handlePurchase}
                            t={t}
                        />
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
                    <div className='rounded-full p-8 bg-gradient-to-br from-primary/20 to-orange-500/20'>
                        <ShieldAlert className='w-[60px] h-[60px] text-primary' />
                    </div>
                    <p className='text-sm py-4'>
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