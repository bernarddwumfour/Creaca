'use client';

import React, { useState } from 'react';
import {
    Plus,
    Search,
    BookOpen,
    MoreHorizontal,
    Layers,
    Library,
    Pencil,
    Trash2,
    PlusCircle
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

// Widgets & Components
import { CustomDialog } from '../../../../widgets/CustomDialog/CustomDialog';
import { ConfirmDialog } from '../../../../widgets/ConfirmDialog/ConfirmDialog';
import { SubjectForm } from './(components)/SubjectForm';
import { CourseForm } from './(components)/CourseForm';

const DUMMY_SUBJECTS = [
    { id: 'S1', title: "Pure Mathematics", code: "MATH-100", coursesCount: 5, modulesCount: 24, status: "Active", lastUpdated: "2 days ago" },
    { id: 'S2', title: "Applied Statistics", code: "STATS-200", coursesCount: 3, modulesCount: 18, status: "Active", lastUpdated: "5 hours ago" },
    { id: 'S3', title: "Theoretical Physics", code: "PHYS-300", coursesCount: 2, modulesCount: 12, status: "Draft", lastUpdated: "1 week ago" },
];

export default function SubjectsManagement() {
    const [activeModal, setActiveModal] = useState<'CREATE_SUBJECT' | 'UPDATE_SUBJECT' | 'CREATE_COURSE' | 'DELETE_SUBJECT' | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);

    const closeModals = () => {
        setActiveModal(null);
        setSelectedSubject(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSubject) return;
        console.log("Deleted Subject:", selectedSubject.id);
        closeModals();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="max-w-xl space-y-2">
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">
                        ACADEMIC REGISTRY
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                        Subject <span className="text-orange-600">Registry.</span>
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-tight text-sm">
                        Architect the core academic pillars of the Kyrios ecosystem.
                    </p>
                </div>

                {/* Create Subject Button - Now consistent with other action buttons */}
                <Button
                    onClick={() => setActiveModal('CREATE_SUBJECT')}
                    className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all"
                >
                    <Plus size={18} className="mr-2" /> Create Subject
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center bg-white dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
                    <Input
                        placeholder="Search subject registry..."
                        className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 font-medium placeholder:text-zinc-400"
                    />
                </div>
                <div className="hidden md:flex items-center gap-2 pr-2">
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        By Department
                    </Button>
                    <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        By Status
                    </Button>
                </div>
            </div>

            {/* Subjects List - Using new theme card style */}
            <div className="grid grid-cols-1 gap-4">
                {DUMMY_SUBJECTS.map((subject) => (
                    <Card
                        key={subject.id}
                        className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 group hover:-translate-y-0.5 transition-all overflow-hidden"
                    >
                        <CardContent className="p-0">
                            <div className="py-4 px-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Library size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-black text-xl tracking-tight">{subject.title}</h3>
                                            <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none text-[10px] font-black tracking-widest uppercase">
                                                {subject.code}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-5 mt-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5">
                                                <Layers size={14} className="text-primary/60" />
                                                {subject.coursesCount} Courses
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <BookOpen size={14} className="text-primary/60" />
                                                {subject.modulesCount} Modules
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden lg:block">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Last Update</p>
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                            {subject.lastUpdated}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest 
                                            ${subject.status === 'Active'
                                                ? 'bg-emerald-500/10 text-emerald-600'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                            }`}>
                                            {subject.status}
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
                                                    Subject Controls
                                                </DropdownMenuLabel>

                                                <DropdownMenuItem
                                                    onSelect={() => { setSelectedSubject(subject); setActiveModal('UPDATE_SUBJECT'); }}
                                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                >
                                                    <Pencil size={16} /> Update Subject
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onSelect={() => { setSelectedSubject(subject); setActiveModal('CREATE_COURSE'); }}
                                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                >
                                                    <PlusCircle size={16} /> Create Course
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />

                                                <DropdownMenuItem
                                                    onSelect={() => { setSelectedSubject(subject); setActiveModal('DELETE_SUBJECT'); }}
                                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-bold text-xs"
                                                >
                                                    <Trash2 size={16} /> Delete Subject
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

            {/* Modals */}
            <CustomDialog
                title={activeModal === 'CREATE_SUBJECT' ? "Create Subject" : "Update Subject"}
                description={activeModal === 'CREATE_SUBJECT'
                    ? "Establish a new core pillar for the curriculum."
                    : "Update the academic metadata for this branch."}
                open={activeModal === 'CREATE_SUBJECT' || activeModal === 'UPDATE_SUBJECT'}
                onOpenChange={closeModals}
            >
                <SubjectForm
                    type={activeModal === 'CREATE_SUBJECT' ? 'CREATE' : 'UPDATE'}
                    subjectId={selectedSubject?.id}
                    initialData={selectedSubject}
                    onSuccess={closeModals}
                />
            </CustomDialog>

            <CustomDialog
                title="Create Course"
                description={`Deploy a new course under ${selectedSubject?.title}.`}
                open={activeModal === 'CREATE_COURSE'}
                onOpenChange={closeModals}
            >
                <CourseForm
                    subjectId={selectedSubject?.id}
                    subjectTitle={selectedSubject?.title}
                    onSuccess={closeModals}
                />
            </CustomDialog>

            <ConfirmDialog
                open={activeModal === 'DELETE_SUBJECT'}
                onOpenChange={closeModals}
                title="Delete Subject"
                warning={`You are about to purge "${selectedSubject?.title}". This will delete all child courses, modules, and lessons. This action is terminal.`}
                confirmText="Delete Subject"
                confirmIcon={Trash2}
                onConfirm={handleConfirmDelete}
                variant="destructive"
            />
        </div>
    );
}