"use client";

import React, { useState } from 'react';
import {
    LayoutDashboard, BookOpen, Target,
    Trophy, Clock, PlayCircle,
    CheckCircle2,
    Zap, Award, GraduationCap,
    Lock,
    ChevronRight,
    Loader2,
    ShoppingBag,
    EyeOff
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { learnerDict } from '@/lib/dictionary/learner';
import { Lang } from '@/lib/dictionary/dictionary';

// Types
interface Course {
    id: string;
    name: string;
    slug: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    duration: number | null;
    status: string;
    subject: {
        id: string;
        name: string;
        slug: string;
    };
    completed_at?: string | null;
    progress?: number;
    is_completed?: boolean;
}

interface Registration {
    id: string;
    course: Course;
    status: 'active' | 'completed' | 'dropped';
    enrolled_at: string;
    course_id: string;
    completed_at: string | null;
    progress: number;
    is_completed: boolean;
}

interface PurchasedCourse {
    id: string;
    course: Course;
    price_paid: string;
    status: 'active' | 'deactivated';
    deactivated_by_student: boolean;
    purchased_at: string;
}

interface CourseProgress {
    id: string;
    completed_at: string | null;
    updated_at: string;
}

interface EnrolledCourse {
    id: string;
    title: string;
    slug: string;
    tutor: string;
    modulesCount: number;
    progress: number;
    status: string;
    icon: string;
    color: string;
    modules: Array<{
        name: string;
        status: string;
        duration: string;
        locked: boolean;
    }>;
}

// Update the PurchasedCourseCard component to include modules accordion
function PurchasedCourseCard({ purchase, progress, onDeactivate, lang }: { purchase: PurchasedCourse; progress: number; onDeactivate: () => void; lang: string }) {
    const isCompleted = progress === 100;

    // Dummy modules data for purchased courses
    const modules = [
        { name: "Introduction to " + purchase.course.name, status: progress > 0 ? "Done" : "Locked", duration: "30 mins", locked: progress === 0 },
        { name: "Core Concepts & Fundamentals", status: progress > 25 ? "Done" : progress > 0 ? "Current" : "Locked", duration: "45 mins", locked: progress < 25 },
        { name: "Advanced Topics & Applications", status: progress > 50 ? "Done" : progress > 25 ? "Current" : "Locked", duration: "60 mins", locked: progress < 50 },
        { name: "Mastery & Final Assessment", status: progress > 75 ? (progress === 100 ? "Done" : "Current") : "Locked", duration: "45 mins", locked: progress < 75 },
    ];

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/80">
            <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-lg tracking-tight">{purchase.course.name}</h4>
                    <div className="flex gap-2">
                        <Badge className="bg-primary/10 text-primary border-none text-[10px]">
                            Purchased
                        </Badge>
                        {isCompleted && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">
                                Completed
                            </Badge>
                        )}
                    </div>
                </div>

                <p className="text-[10px] font-semibold uppercase text-zinc-400 tracking-widest">
                    {purchase.course.subject.name} • Lifetime Access
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                    Purchased on {new Date(purchase.purchased_at).toLocaleDateString()} • ${purchase.price_paid}
                </p>



                {/* Modules Accordion */}
                <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="modules" className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 text-sm font-bold hover:no-underline">
                            Course Modules ({modules.filter(m => m.status === 'Done').length}/{modules.length} completed)
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-2 pt-0">
                            <div className="flex flex-col">
                                {modules.map((module, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors border-b border-zinc-100 dark:border-zinc-800/20 last:border-0 ${module.status === 'Current' ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${module.status === 'Done'
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : module.status === 'Current'
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                                }`}>
                                                {module.status === 'Done' ? <CheckCircle2 size={14} /> : idx + 1}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${module.status === 'Current' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                    {module.name}
                                                </p>
                                                <p className="text-[10px] text-zinc-400">{module.duration}</p>
                                            </div>
                                        </div>
                                        {module.status === 'Locked' ? (
                                            <Lock size={14} className="text-zinc-300" />
                                        ) : (
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <PlayCircle size={18} className={module.status === 'Current' ? 'text-primary' : 'text-zinc-400'} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="flex gap-6 justify-between mt-3 items-end flex-wrap">
                    <div className="mt-4">
                        <div className="flex justify-between text-xs mb-2 gap-2">
                            <span className="font-medium">Overall Progress</span>
                            <span className="font-bold text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 rounded-full" />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button asChild className="flex-1" variant="outline">
                            <Link href={`/${lang}/courses/${purchase.course.slug}`}>
                                {isCompleted ? "Review Course" : "Continue Learning"}
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={onDeactivate}>
                            <EyeOff size={14} className="mr-1" /> Hide
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Update the SubscriptionCourseCard component to include modules accordion
function SubscriptionCourseCard({ course, progress, lang }: { course: EnrolledCourse; progress: number; lang: string }) {
    const isCompleted = progress === 100;

    // Dummy modules data for subscription courses (using the existing modules from course object or generating)
    const modules = course.modules && course.modules.length > 0 ? course.modules : [
        { name: "Introduction to " + course.title, status: progress > 0 ? "Done" : "Locked", duration: "30 mins", locked: progress === 0 },
        { name: "Core Concepts & Fundamentals", status: progress > 25 ? "Done" : progress > 0 ? "Current" : "Locked", duration: "45 mins", locked: progress < 25 },
        { name: "Advanced Topics & Applications", status: progress > 50 ? "Done" : progress > 25 ? "Current" : "Locked", duration: "60 mins", locked: progress < 50 },
        { name: "Mastery & Final Assessment", status: progress > 75 ? (progress === 100 ? "Done" : "Current") : "Locked", duration: "45 mins", locked: progress < 75 },
    ];

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/80">
            <div className="p-5">
                <div className="flex items-start  justify-between gap-2 mb-2">
                    <h4 className="font-bold text-lg tracking-tight">{course.title}</h4>
                    <div className="flex gap-2">
                        <Badge className="bg-blue-500/10 text-blue-600 border-none text-[10px]">
                            Subscription
                        </Badge>
                        {isCompleted && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">
                                Completed
                            </Badge>
                        )}
                        {!isCompleted && progress > 0 && (
                            <Badge className="bg-orange-500/10 text-orange-600 border-none text-[10px]">
                                In Progress
                            </Badge>
                        )}
                    </div>
                </div>

                <p className="text-[10px] font-semibold uppercase text-zinc-400 tracking-widest">
                    {course.tutor} • {course.modulesCount} Modules
                </p>



                {/* Modules Accordion */}
                <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="modules" className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 text-sm font-bold hover:no-underline">
                            Course Modules ({modules.filter((m: any) => m.status === 'Done').length}/{modules.length} completed)
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-2 pt-0">
                            <div className="flex flex-col">
                                {modules.map((module: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className={`p-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors border-b border-zinc-100 dark:border-zinc-800/20 last:border-0 ${module.status === 'Current' ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${module.status === 'Done'
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : module.status === 'Current'
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                                }`}>
                                                {module.status === 'Done' ? <CheckCircle2 size={14} /> : idx + 1}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${module.status === 'Current' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                    {module.name}
                                                </p>
                                                <p className="text-[10px] text-zinc-400">{module.duration}</p>
                                            </div>
                                        </div>
                                        {module.status === 'Locked' ? (
                                            <Lock size={14} className="text-zinc-300" />
                                        ) : (
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <PlayCircle size={18} className={module.status === 'Current' ? 'text-primary' : 'text-zinc-400'} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="flex gap-6 justify-between mt-2 items-end  flex-wrap">
                    <div className="mt-4">
                        <div className="flex justify-between text-xs mb-2 gap-2">
                            <span className="font-medium">Overall Progress</span>
                            <span className="font-bold text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 rounded-full" />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button asChild className="flex-1" variant="outline">
                            <Link href={`/${lang}/courses/${course.slug}`}>
                                {isCompleted ? "Review Course" : "Continue Learning"}
                            </Link>
                        </Button>
                    </div>
                </div>

                <p className="text-[10px] text-zinc-400 mt-3 flex items-center gap-1">
                    <Clock size={10} />
                    Access while subscription is active
                </p>
            </div>
        </div>
    );
}


export default function DashboardContent({ lang }: { lang: string }) {
    const learner = learnerDict[(lang in learnerDict ? lang : 'en') as Lang].dashboard;
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [courseFilter, setCourseFilter] = useState<'all' | 'purchased' | 'subscribed'>('all');


    // Fetch user's registered courses (subscription)
    const { data: registrationsResponse, isLoading: registrationsLoading } = useQuery({
        queryKey: [ENDPOINTS.COURSES.MY_REGISTRATIONS],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.MY_REGISTRATIONS);
            return data;
        },
        enabled: !!user,
    });

    // Fetch purchased courses
    const { data: purchasesResponse, isLoading: purchasesLoading, refetch: refetchPurchases } = useQuery({
        queryKey: [ENDPOINTS.COURSES.MY_PURCHASES],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.MY_PURCHASES);
            return data;
        },
        enabled: !!user,
    });

    // Fetch all available courses
    const { data: coursesResponse, isLoading: coursesLoading } = useQuery({
        queryKey: [ENDPOINTS.COURSES.LIST_COURSES],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.LIST_COURSES, {
                params: { page_size: 100 }
            });
            return data;
        },
    });

    const registrations: Registration[] = registrationsResponse?.data?.results || [];
    const purchases: PurchasedCourse[] = purchasesResponse?.data?.results || [];


    // Transform registrations into course data format
    const enrolledCourses: EnrolledCourse[] = registrations.map((reg: Registration) => {
        return {
            id: reg.course.id,
            title: reg.course.name,
            slug: reg.course.slug,
            tutor: reg.course.subject.name,
            modulesCount: 8,
            progress: reg.progress,
            status: reg.progress === 100 ? 'Completed' : reg.progress > 0 ? 'In Progress' : 'Starting',
            icon: reg.course.name.charAt(0),
            color: reg.progress === 100 ? 'emerald' : reg.progress > 50 ? 'orange' : 'zinc',
            modules: [
                { name: "Introduction", status: reg.progress > 0 ? "Done" : "Locked", duration: "30 mins", locked: reg.progress === 0 },
                { name: "Core Concepts", status: reg.progress > 25 ? "Done" : reg.progress > 0 ? "Current" : "Locked", duration: "45 mins", locked: reg.progress < 25 },
                { name: "Advanced Topics", status: reg.progress > 50 ? "Done" : reg.progress > 25 ? "Current" : "Locked", duration: "60 mins", locked: reg.progress < 50 },
                { name: "Mastery & Review", status: reg.progress > 75 ? (reg.progress === 100 ? "Done" : "Current") : "Locked", duration: "45 mins", locked: reg.progress < 75 },
            ].slice(0, 4)
        };
    });

    // Active purchases (not deactivated)
    const activePurchases = purchases.filter((p: PurchasedCourse) => p.status === 'active');
    const deactivatedPurchases = purchases.filter((p: PurchasedCourse) => p.status === 'deactivated');

    // Stats calculations
    const totalCourses = activePurchases.length + enrolledCourses.length;
    const completedCourses = [
        ...enrolledCourses.filter((c: EnrolledCourse) => c.progress === 100),
        ...activePurchases.filter((p: PurchasedCourse) => p.course.progress === 100)
    ].length;

    const totalHoursLearnt = [...enrolledCourses, ...activePurchases.map((p: PurchasedCourse) => ({
        progress: p.course.progress,
        modulesCount: 8
    }))].reduce((acc: number, c: any) => acc + (c.progress / 100) * (c.modulesCount * 0.75), 0).toFixed(1);

    const averageProgress = totalCourses > 0
        ? Math.round([...enrolledCourses, ...activePurchases.map((p: PurchasedCourse) => ({
            progress: p.course.progress
        }))].reduce((acc: number, c: any) => acc + c.progress, 0) / totalCourses)
        : 0;

    // Handlers
    const handleDeactivatePurchase = async (purchaseId: string, courseName: string) => {
        try {
            await api.patch(`/api/v1/courses/purchases/${purchaseId}/deactivate/`);
            toast.success(`${courseName} removed from dashboard`);
            queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
            refetchPurchases();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to deactivate");
        }
    };

    const handleReactivatePurchase = async (purchaseId: string, courseName: string) => {
        try {
            await api.patch(`/api/v1/courses/purchases/${purchaseId}/reactivate/`);
            toast.success(`${courseName} restored to dashboard`);
            queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
            refetchPurchases();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reactivate");
        }
    };

    const isLoading = registrationsLoading || purchasesLoading || coursesLoading;

    if (isLoading) {
        return (
            <div className="w-full mx-auto flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
            </div>
        );
    }

    const cardAnimationClasses = "group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-xl border-none bg-white dark:bg-[#111114] p-[2px] pt-6";
    const cardInnerOverlay = (
        <>
            <div className="absolute w-[calc(100%-4px)] h-[calc(100%-4px)] top-[2px] left-[2px] overflow-hidden bg-white dark:bg-[#111114] rounded-xl z-10" />
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none z-0" style={{ animationDuration: '3s' }} />
        </>
    );

    // Get all courses for current section (overview carousel)
    const allActiveCourses = [
        ...enrolledCourses.map(c => ({ ...c, type: 'subscription' })),
        ...activePurchases.map(p => ({
            id: p.course.id,
            title: p.course.name,
            tutor: p.course.subject.name,
            modulesCount: 8,
            progress: p.course.progress,
            status: p.course.progress === 100 ? 'Completed' : 'In Progress',
            type: 'purchased'
        }))
    ].filter(c => c.status !== 'Completed');

    return (
        <div className="w-full mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:!flex-row gap-8 items-start">

                {/* NAVIGATION — horizontal top tab bar below `md` (icon-only, selected tab
                    gets its label back), vertical collapsible sidebar at `md` and up
                    (unchanged desktop behavior, driven by isCollapsed). */}
                <div className={cn(
                    "shrink-0 transition-all duration-500 ease-in-out relative w-full",
                    "border-b border-zinc-100 dark:border-zinc-800/50 md:border-b-0 md:border-r",
                    isCollapsed ? "md:w-14" : "md:w-64"
                )}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex absolute -right-3 top-10 z-50 w-6 h-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full items-center justify-center text-zinc-400 hover:text-orange-600 transition-all shadow-sm active:scale-90"
                    >
                        <ChevronRight className={cn("transition-transform duration-500", !isCollapsed && "rotate-180")} size={12} />
                    </button>

                    <TabsList className={cn(
                        "flex flex-row md:flex-col h-auto w-full bg-muted rounded-lg gap-1 md:space-y-1 md:gap-0 p-1",
                        "justify-between md:justify-start items-center md:items-start transition-all duration-500",
                        isCollapsed ? "md:items-center" : "md:items-start"
                    )}>
                        <div className={cn("hidden md:block px-4 py-2 mb-1 transition-opacity duration-300", isCollapsed ? "opacity-0 h-8" : "opacity-100")}>
                            {!isCollapsed && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em] whitespace-nowrap">Learning</p>}
                        </div>

                        <TabsTrigger
                            value="overview"
                            className={cn(
                                "flex-1 md:w-full md:flex-none flex items-center justify-center px-2 md:px-4 py-2.5 md:py-3 font-bold text-xs uppercase tracking-wider rounded-md transition-all text-foreground/60 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700",
                                isCollapsed ? "md:justify-center md:py-6" : "md:justify-start md:gap-3"
                            )}
                        >
                            <LayoutDashboard size={16} className="shrink-0" />
                            <span className={cn(
                                "truncate",
                                activeTab === 'overview' ? "ml-1.5 max-w-[8rem]" : "ml-0 max-w-0",
                                "overflow-hidden transition-all duration-200",
                                isCollapsed ? "md:ml-0 md:max-w-0" : "md:ml-3 md:max-w-none",
                            )}>Overview</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="courses"
                            className={cn(
                                "flex-1 md:w-full md:flex-none flex items-center justify-center px-2 md:px-4 py-2.5 md:py-3 font-bold text-xs uppercase tracking-wider rounded-md transition-all text-foreground/60 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700",
                                isCollapsed ? "md:justify-center md:py-6" : "md:justify-start md:gap-3"
                            )}
                        >
                            <BookOpen size={16} className="shrink-0" />
                            <span className={cn(
                                "truncate",
                                activeTab === 'courses' ? "ml-1.5 max-w-[8rem]" : "ml-0 max-w-0",
                                "overflow-hidden transition-all duration-200",
                                isCollapsed ? "md:ml-0 md:max-w-0" : "md:ml-3 md:max-w-none",
                            )}>My Courses</span>
                        </TabsTrigger>

                        <div className={cn("hidden md:block px-4 py-2 mt-6 mb-1 transition-opacity duration-300", isCollapsed ? "opacity-0 h-8" : "opacity-100")}>
                            {!isCollapsed && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em] whitespace-nowrap">Progress</p>}
                        </div>

                        <TabsTrigger
                            value="stats"
                            className={cn(
                                "flex-1 md:w-full md:flex-none flex items-center justify-center px-2 md:px-4 py-2.5 md:py-3 font-bold text-xs uppercase tracking-wider rounded-md transition-all text-foreground/60 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700",
                                isCollapsed ? "md:justify-center md:py-6" : "md:justify-start md:gap-3"
                            )}
                        >
                            <Target size={16} className="shrink-0" />
                            <span className={cn(
                                "truncate",
                                activeTab === 'stats' ? "ml-1.5 max-w-[8rem]" : "ml-0 max-w-0",
                                "overflow-hidden transition-all duration-200",
                                isCollapsed ? "md:ml-0 md:max-w-0" : "md:ml-3 md:max-w-none",
                            )}>Performance</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="achievements"
                            className={cn(
                                "flex-1 md:w-full md:flex-none flex items-center justify-center px-2 md:px-4 py-2.5 md:py-3 font-bold text-xs uppercase tracking-wider rounded-md transition-all text-foreground/60 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700",
                                isCollapsed ? "md:justify-center md:py-6" : "md:justify-start md:gap-3"
                            )}
                        >
                            <Trophy size={16} className="shrink-0" />
                            <span className={cn(
                                "truncate",
                                activeTab === 'achievements' ? "ml-1.5 max-w-[8rem]" : "ml-0 max-w-0",
                                "overflow-hidden transition-all duration-200",
                                isCollapsed ? "md:ml-0 md:max-w-0" : "md:ml-3 md:max-w-none",
                            )}>Achievements</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 w-full">

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl font-black tracking-tight">Learning Analytics</CardTitle>
                                            <CardDescription className="text-zinc-500 font-medium">Real-time performance tracking and academic progress.</CardDescription>
                                        </div>
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] tracking-widest px-3">SYNCED</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-8 bg-zinc-100 dark:bg-zinc-900/20 space-y-4 overflow-hidden py-6 rounded-lg">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: "Total Courses", value: totalCourses, icon: BookOpen, color: "primary" },
                                            { label: "Completed", value: completedCourses, icon: CheckCircle2, color: "emerald" },
                                            { label: "Hours Learnt", value: totalHoursLearnt, icon: Clock, color: "blue" },
                                            { label: "Avg Progress", value: `${averageProgress}%`, icon: Target, color: "orange" }
                                        ].map((stat, i) => (
                                            <div key={i} className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-3">
                                                <stat.icon className={`text-${stat.color}-500`} size={18} />
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{stat.label}</p>
                                                    <p className="text-xl font-black tracking-tight">{stat.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                                        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-xl font-black tracking-tight">Current Courses</h3>
                                                <Button variant="ghost" size="sm" className="text-xs font-medium" onClick={() => setActiveTab('courses')}>
                                                    View all courses →
                                                </Button>
                                            </div>
                                            <div className="relative overflow-hidden">
                                                <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-1 px-1">
                                                    {allActiveCourses.slice(0, 2).map((course: any) => (
                                                        <div key={course.id} className="min-w-full snap-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8">
                                                            <div className="flex items-center gap-4 mb-6">
                                                                <div>
                                                                    <p className="font-bold">{course.title}</p>
                                                                    <p className="text-xs text-zinc-500">{course.tutor} • {course.modulesCount} Modules</p>
                                                                </div>
                                                            </div>
                                                            <div className="mb-8">
                                                                <div className="flex justify-between text-sm mb-2">
                                                                    <span className="font-medium">Overall Progress</span>
                                                                    <span className="font-bold text-primary">{course.progress}%</span>
                                                                </div>
                                                                <Progress value={course.progress} className="h-2 rounded-full" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {allActiveCourses.length === 0 && (
                                                        <div className="min-w-full snap-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 text-center">
                                                            <p className="text-zinc-500">No active courses. Browse and enroll in new courses!</p>
                                                            <Button asChild className="mt-4">
                                                                <Link href={`/${lang}/courses`}>Browse Courses</Link>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-3 p-8 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-6">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Performance Summary</p>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                                    <span className="text-xs font-bold text-zinc-500">Average Progress</span>
                                                    <span className="text-sm font-black text-primary">{averageProgress}%</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                                    <span className="text-xs font-bold text-zinc-500">Completed Courses</span>
                                                    <span className="text-sm font-black text-emerald-500">{completedCourses}/{totalCourses}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                                    <span className="text-xs font-bold text-zinc-500">Current Streak</span>
                                                    <span className="text-sm font-black text-orange-500">{Math.floor(Math.random() * 20) + 1} days</span>
                                                </div>
                                            </div>
                                            <div className="mt-auto p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                                <p className="text-[10px] leading-relaxed font-medium text-zinc-500 italic">
                                                    {averageProgress > 70
                                                        ? "Excellent progress! You're mastering your courses at a great pace."
                                                        : averageProgress > 40
                                                            ? "Keep up the momentum! Consistent study leads to mastery."
                                                            : "Start your learning journey today. Every expert was once a beginner."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* MY COURSES TAB - Purchased Courses Section */}
                    <TabsContent value="courses" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div>
                                            <CardTitle className="text-xl font-black tracking-tight">My Courses</CardTitle>
                                            <CardDescription className="text-zinc-500 font-medium">
                                                {activePurchases.length + enrolledCourses.length} total courses •
                                                {activePurchases.length} purchased •
                                                {enrolledCourses.length} from subscription
                                            </CardDescription>
                                        </div>

                                        {/* Sub-tabs for filtering */}
                                        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl">
                                            <button
                                                onClick={() => setCourseFilter('all')}
                                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${courseFilter === 'all'
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'text-zinc-500 hover:text-primary'
                                                    }`}
                                            >
                                                All ({activePurchases.length + enrolledCourses.length})
                                            </button>
                                            <button
                                                onClick={() => setCourseFilter('purchased')}
                                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${courseFilter === 'purchased'
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'text-zinc-500 hover:text-primary'
                                                    }`}
                                            >
                                                Purchased ({activePurchases.length})
                                            </button>
                                            <button
                                                onClick={() => setCourseFilter('subscribed')}
                                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${courseFilter === 'subscribed'
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'text-zinc-500 hover:text-primary'
                                                    }`}
                                            >
                                                Subscribed ({enrolledCourses.length})
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-8 bg-zinc-100 dark:bg-zinc-900/20 overflow-hidden py-6 rounded-lg">
                                    {/* 
                                    {courseFilter === 'all' && <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                        <ShoppingBag size={18} className="text-primary" />
                                        All Courses (Purchased/Subscribed)
                                    </h3>}

                                    {courseFilter === 'purchased' && <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                        <ShoppingBag size={18} className="text-primary" />
                                        Purchased Courses
                                    </h3>}
                                    {courseFilter === 'subscribed' && <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                        <ShoppingBag size={18} className="text-primary" />
                                        Subscribed Courses
                                    </h3>} */}

                                    {/* ALL COURSES */}
                                    {courseFilter === 'all' && (
                                        <>
                                            {/* Purchased Courses Section */}
                                            {activePurchases.length > 0 && (
                                                <div className="mb-4">

                                                    <div className="space-y-4">
                                                        {activePurchases.map((purchase: PurchasedCourse) => {
                                                            const courseProgress = purchase.course.progress;
                                                            return (
                                                                <PurchasedCourseCard
                                                                    lang={lang}
                                                                    key={purchase.id}
                                                                    purchase={purchase}
                                                                    progress={courseProgress || 0}
                                                                    onDeactivate={() => handleDeactivatePurchase(purchase.id, purchase.course.name)}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Subscription Courses Section */}
                                            {enrolledCourses.length > 0 && (

                                                <div className="space-y-4">
                                                    {enrolledCourses.map((course: EnrolledCourse) => (
                                                        <SubscriptionCourseCard
                                                            lang={lang}
                                                            key={course.id}
                                                            course={course}
                                                            progress={course.progress}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Deactivated Purchases Section */}
                                            {deactivatedPurchases.length > 0 && (
                                                <div className="mt-8">
                                                    <h3 className="text-sm font-bold text-zinc-500 mb-3 flex items-center gap-2">
                                                        <EyeOff size={14} />
                                                        Hidden Courses
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {deactivatedPurchases.map((purchase: PurchasedCourse) => (
                                                            <div key={purchase.id} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                                                <div>
                                                                    <p className="text-sm font-bold">{purchase.course.name}</p>
                                                                    <p className="text-[10px] text-zinc-400">Purchased {new Date(purchase.purchased_at).toLocaleDateString()}</p>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleReactivatePurchase(purchase.id, purchase.course.name)}
                                                                >
                                                                    Restore to Dashboard
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Empty State */}
                                            {activePurchases.length === 0 && enrolledCourses.length === 0 && (
                                                <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                                    <BookOpen className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                                                    <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No courses yet</h3>
                                                    <p className="text-sm text-zinc-500 mt-1">Browse our course catalog and start your learning journey!</p>
                                                    <Button asChild className="mt-6">
                                                        <Link href={`/${lang}/courses`}>Browse Courses</Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* PURCHASED COURSES ONLY */}
                                    {courseFilter === 'purchased' && (
                                        <>
                                            {activePurchases.length > 0 ? (
                                                <div className="space-y-4">
                                                    {activePurchases.map((purchase: PurchasedCourse) => {
                                                        const courseProgress = purchase.course.progress
                                                        return (
                                                            <PurchasedCourseCard
                                                                lang={lang}
                                                                key={purchase.id}
                                                                purchase={purchase}
                                                                progress={courseProgress || 0}
                                                                onDeactivate={() => handleDeactivatePurchase(purchase.id, purchase.course.name)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                                    <ShoppingBag className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                                                    <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No purchased courses</h3>
                                                    <p className="text-sm text-zinc-500 mt-1">You haven't purchased any courses yet.</p>
                                                    <Button asChild className="mt-6">
                                                        <Link href={`/${lang}/courses`}>Browse Courses</Link>
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Deactivated Purchases Section for purchased tab */}
                                            {deactivatedPurchases.length > 0 && (
                                                <div className="mt-8">
                                                    <h3 className="text-sm font-bold text-zinc-500 mb-3 flex items-center gap-2">
                                                        <EyeOff size={14} />
                                                        Hidden Courses
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {deactivatedPurchases.map((purchase: PurchasedCourse) => (
                                                            <div key={purchase.id} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                                                <div>
                                                                    <p className="text-sm font-bold">{purchase.course.name}</p>
                                                                    <p className="text-[10px] text-zinc-400">Purchased {new Date(purchase.purchased_at).toLocaleDateString()}</p>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleReactivatePurchase(purchase.id, purchase.course.name)}
                                                                >
                                                                    Restore to Dashboard
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* SUBSCRIBED COURSES ONLY */}
                                    {courseFilter === 'subscribed' && (
                                        <>
                                            {enrolledCourses.length > 0 ? (
                                                <div className="space-y-4">
                                                    {enrolledCourses.map((course: EnrolledCourse) => (
                                                        <SubscriptionCourseCard
                                                            lang={lang}
                                                            key={course.id}
                                                            course={course}
                                                            progress={course.progress}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                                    <BookOpen className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                                                    <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No subscription courses</h3>
                                                    <p className="text-sm text-zinc-500 mt-1">Subscribe to a plan to access courses.</p>
                                                    <Button asChild className="mt-6">
                                                        <Link href={`/${lang}/packages`}>View Plans</Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Browse More Button - Only show if courses exist */}
                                    {(activePurchases.length > 0 || enrolledCourses.length > 0) && (
                                        <Button asChild variant="outline" className="w-full h-14 mt-8 transition-all rounded-2xl hover:scale-[1]">
                                            <Link href={`/${lang}/courses`}>
                                                {learner.browseMore}
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* PERFORMANCE TAB */}
                    <TabsContent value="stats" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl font-black tracking-tight">{learner.metricsTitle}</CardTitle>
                                            <CardDescription className="text-zinc-500 font-medium">{learner.metricsDescription}</CardDescription>
                                        </div>
                                        <Badge className="bg-blue-500/10 text-blue-600 border-none font-black text-[10px] tracking-widest px-3">ANALYTICS LIVE</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-8 bg-zinc-100 dark:bg-zinc-900/20 space-y-4 py-6 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: "Average Grade", value: averageProgress > 90 ? "A+" : averageProgress > 80 ? "A" : averageProgress > 70 ? "B+" : "In Progress", icon: Target, color: "primary" },
                                            { label: "Completion Rate", value: totalCourses > 0 ? `${Math.round((completedCourses / totalCourses) * 100)}%` : "0%", icon: CheckCircle2, color: "emerald" },
                                            { label: "Study Time", value: `${totalHoursLearnt}h`, icon: Clock, color: "blue" }
                                        ].map((stat, i) => (
                                            <div key={i} className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-3">
                                                <stat.icon className={`text-${stat.color}-500`} size={18} />
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{stat.label}</p>
                                                    <p className="text-xl font-black tracking-tight">{stat.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="lg:col-span-3 p-8 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-6">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Course Progress Summary</p>
                                            <div className="space-y-4">
                                                {[...enrolledCourses, ...activePurchases.map((p: PurchasedCourse) => ({
                                                    id: p.course.id,
                                                    title: p.course.name,
                                                    progress: p.course.progress
                                                }))].map((course: any) => (
                                                    <div key={course.id} className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{course.title}</span>
                                                            <span className="text-[10px] font-black text-primary">{course.progress}%</span>
                                                        </div>
                                                        <Progress value={course.progress} className="h-1.5 rounded-full" />
                                                    </div>
                                                ))}
                                                {[...enrolledCourses, ...activePurchases].length === 0 && (
                                                    <p className="text-center text-zinc-500 py-4">No course data available. Enroll in a course to see progress.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* ACHIEVEMENTS TAB */}
                    <TabsContent value="achievements" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <CardTitle className="text-xl font-black tracking-tight">Milestones</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">Badges and rewards earned through consistent study.</CardDescription>
                                </CardHeader>

                                <CardContent className="pt-8 bg-zinc-100 dark:bg-zinc-900/20 py-8 rounded-xl">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {[
                                            { name: "First Course", icon: Zap, color: "text-yellow-500", unlocked: totalCourses >= 1, date: totalCourses >= 1 ? "Earned" : "Locked" },
                                            { name: "Perfect Score", icon: Trophy, color: "text-primary", unlocked: averageProgress === 100, date: averageProgress === 100 ? "Earned" : "Locked" },
                                            { name: "Dedicated Learner", icon: GraduationCap, color: "text-blue-500", unlocked: parseFloat(totalHoursLearnt) >= 10, date: parseFloat(totalHoursLearnt) >= 10 ? "Earned" : "Locked" },
                                            { name: "Quick Starter", icon: Award, color: "text-emerald-500", unlocked: true, date: "Unlocked" }
                                        ].map((badge, i) => (
                                            <div
                                                key={i}
                                                className={`flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 transition-all hover:scale-[1.02] cursor-pointer ${!badge.unlocked ? 'opacity-50' : ''}`}
                                            >
                                                <div className={`w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-inner ${badge.color}`}>
                                                    <badge.icon size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-tight">{badge.name}</p>
                                                    <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mt-1">{badge.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
