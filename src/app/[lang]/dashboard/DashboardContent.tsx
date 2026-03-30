"use client";

import React from 'react';
import {
    LayoutDashboard, BookOpen, Target,
    Trophy, Clock, PlayCircle,
    Star, CheckCircle2,
    Zap, Award, GraduationCap,
    Lock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function DashboardContent({ lang }: { lang: string }) {
    const COURSES_DATA = [
        {
            id: "linear-algebra",
            title: "Linear Algebra",
            tutor: "Dr. Michael Aris",
            modulesCount: 12,
            progress: 100,
            status: "Completed",
            icon: "📐",
            color: "emerald",
            modules: [
                { name: "Vectors and Matrices", status: "Done", duration: "45 mins", locked: false },
                { name: "Linear Transformations", status: "Done", duration: "1h 12 mins", locked: false },
                { name: "Eigenvalues & Eigenvectors", status: "Done", duration: "58 mins", locked: false }
            ]
        },
        {
            id: "advanced-calculus",
            title: "Advanced Calculus",
            tutor: "Kyrios AI Tutor",
            modulesCount: 8,
            progress: 68,
            status: "In Progress",
            icon: "∫",
            color: "orange",
            modules: [
                { name: "Limits and Continuity", status: "Done", duration: "32 mins", locked: false },
                { name: "Derivatives & Applications", status: "Done", duration: "55 mins", locked: false },
                { name: "Integration by Parts", status: "Current", duration: "1h 05 mins", locked: false },
                { name: "Series & Sequences", status: "Locked", duration: "48 mins", locked: true }
            ]
        },
        {
            id: "probability-stats",
            title: "Probability & Statistics",
            tutor: "Prof. Elena Voss",
            modulesCount: 10,
            progress: 22,
            status: "Starting",
            icon: "σ",
            color: "zinc",
            modules: [
                { name: "Basic Probability Concepts", status: "Done", duration: "40 mins", locked: false },
                { name: "Random Variables", status: "Locked", duration: "1h 20 mins", locked: true },
                { name: "Distributions", status: "Locked", duration: "52 mins", locked: true }
            ]
        }
    ];
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

            <Tabs defaultValue="overview" className="flex flex-col md:!flex-row gap-8 items-start">

                {/* NAVIGATION SIDEBAR */}
                <div className="w-full md:w-64 shrink-0">
                    <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1 p-0 justify-start items-start">
                        <div className="px-4 py-2 mb-1">
                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">Learning</p>
                        </div>
                        <TabsTrigger value="overview" className="gradient-tab w-full justify-start gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900">
                            <LayoutDashboard size={16} /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="courses" className="gradient-tab w-full justify-start gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900">
                            <BookOpen size={16} /> My Courses
                        </TabsTrigger>

                        <div className="px-4 py-2 mt-6 mb-1">
                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">Progress</p>
                        </div>
                        <TabsTrigger value="stats" className="gradient-tab w-full justify-start gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900">
                            <Target size={16} /> Performance
                        </TabsTrigger>
                        <TabsTrigger value="achievements" className="gradient-tab w-full justify-start gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900">
                            <Trophy size={16} /> Achievements
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

                                    {/* TOP ROW: High-Level Metrics */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: "Total Courses", value: "3", icon: BookOpen, color: "primary" },
                                            { label: "Completed", value: "1", icon: CheckCircle2, color: "emerald" },
                                            { label: "Hours Learnt", value: "42.5", icon: Clock, color: "blue" },
                                            { label: "Daily Streak", value: "12", icon: Target, color: "orange" }
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
                                                <div>
                                                    {/* <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">CURRENTLY STUDYING</p> */}
                                                    <h3 className="text-xl font-black tracking-tight">Current Courses</h3>
                                                </div>
                                                <Button variant="ghost" size="sm" className="text-xs font-medium">
                                                    View all courses →
                                                </Button>
                                            </div>

                                            {/* Carousel Container - Shows ONE course at a time */}
                                            <div className="relative overflow-hidden">
                                                <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-4 -mx-1 px-1">
                                                    {/* Course 1 - Advanced Calculus */}
                                                    <div className="min-w-full snap-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8">
                                                        <div className="flex items-center gap-4 mb-6">

                                                            <div>
                                                                <p className="font-bold">Advanced Calculus</p>
                                                                <p className="text-xs text-zinc-500">Kyrios AI Tutor • Module 3 of 8</p>
                                                            </div>
                                                        </div>

                                                        <div className="mb-8">
                                                            <div className="flex justify-between text-sm mb-2">
                                                                <span className="font-medium">Integration by Parts</span>
                                                                <span className="font-bold text-primary">68%</span>
                                                            </div>
                                                            <Progress value={68} className="h-2 rounded-full" />
                                                        </div>

                                                        {/* <Button className="w-full h-12 rounded-2xl font-bold text-base">
                                                            Continue Module <PlayCircle className="ml-2 h-5 w-5" />
                                                        </Button> */}
                                                    </div>

                                                    {/* Course 2 - Probability & Statistics */}
                                                    <div className="min-w-full snap-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8">
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div>
                                                                <p className="font-bold">Probability & Statistics</p>
                                                                <p className="text-xs text-zinc-500">Prof. Elena Voss • Module 2 of 10</p>
                                                            </div>
                                                        </div>

                                                        <div className="mb-8">
                                                            <div className="flex justify-between text-sm mb-2">
                                                                <span className="font-medium">Basic Probability Concepts</span>
                                                                <span className="font-bold text-primary">22%</span>
                                                            </div>
                                                            <Progress value={22} className="h-2 rounded-full" />
                                                        </div>


                                                    </div>

                                                </div>
                                            </div>
                                        </div>

                                        {/* Performance Summary - Right Column */}
                                        <div className="lg:col-span-3 p-8 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-6">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Performance Summary</p>

                                            <div className="space-y-4">
                                                {[
                                                    { label: "Quiz Accuracy", value: "94%", color: "text-emerald-500" },
                                                    { label: "Concept Retention", value: "88%", color: "text-blue-500" },
                                                    { label: "Focus Duration", value: "52m", color: "text-orange-500" }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0">
                                                        <span className="text-xs font-bold text-zinc-500">{item.label}</span>
                                                        <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-auto p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                                <p className="text-[10px] leading-relaxed font-medium text-zinc-500 italic">
                                                    "Your focus on Calculus has increased by 15% this week. Excellent discipline."
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </CardContent>
                            </div>
                        </Card>
                    </TabsContent>


                    <TabsContent value="courses" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <CardTitle className="text-xl font-black tracking-tight">My Courses</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">
                                        {COURSES_DATA.length} courses enrolled • Expand to see modules and progress
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-8 bg-zinc-100 dark:bg-zinc-900/20  overflow-hidden py-6 rounded-lg">
                                    <Accordion type="single" collapsible className="space-y-4">
                                        {COURSES_DATA.map((course) => (
                                            <AccordionItem
                                                key={course.id}
                                                value={course.id}
                                                className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden"
                                            >
                                                <AccordionTrigger className="px-4 py-5 cursor-pointer hover:no-underline group bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                                                    <div className="flex items-center gap-5 w-full">
                                                        {/* <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-2xl font-black text-zinc-400 group-hover:text-primary transition-colors">
                                                            {course.icon}
                                                        </div> */}

                                                        <div className="flex-1 text-left">
                                                            <div className="flex items-center justify-between">
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

                                                            <div className="flex justify-start">
                                                                <div className="mt-4 flex w-full items-center max-w-[300px] gap-6">
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
                                                        {course.modules.map((module, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`p-4 md:p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group border-b border-zinc-50 dark:border-zinc-800/20 last:border-0 ${module.status === 'Current' ? 'bg-primary/5 dark:bg-primary/10' : ''
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    {/* Index Circle - Switches to Checkmark if Done */}
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
                                                                            {/* Optional: Add duration here if available in your module object */}
                                                                            {module.duration && (
                                                                                <>
                                                                                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{module.duration}</p>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Right Action Icon */}
                                                                <div className="flex items-center">
                                                                    {module.status === 'Locked' ? (
                                                                        <Lock size={18} className="text-zinc-300 dark:text-zinc-600" />
                                                                    ) : (
                                                                        <button
                                                                            className={`focus:outline-none transition-all ${module.status === 'Current' ? 'scale-110' : 'opacity-40 group-hover:opacity-100'
                                                                                }`}
                                                                        >
                                                                            <PlayCircle
                                                                                size={22}
                                                                                className={`${module.status === 'Current' ? 'text-primary animate-pulse' : 'text-zinc-400'}`}
                                                                            />
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

                                    <Button variant="default" className="w-full h-14 mt-8 transition-all rounded-2xl hover:scale-[1]">
                                        + Browse more mathematics courses
                                    </Button>
                                </CardContent>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* 3. PERFORMANCE TAB - Intelligence Metrics */}
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

                                    {/* TOP ROW: Realistic Aggregated Metrics (Calculated from API) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: "Average Grade", value: "A+", icon: Target, color: "primary" },
                                            { label: "Accuracy Rate", value: "94%", icon: CheckCircle2, color: "emerald" },
                                            { label: "Avg Response", value: "8.2s", icon: Clock, color: "blue" }
                                        ].map((stat, i) => (
                                            <div key={i} className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-3 ">
                                                <stat.icon className={`text-${stat.color}-500`} size={18} />
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{stat.label}</p>
                                                    <p className="text-xl font-black tracking-tight">{stat.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {/* <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl ">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-xl font-black tracking-tight">Skill Mastery</h3>
                                            </div>

                                            <div className="space-y-6">
                                                {[
                                                    { name: "Linear Algebra", val: 92, status: "Mastered" },
                                                    { name: "Calculus II", val: 68, status: "In Progress" },
                                                    { name: "Vector Spaces", val: 45, status: "Developing" },
                                                    { name: "Probability", val: 12, status: "Beginner" }
                                                ].map((skill, i) => (
                                                    <div key={i} className="space-y-2">
                                                        <div className="flex justify-between items-end">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{skill.name}</span>
                                                                <span className="text-[8px] font-black uppercase text-zinc-400 tracking-tighter">{skill.status}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black">{skill.val}%</span>
                                                        </div>
                                                        <Progress value={skill.val} className="h-1.5 rounded-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div> */}

                                        {/* RIGHT: Recent Activity (Maps to: GET /api/user/activity) */}
                                        <div className="lg:col-span-3 p-8 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-6 ">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Recent Evaluations</p>

                                            <div className="space-y-4">
                                                {[
                                                    { type: "Quiz", title: "Partial Derivatives", score: "18/20", time: "2h ago", color: "text-emerald-500" },
                                                    { type: "Practice", title: "Integration by Parts", score: "88%", time: "5h ago", color: "text-blue-500" },
                                                    { type: "Quiz", title: "Limit Laws", score: "14/20", time: "Yesterday", color: "text-orange-500" },
                                                    { type: "Diagnostic", title: "Pre-Calc Review", score: "100%", time: "2 days ago", color: "text-primary" }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{item.type}</span>
                                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.title}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-sm font-black block ${item.color}`}>{item.score}</span>
                                                            <span className="text-[9px] text-zinc-400 font-medium">{item.time}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-auto p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                                                    Total Practice Time: <span className="text-zinc-900 dark:text-white">14.5 Hours</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </CardContent>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="achievements" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <CardTitle className="text-xl font-black tracking-tight">Milestones</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">Badges and rewards earned through consistent study.</CardDescription>
                                </CardHeader>

                                {/* Theme-consistent background and spacing */}
                                <CardContent className="pt-8 bg-zinc-100 dark:bg-zinc-900/20 py-8 rounded-xl">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {[
                                            { name: "Fast Learner", icon: Zap, color: "text-yellow-500", date: "Mar 12" },
                                            { name: "Top Percent", icon: Trophy, color: "text-primary", date: "Feb 28" },
                                            { name: "Math Scholar", icon: GraduationCap, color: "text-blue-500", date: "Jan 15" },
                                            { name: "Quiz Master", icon: Award, color: "text-emerald-500", date: "Unlocked" }
                                        ].map((badge, i) => (
                                            <div
                                                key={i}
                                                className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800  transition-all hover:scale-[1.02] cursor-pointer"
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