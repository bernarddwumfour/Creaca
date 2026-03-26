"use client";

import React from 'react';
import {
    LayoutDashboard, BookOpen, Target,
    Trophy, Clock, PlayCircle,
    ChevronRight, Brain, Star, CheckCircle2,
    BarChart3, Zap, Award, GraduationCap,
    Sigma, Binary, FunctionSquare
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function DashboardContent({ lang }: { lang: string }) {

    const cardAnimationClasses = "group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-xl border-none bg-white dark:bg-[#111114]";
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

                    {/* 1. OVERVIEW TAB */}
                    <TabsContent value="overview" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl font-black tracking-tight">Learning Status</CardTitle>
                                            <CardDescription className="text-zinc-500 font-medium">Your current focus and recent progress.</CardDescription>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest px-3">ACTIVE</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-12 space-y-12">
                                    {/* Primary Focus */}
                                    <div className="space-y-6">
                                        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Active Module</p>
                                                <h3 className="text-2xl font-black">Advanced Calculus: Integration</h3>
                                            </div>
                                            <Button className="h-12 px-8 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 font-bold rounded-xl text-white">
                                                Continue <PlayCircle className="ml-2 h-5 w-5" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-zinc-400">Course Progress</span>
                                                <span className="text-primary">74%</span>
                                            </div>
                                            <Progress value={74} className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                                        </div>
                                    </div>

                                    {/* Quick Stats Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600"><Clock size={24} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-zinc-400">Total Study Time</p>
                                                <p className="text-xl font-black">42.5 Hours</p>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Star size={24} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-zinc-400">Current Streak</p>
                                                <p className="text-xl font-black">12 Days</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* 2. MY COURSES TAB */}
                    <TabsContent value="courses" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <CardTitle className="text-xl font-black tracking-tight">Active Curriculum</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">Manage your enrolled mathematics modules.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-12 space-y-4">
                                    {[
                                        { title: "Linear Algebra", tutor: "Dr. Aris", progress: 100, status: "Completed", icon: Binary },
                                        { title: "Advanced Calculus", tutor: "AI Engine", progress: 74, status: "In Progress", icon: FunctionSquare },
                                        { title: "Probability & Stats", tutor: "Prof. Sarah", progress: 15, status: "Starting", icon: Sigma }
                                    ].map((course, i) => (
                                        <div key={i} className="group/item flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all gap-6">
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover/item:text-primary transition-colors">
                                                    <course.icon size={28} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-lg">{course.title}</h4>
                                                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{course.tutor}</p>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-48 space-y-2">
                                                <div className="flex justify-between text-[9px] font-black uppercase">
                                                    <span>{course.status}</span>
                                                    <span>{course.progress}%</span>
                                                </div>
                                                <Progress value={course.progress} className="h-1.5" />
                                            </div>
                                            <Button variant="ghost" size="icon" className="hidden md:flex rounded-full group-hover/item:bg-primary group-hover/item:text-white transition-all">
                                                <ChevronRight size={20} />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* 3. PERFORMANCE TAB */}
                    <TabsContent value="stats" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <CardTitle className="text-xl font-black tracking-tight">Intelligence Metrics</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">Detailed breakdown of your mathematical proficiency.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-12 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="text-center space-y-2">
                                            <p className="text-4xl font-black text-primary">A+</p>
                                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Average Grade</p>
                                        </div>
                                        <div className="text-center space-y-2 border-x border-zinc-100 dark:border-zinc-800/50">
                                            <p className="text-4xl font-black">94%</p>
                                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Accuracy Rate</p>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-4xl font-black text-blue-500">8.2s</p>
                                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Avg Response</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Subject Mastery</h4>
                                        <div className="space-y-6">
                                            {["Pure Mathematics", "Statistics", "Computational Math"].map((subject, i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="flex justify-between text-sm font-bold">
                                                        <span>{subject}</span>
                                                        <span className="text-primary">Mastery: 8{i}%</span>
                                                    </div>
                                                    <Progress value={80 + i} className="h-1.5" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* 4. ACHIEVEMENTS TAB */}
                    <TabsContent value="achievements" className="mt-0 outline-none">
                        <Card className={cardAnimationClasses}>
                            {cardInnerOverlay}
                            <div className="relative z-20">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
                                    <CardTitle className="text-xl font-black tracking-tight">Milestones</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">Badges and rewards earned through consistent study.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-12">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {[
                                            { name: "Fast Learner", icon: Zap, color: "text-yellow-500", date: "Mar 12" },
                                            { name: "Top Percent", icon: Trophy, color: "text-primary", date: "Feb 28" },
                                            { name: "Math Scholar", icon: GraduationCap, color: "text-blue-500", date: "Jan 15" },
                                            { name: "Quiz Master", icon: Award, color: "text-emerald-500", date: "Unlocked" }
                                        ].map((badge, i) => (
                                            <div key={i} className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50 grayscale hover:grayscale-0 transition-all cursor-pointer">
                                                <div className={`w-16 h-16 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm ${badge.color}`}>
                                                    <badge.icon size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-tight">{badge.name}</p>
                                                    <p className="text-[9px] text-zinc-400 font-bold">{badge.date}</p>
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