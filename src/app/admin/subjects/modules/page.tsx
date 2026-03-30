'use client';

import React, { useState } from 'react';
import {
    Plus,
    Search,
    BookOpen,
    MoreHorizontal,
    Layers,
    Pencil,
    Trash2,
    Eye,
    FileJson
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';
import { ConfirmDialog } from '../../../../../widgets/ConfirmDialog/ConfirmDialog';
import { ModuleForm } from '../(components)/ModuleForm';
import LessonModal from '@/app/[lang]/courses/[id]/LessonModal';

const DUMMY_MODULES = [
    { id: 'M1', title: "Vector Spaces", category: "Algebra", lessonsCount: 12, status: "Published", difficulty: "Intermediate" },
    { id: 'M2', title: "Limits and Continuity", category: "Calculus", lessonsCount: 8, status: "Draft", difficulty: "Beginner" },
];

export default function ModulesManagement() {
    const [activeModal, setActiveModal] = useState<'CREATE' | 'UPDATE' | 'DELETE' | 'PREVIEW' | null>(null);
    const [selectedModule, setSelectedModule] = useState<any>(null);

    const closeModals = () => {
        setActiveModal(null);
        setSelectedModule(null);
    };

    const handleConfirmDelete = async () => {
        console.log("Deleted module:", selectedModule?.id);
        closeModals();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="max-w-xl space-y-2">
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">
                        CONTENT REGISTRY
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                        Engineered <span className="text-orange-600">Modules.</span>
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-tight text-sm">
                        Deploy and manage high-fidelity JSON-driven mathematical units.
                    </p>
                </div>

                {/* Create Module Button - Consistent with other action buttons */}
                <Button
                    onClick={() => setActiveModal('CREATE')}
                    className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all"
                >
                    <Plus size={18} className="mr-2" /> Create Module
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center bg-white dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
                    <Input
                        placeholder="Filter by topic or difficulty..."
                        className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 font-medium placeholder:text-zinc-400"
                    />
                </div>
                <div className="hidden md:flex items-center gap-2 pr-2">
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        By Topic
                    </Button>
                    <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        Status
                    </Button>
                </div>
            </div>

            {/* Modules List - Using new theme */}
            <div className="grid grid-cols-1 gap-4">
                {DUMMY_MODULES.map((module) => (
                    <Card
                        key={module.id}
                        className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 group hover:-translate-y-0.5 transition-all overflow-hidden"
                    >
                        <CardContent className="p-0">
                            <div className="py-4 px-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <BookOpen size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-black text-xl tracking-tight">{module.title}</h3>
                                            <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none text-[10px] font-black tracking-widest uppercase italic">
                                                {module.category}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-5 mt-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5">
                                                <Layers size={14} className="text-primary/60" />
                                                {module.lessonsCount} Units
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <FileJson size={14} className="text-primary/60" /> Schema OK
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Difficulty</p>
                                        <span className={`text-xs font-bold uppercase ${module.difficulty === 'Beginner' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                            {module.difficulty}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest 
                                            ${module.status === 'Published'
                                                ? 'bg-emerald-500/10 text-emerald-600'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                            }`}>
                                            {module.status}
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 h-10 w-10 transition-colors"
                                                >
                                                    <MoreHorizontal size={20} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                                                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                                    Module Controls
                                                </DropdownMenuLabel>

                                                <DropdownMenuItem
                                                    onSelect={() => { setSelectedModule(module); setActiveModal('PREVIEW'); }}
                                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                >
                                                    <Eye size={16} /> Preview Content
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onSelect={() => { setSelectedModule(module); setActiveModal('UPDATE'); }}
                                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                >
                                                    <Pencil size={16} /> Update Module
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />

                                                <DropdownMenuItem
                                                    onSelect={() => { setSelectedModule(module); setActiveModal('DELETE'); }}
                                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-bold text-xs"
                                                >
                                                    <Trash2 size={16} /> Delete Module
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialogs */}
            <CustomDialog
                title={activeModal === 'CREATE' ? "Create Module" : "Update Module"}
                description={activeModal === 'CREATE'
                    ? "Initialize a new educational data structure."
                    : "Modify the JSON schema and metadata for this unit."}
                open={activeModal === 'CREATE' || activeModal === 'UPDATE'}
                onOpenChange={closeModals}
            >
                <ModuleForm type={activeModal} initialData={selectedModule} onSuccess={closeModals} />
            </CustomDialog>

            <ConfirmDialog
                open={activeModal === 'DELETE'}
                onOpenChange={closeModals}
                title="Delete Module"
                warning={`Permanently delete "${selectedModule?.title}"? This cannot be undone.`}
                confirmText="Delete Module"
                onConfirm={handleConfirmDelete}
                variant="destructive"
            />

            {selectedModule && (
                <LessonModal
                    moduleData={selectedModule}
                    isOpen={activeModal === 'PREVIEW'}
                    onClose={closeModals}
                />
            )}
        </div>
    );
}