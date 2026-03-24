'use client';

import React from 'react';
import { BrainCircuit, ThumbsUp, ThumbsDown, Zap, BarChart3, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const AI_METRICS = [
    { label: "Response Accuracy", value: "94.8%", change: "+2.1%", status: "Good" },
    { label: "Avg. Latency", value: "1.2s", change: "-0.3s", status: "Optimal" },
    { label: "Token Usage", value: "840k", change: "+12%", status: "Warning" },
    { label: "Success Rate", value: "91%", change: "+0.5%", status: "Good" },
];

export default function AITutorAnalytics() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">AI Tutor Insights</h1>
                    <p className="text-zinc-500 font-medium">Monitoring model performance and student-AI interactions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {AI_METRICS.map((metric) => (
                    <Card key={metric.label} className="border-none shadow-sm dark:bg-[#111114]">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{metric.label}</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black">{metric.value}</span>
                                <span className={`text-xs font-bold ${metric.change.includes('+') ? 'text-emerald-500' : 'text-blue-500'}`}>
                                    {metric.change}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Questioned Topics */}
                <Card className="border-none shadow-sm dark:bg-[#111114]">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Target size={16} className="text-primary" /> Topic Difficulty Heatmap
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { topic: "Eigenvalues & Eigenvectors", difficulty: 85 },
                            { topic: "Partial Derivatives", difficulty: 62 },
                            { topic: "Stochastic Processes", difficulty: 45 },
                            { topic: "Fourier Series", difficulty: 38 },
                        ].map((item) => (
                            <div key={item.topic} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>{item.topic}</span>
                                    <span className="text-zinc-500">{item.difficulty}% Struggle Rate</span>
                                </div>
                                <Progress value={item.difficulty} className="h-1.5" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Feedback Logs */}
                <Card className="border-none shadow-sm dark:bg-[#111114]">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 size={16} className="text-primary" /> Recent Student Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                <div className={i === 2 ? "text-red-500" : "text-emerald-500"}>
                                    {i === 2 ? <ThumbsDown size={18} /> : <ThumbsUp size={18} />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold">"The explanation for matrix kernel was too brief."</p>
                                    <p className="text-[10px] text-zinc-500 font-mono italic">Module: Linear Algebra • Student #4421</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}