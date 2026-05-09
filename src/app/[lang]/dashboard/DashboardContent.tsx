"use client";

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, BookOpen, Target,
    Trophy, Clock, PlayCircle,
    Star, CheckCircle2,
    Zap, Award, GraduationCap,
    Lock,
    ChevronRight,
    Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import Link from 'next/link';

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
    created_at?: string;
    updated_at?: string;
}

interface Registration {
    id: string;
    course: {
        id: string;
        name: string;
        slug: string;
        difficulty: string;
        duration: number | null;
        subject: {
            id: string;
            name: string;
        }
    };
    status: 'active' | 'completed' | 'dropped';
    progress: number;
    enrolled_at: string;
    completed_at: string | null;
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

export default function DashboardContent({ lang }: { lang: string }) {
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch user's registered courses
    const { data: registrationsResponse, isLoading: registrationsLoading } = useQuery({
        queryKey: ['user-registrations'],
        queryFn: async () => {
            const { data } = await api.get('/api/v1/courses/my-registrations/');
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

    const registrations = registrationsResponse?.data?.results || [];
    const allCourses = coursesResponse?.data?.results || [];

    // Transform registrations into course data format
    const enrolledCourses = registrations.map((reg: Registration) => ({
        id: reg.course.id,
        title: reg.course.name,
        slug: reg.course.slug,
        tutor: reg.course.subject.name,
        modulesCount: 8, // Static for now until modules are ready
        progress: reg.progress || 0,
        status: reg.status === 'completed' ? 'Completed' : reg.status === 'active' ? 'In Progress' : 'Starting',
        icon: reg.course.name.charAt(0),
        color: reg.status === 'completed' ? 'emerald' : reg.progress > 50 ? 'orange' : 'zinc',
        modules: [
            { name: "Introduction", status: reg.progress > 0 ? "Done" : "Locked", duration: "30 mins", locked: reg.progress === 0 },
            { name: "Core Concepts", status: reg.progress > 25 ? "Done" : reg.progress > 0 ? "Current" : "Locked", duration: "45 mins", locked: reg.progress < 25 },
            { name: "Advanced Topics", status: reg.progress > 50 ? "Done" : reg.progress > 25 ? "Current" : "Locked", duration: "60 mins", locked: reg.progress < 50 },
            { name: "Mastery & Review", status: reg.progress > 75 ? (reg.progress === 100 ? "Done" : "Current") : "Locked", duration: "45 mins", locked: reg.progress < 75 },
        ].slice(0, 4)
    }));

    // Find current course (in progress with highest progress)
    const currentCourse = enrolledCourses.find((c: any) => c.status === 'In Progress' && c.progress < 100) || enrolledCourses[0];

    // Stats calculations
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter((c: any) => c.status === 'Completed').length;
    const totalHoursLearnt = enrolledCourses.reduce((acc: number, c: any) => acc + (c.progress / 100) * (c.modulesCount * 0.75), 0).toFixed(1);
    const averageProgress = enrolledCourses.length > 0
        ? Math.round(enrolledCourses.reduce((acc: number, c: any) => acc + c.progress, 0) / enrolledCourses.length)
        : 0;

    const isLoading = registrationsLoading || coursesLoading;

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

    return (
        <div className="w-full mx-auto">
            <style jsx global>{`
                .gradient-tab[data-state=active] {
                    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%) !important;
                    color: white !important;
                }
            `}</style>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:!flex-row gap-8 items-start">

                {/* NAVIGATION SIDEBAR */}
                <div className={cn(
                    "shrink-0 transition-all duration-500 ease-in-out relative border-r border-zinc-100 dark:border-zinc-800/50",
                    isCollapsed ? "w-14" : "w-full md:w-64"
                )}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-10 z-50 w-6 h-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-orange-600 transition-all shadow-sm active:scale-90"
                    >
                        <ChevronRight className={cn("transition-transform duration-500", !isCollapsed && "rotate-180")} size={12} />
                    </button>

                    <TabsList className={cn(
                        "flex flex-col h-auto w-full bg-transparent space-y-1 p-0 justify-start items-start transition-all duration-500",
                        isCollapsed ? "items-center" : "items-start"
                    )}>

                        <div className={cn("px-4 py-2 mb-1 transition-opacity duration-300", isCollapsed ? "opacity-0 h-8" : "opacity-100")}>
                            {!isCollapsed && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em] whitespace-nowrap">Learning</p>}
                        </div>

                        <TabsTrigger
                            value="overview"
                            className={cn(
                                "gradient-tab w-full flex items-center px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900",
                                isCollapsed ? "justify-center py-6" : "justify-start gap-3 py-3"
                            )}
                        >
                            <LayoutDashboard size={16} className="shrink-0" />
                            {!isCollapsed && <span className="truncate">Overview</span>}
                        </TabsTrigger>

                        <TabsTrigger
                            value="courses"
                            className={cn(
                                "gradient-tab w-full flex items-center px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900",
                                isCollapsed ? "justify-center py-6" : "justify-start gap-3 py-3"
                            )}
                        >
                            <BookOpen size={16} className="shrink-0" />
                            {!isCollapsed && <span className="truncate">My Courses</span>}
                        </TabsTrigger>

                        <div className={cn("px-4 py-2 mt-6 mb-1 transition-opacity duration-300", isCollapsed ? "opacity-0 h-8" : "opacity-100")}>
                            {!isCollapsed && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em] whitespace-nowrap">Progress</p>}
                        </div>

                        <TabsTrigger
                            value="stats"
                            className={cn(
                                "gradient-tab w-full flex items-center px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900",
                                isCollapsed ? "justify-center py-6" : "justify-start gap-3 py-3"
                            )}
                        >
                            <Target size={16} className="shrink-0" />
                            {!isCollapsed && <span className="truncate">Performance</span>}
                        </TabsTrigger>

                        <TabsTrigger
                            value="achievements"
                            className={cn(
                                "gradient-tab w-full flex items-center px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900",
                                isCollapsed ? "justify-center py-6" : "justify-start gap-3 py-3"
                            )}
                        >
                            <Trophy size={16} className="shrink-0" />
                            {!isCollapsed && <span className="truncate">Achievements</span>}
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs font-medium"
                                                    onClick={() => setActiveTab('courses')}
                                                >
                                                    View all courses →
                                                </Button>
                                            </div>

                                            <div className="relative overflow-hidden">
                                                <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-1 px-1">
                                                    {enrolledCourses.filter((c: any) => c.status !== 'Completed').slice(0, 2).map((course: any) => (
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
                                                    {enrolledCourses.filter((c: any) => c.status !== 'Completed').length === 0 && (
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

                    {/* MY COURSES TAB */}
                    <TabsContent value="courses" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <CardTitle className="text-xl font-black tracking-tight">My Courses</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">
                                        {enrolledCourses.length} courses enrolled • Track your progress and continue learning
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-8 bg-zinc-100 dark:bg-zinc-900/20 overflow-hidden py-6 rounded-lg">
                                    {enrolledCourses.length > 0 ? (
                                        <Accordion type="single" collapsible className="space-y-4">
                                            {enrolledCourses.map((course: any) => (
                                                <AccordionItem
                                                    key={course.id}
                                                    value={course.id}
                                                    className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden"
                                                >
                                                    <AccordionTrigger className="px-4 py-5 cursor-pointer hover:no-underline group bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                                                        <div className="flex items-center gap-5 w-full">
                                                            <div className="flex-1 text-left">
                                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                                    <h4 className="font-bold text-lg tracking-tight">{course.title}</h4>
                                                                    <Badge className={`
                                                                        border-none font-black text-[10px] tracking-widest px-3
                                                                        ${course.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' :
                                                                            course.status === 'In Progress' ? 'bg-orange-500/10 text-primary' :
                                                                                'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}
                                                                    `}>
                                                                        {course.status.toUpperCase()}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-[10px] font-semibold uppercase text-zinc-400 tracking-widest mt-1">
                                                                    {course.tutor} • {course.modulesCount} Modules
                                                                </p>
                                                                <div className="flex justify-start mt-4">
                                                                    <div className="flex w-full items-center max-w-[300px] gap-6">
                                                                        <div className="flex w-1/2 justify-between text-[9px] font-black uppercase tracking-tighter">
                                                                            <span className="text-zinc-400">Mastery Level</span>
                                                                            <span className={course.status === 'Completed' ? 'text-emerald-500' : 'text-primary'}>
                                                                                {course.progress}%
                                                                            </span>
                                                                        </div>
                                                                        <Progress value={course.progress} className="h-[6px] bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>

                                                    <AccordionContent className="px-0 pb-2 pt-0 border-t border-zinc-100 dark:border-zinc-800/50">
                                                        <div className="flex flex-col">
                                                            {course.modules.map((module: any, idx: number) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`p-4 md:p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group border-b border-zinc-50 dark:border-zinc-800/20 last:border-0 ${module.status === 'Current' ? 'bg-primary/5 dark:bg-primary/10' : ''
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${module.status === 'Done'
                                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                                            : module.status === 'Current'
                                                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
                                                                            }`}>
                                                                            {module.status === 'Done' ? <CheckCircle2 size={16} /> : idx + 1}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className={`font-bold text-sm md:text-base tracking-tight ${module.status === 'Current' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                                                                                }`}>
                                                                                {module.name}
                                                                            </h4>
                                                                            <div className="flex items-center gap-2">
                                                                                <p className={`text-[10px] font-black uppercase tracking-widest ${module.status === 'Current' ? 'text-primary' : 'text-zinc-400'
                                                                                    }`}>
                                                                                    {module.status}
                                                                                </p>
                                                                                {module.duration && (
                                                                                    <>
                                                                                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase">{module.duration}</p>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center">
                                                                        {module.status === 'Locked' ? (
                                                                            <Lock size={18} className="text-zinc-300 dark:text-zinc-600" />
                                                                        ) : (
                                                                            <button className="focus:outline-none transition-all">
                                                                                <PlayCircle size={22} className={`${module.status === 'Current' ? 'text-primary' : 'text-zinc-400 opacity-40 group-hover:opacity-100'}`} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    ) : (
                                        <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                            <BookOpen className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                                            <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No courses enrolled yet</h3>
                                            <p className="text-sm text-zinc-500 mt-1">Browse our course catalog and start your learning journey!</p>
                                            <Button asChild className="mt-6">
                                                <Link href={`/${lang}/courses`}>Browse Courses</Link>
                                            </Button>
                                        </div>
                                    )}

                                    <Button asChild variant="default" className="w-full h-14 mt-8 transition-all rounded-2xl hover:scale-[1]">
                                        <Link href={`/${lang}/courses`}>
                                            + Browse more mathematics courses
                                        </Link>
                                    </Button>
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
                                            <CardTitle className="text-xl font-black tracking-tight">Intelligence Metrics</CardTitle>
                                            <CardDescription className="text-zinc-500 font-medium">Detailed breakdown of your mathematical proficiency.</CardDescription>
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
                                                {enrolledCourses.map((course: any) => (
                                                    <div key={course.id} className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{course.title}</span>
                                                            <span className="text-[10px] font-black text-primary">{course.progress}%</span>
                                                        </div>
                                                        <Progress value={course.progress} className="h-1.5 rounded-full" />
                                                    </div>
                                                ))}
                                                {enrolledCourses.length === 0 && (
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
                                            { name: "First Course", icon: Zap, color: "text-yellow-500", unlocked: completedCourses >= 1, date: completedCourses >= 1 ? "Earned" : "Locked" },
                                            { name: "Perfect Score", icon: Trophy, color: "text-primary", unlocked: averageProgress === 100, date: averageProgress === 100 ? "Earned" : "Locked" },
                                            { name: "Dedicated Learner", icon: GraduationCap, color: "text-blue-500", unlocked: totalHoursLearnt >= 10, date: totalHoursLearnt >= 10 ? "Earned" : "Locked" },
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