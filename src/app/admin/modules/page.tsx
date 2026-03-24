'use client';

import React from 'react';
import {
    Plus,
    Search,
    BookOpen,
    MoreHorizontal,
    FileText,
    Layers,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DUMMY_MODULES = [
    { id: 'M1', title: "Vector Spaces", category: "Algebra", lessons: 12, status: "Published", difficulty: "Intermediate" },
    { id: 'M2', title: "Riemann Integration", category: "Analysis", lessons: 8, status: "Draft", difficulty: "Advanced" },
    { id: 'M3', title: "Bayesian Inference", category: "Statistics", lessons: 15, status: "Published", difficulty: "Advanced" },
    { id: 'M4', title: "Complex Manifolds", category: "Geometry", lessons: 10, status: "Archived", difficulty: "Expert" },
];

export default function ModulesManagement() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Curriculum Engine</h1>
                    <p className="text-zinc-500 font-medium">Create and deploy AI-enhanced mathematical modules.</p>
                </div>
                <Button className="rounded-xl font-bold bg-primary hover:bg-orange-600 gap-2 h-12 px-6">
                    <Plus size={20} /> Create Module
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-white dark:bg-[#111114] p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3 text-zinc-400" size={18} />
                    <Input placeholder="Filter by topic or difficulty..." className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0" />
                </div>
                <Button variant="ghost" className="font-bold text-xs uppercase tracking-widest text-zinc-500">All Topics</Button>
                <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                <Button variant="ghost" className="font-bold text-xs uppercase tracking-widest text-zinc-500">Status</Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {DUMMY_MODULES.map((module) => (
                    <Card key={module.id} className="border-none shadow-sm dark:bg-[#111114] hover:ring-1 hover:ring-primary/20 transition-all group">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-primary">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-black text-lg">{module.title}</h3>
                                        <Badge variant="outline" className="text-[10px] uppercase font-black rounded-md">{module.category}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-zinc-500 text-xs font-medium">
                                        <span className="flex items-center gap-1"><Layers size={14} /> {module.lessons} Lessons</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> 4.5h Content</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right hidden md:block">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Difficulty</p>
                                    <span className={`text-xs font-bold ${module.difficulty === 'Intermediate' ? 'text-blue-500' : 'text-orange-500'
                                        }`}>{module.difficulty}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${module.status === 'Published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'
                                        }`}>
                                        {module.status}
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-xl">
                                        <MoreHorizontal size={20} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}