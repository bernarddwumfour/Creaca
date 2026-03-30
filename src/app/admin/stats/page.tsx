'use client';

import React from 'react';
import { TrendingUp, Users, Award, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PerformanceAnalytics() {
    return (
        <div className="space-y-8">
            {/* Header - New Theme Style */}
            <div>
                <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">
                    ANALYTICS DASHBOARD
                </p>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    Performance <span className="text-orange-600">Lab.</span>
                </h1>
                <p className="text-zinc-500 font-medium tracking-tight text-sm">
                    Deep-dive into student mastery and engagement cohorts.
                </p>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Global Accuracy - Big Card */}
                <Card className="lg:col-span-2 shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden p-8 rounded-3xl">
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-emerald-500" size={28} />
                            <p className="text-sm font-black uppercase tracking-widest text-emerald-500">GLOBAL ACCURACY</p>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter text-primary">98.4%</h2>
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                            <TrendingUp size={18} />
                            <span>+4.2% from last month</span>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 w-2/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                </Card>

                {/* Side Stats */}
                <Card className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center p-8 rounded-3xl">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl">
                                <Users size={26} />
                            </div>
                            <div>
                                <p className="text-3xl font-black tracking-tight">1,402</p>
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Active Students</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                                <Award size={26} />
                            </div>
                            <div>
                                <p className="text-3xl font-black tracking-tight">842</p>
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Mastery Certs Issued</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Learning Paths */}
                <Card className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Top Learning Paths</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        {[
                            { path: "Quantum Computation", growth: "92%", students: 45 },
                            { path: "Differential Geometry", growth: "88%", students: 120 },
                            { path: "Neural Topology", growth: "76%", students: 88 },
                        ].map((p, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500">
                                        #{i + 1}
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{p.path}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono font-black text-primary">{p.growth}</span>
                                    <ChevronRight size={18} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Curriculum Milestone */}
                <Card className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center py-10">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Curriculum Milestone</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="relative w-40 h-40 flex items-center justify-center border-[10px] border-primary border-t-zinc-100 dark:border-t-zinc-800 rounded-full mb-6">
                            <span className="text-4xl font-black text-primary">72%</span>
                        </div>
                        <p className="text-center text-sm font-medium text-zinc-500 max-w-[240px]">
                            Global Student Completion Rate for "Analysis I"
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}