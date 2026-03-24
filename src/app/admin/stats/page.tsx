'use client';

import React from 'react';
import { TrendingUp, Users, Award, Target, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PerformanceAnalytics() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase">Performance Lab</h1>
                <p className="text-zinc-500 font-medium">Deep-dive into student mastery and engagement cohorts.</p>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 relative overflow-hidden p-8 rounded-3xl">
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-4xl font-black tracking-tighter">98.4%</h2>
                        <p className="text-sm font-bold opacity-70 uppercase tracking-widest">Global Platform Accuracy</p>
                        <div className="pt-4">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                <TrendingUp size={20} />
                                <span>+4.2% from last month</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Graph Placeholder */}
                    <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
                </Card>

                <Card className="border-none shadow-sm dark:bg-[#111114] flex flex-col justify-center p-8 rounded-3xl">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-black">1,402</p>
                                <p className="text-[10px] font-black uppercase text-zinc-500">Active Students</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-black">842</p>
                                <p className="text-[10px] font-black uppercase text-zinc-500">Mastery Certs Issued</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Performers */}
                <Card className="border-none shadow-sm dark:bg-[#111114]">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest">Top Learning Paths</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { path: "Quantum Computation", growth: "92%", students: 45 },
                            { path: "Differential Geometry", growth: "88%", students: 120 },
                            { path: "Neural Topology", growth: "76%", students: 88 },
                        ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black italic">#{i + 1}</div>
                                    <span className="font-bold text-sm">{p.path}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono font-bold text-primary">{p.growth}</span>
                                    <ChevronRight size={16} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Global Goal Progress */}
                <Card className="border-none shadow-sm dark:bg-[#111114]">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest">Curriculum Milestone</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-32 h-32 flex items-center justify-center border-8 border-primary border-t-zinc-100 dark:border-t-zinc-800 rounded-full mb-4">
                            <span className="text-2xl font-black">72%</span>
                        </div>
                        <p className="text-center text-xs font-medium text-zinc-500">Global Student Completion Rate for "Analysis I"</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}