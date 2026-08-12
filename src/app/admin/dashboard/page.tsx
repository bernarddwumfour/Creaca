'use client';

import React from 'react';
import Link from 'next/link';
import {
    Button
} from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Zap,
    BrainCircuit,
    BookOpen,
    Users,
    Plus,
    ArrowRight,
    Activity,
    ShieldCheck,
    BarChart3,
    Layers,
    Clock,
    ShieldAlert,
    Globe,
    MousePointerClick
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

export default function AdminDashboard() {
    const { data } = useQuery({ queryKey: ['admin-stats'], queryFn: async () => (await api.get(ENDPOINTS.PLATFORM.ADMIN_STATS)).data.data });
    const stats = [
        { label: 'Total Users', val: data?.total_users ?? '—', icon: Users, color: 'text-blue-500' },
        { label: 'Active Courses', val: data?.active_courses ?? '—', icon: Layers, color: 'text-emerald-500' },
        { label: 'Active Subjects', val: data?.active_subjects ?? '—', icon: BookOpen, color: 'text-orange-500' },
        { label: 'Subscriptions', val: data?.active_subscriptions ?? '—', icon: Activity, color: 'text-purple-500' },
        { label: 'Purchases', val: data?.course_purchases ?? '—', icon: MousePointerClick, color: 'text-indigo-500' },
        { label: 'Revenue (GHS)', val: data?.total_revenue ?? '—', icon: BarChart3, color: 'text-amber-500' },
        { label: 'Completion', val: data ? `${data.completion_rate}%` : '—', icon: BrainCircuit, color: 'text-sky-500' },
        { label: 'Subjects', val: data?.total_subjects ?? '—', icon: Globe, color: 'text-rose-500' },
    ];
    return (
        <div className="space-y-6">
            {/* Standardized Admin Header - Matching Kyrios Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="max-w-lg space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">
                        SYSTEM OVERSIGHT
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                        Welcome, <span className="text-orange-600">Bernard.</span>
                    </h1>
                    <p className="text-zinc-500 font-medium text-sm">
                        The <span className="font-black text-primary">Kyrios Engine</span> is operating at 98.4% efficiency.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link href="/admin/logs">
                        <Button
                            variant="outline"
                            className="rounded-xl font-black uppercase tracking-widest text-[9px] h-11 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                        >
                            <ShieldCheck size={14} className="mr-2" /> View Logs
                        </Button>
                    </Link>
                    <Link href="/admin/subjects/courses">
                        <Button className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all ">
                            <Layers size={18} className="mr-2" /> Manage Courses
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid - Matching your dashboard style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card
                        key={i}
                        className="shadow-none  bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 group hover:-translate-y-0.5 transition-all py-2"
                    >
                        <CardContent className="p-3 sm:p-6 flex items-center gap-4">
                            <div className={`p-2 sm:p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 ${stat.color} transition-all group-hover:scale-110`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em]">{stat.label}</p>
                                <p className="text-2xl font-black tracking-tight mt-1">{stat.val}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Content Pipeline Tracking */}
                <Card className="shadow-none lg:col-span-2 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800  overflow-hidden">
                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-3 sm:pb-6">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                <BarChart3 size={14} className="text-primary" />
                                DEPLOYMENT PIPELINE
                            </CardTitle>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] tracking-widest px-3">
                                NOMINAL
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-8">
                        <div className="relative p-4 sm:p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#111114] group hover:border-primary/30 transition-all">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Web Development Path Update</h3>
                                    <p className="text-sm text-zinc-500 mt-1">4 JSON Modules Pending Review</p>
                                </div>
                                <span className="text-lg font-black text-orange-600 tracking-tight">URGENT</span>
                            </div>

                            <Progress value={60} className="h-[6px] bg-zinc-100 dark:bg-zinc-800 mb-8" />

                            <div className="flex justify-between items-center">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    Team: <span className="text-slate-900 dark:text-white font-black">Content A</span>
                                </div>
                                <Link href="/admin/subjects/modules">
                                    <Button className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-8 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-primary transition-all">
                                        Review Schema <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Alerts & Insights */}
                <Card className="shadow-none  bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 ">
                    <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <Zap size={14} /> CRITICAL INSIGHTS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-3 sm:p-6 rounded-3xl bg-orange-500/5 border border-orange-500/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600">
                                    <BookOpen size={18} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-700">Content Bottleneck</p>
                            </div>
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                High failure rate in <span className="font-black text-slate-900 dark:text-white">"Eigenvalues"</span>. Schema requires refinement.
                            </p>
                            <Button size="sm" variant="outline" className="mt-5 w-full rounded-2xl font-black text-[9px] uppercase tracking-widest h-10">
                                Edit Schema
                            </Button>
                        </div>

                        <div>
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4">REGISTRY HEALTH</h4>
                            <div className="space-y-3">
                                {[
                                    { name: 'Subjects', status: 'OK', color: 'text-emerald-500' },
                                    { name: 'Courses', status: 'OK', color: 'text-emerald-500' },
                                    { name: 'Modules', status: '4 DRAFTS', color: 'text-orange-500' },
                                ].map((item) => (
                                    <div key={item.name} className="flex justify-between items-center px-2 py-1">
                                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{item.name}</p>
                                        <p className={`text-xs font-black ${item.color}`}>{item.status}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
