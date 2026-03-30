'use client';

import React, { useState } from 'react';
import {
    Plus,
    Search,
    MoreHorizontal,
    Layers,
    BookOpen,
    Pencil,
    Trash2,
    GraduationCap,
    LayoutDashboard
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
import { CourseForm } from '../(components)/CourseForm';
import { ConfirmDialog } from '../../../../../widgets/ConfirmDialog/ConfirmDialog';

const DUMMY_COURSES = [
    { id: 'C1', title: "Linear Algebra I", subject: "Pure Mathematics", modulesCount: 8, enrollment: 1240, status: "Published", level: "Undergraduate" },
    { id: 'C2', title: "Probability Theory", subject: "Applied Statistics", modulesCount: 6, enrollment: 850, status: "Published", level: "Graduate" },
    { id: 'C3', title: "Quantum Mechanics", subject: "Theoretical Physics", modulesCount: 12, enrollment: 0, status: "Draft", level: "Expert" },
];

export default function CourseManagement() {
    const [activeModal, setActiveModal] = useState<'CREATE' | 'UPDATE' | 'DELETE' | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);

    const closeModals = () => {
        setActiveModal(null);
        setSelectedCourse(null);
    };

    const handleConfirmDelete = async () => {
        console.log("Deleted course:", selectedCourse?.id);
        closeModals();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="max-w-xl space-y-2">
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">
                        CURRICULUM MANAGEMENT
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                        Course <span className="text-orange-600">Architect.</span>
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-tight text-sm">
                        Manage the structured learning paths and enrollment settings for the ecosystem.
                    </p>
                </div>

                {/* Create Course Button - Now consistent with "Manage Courses" button */}
                <Button
                    onClick={() => setActiveModal('CREATE')}
                    className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all"
                >
                    <Plus size={18} className="mr-2" /> Create Course
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center bg-white dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
                    <Input
                        placeholder="Search courses by title or subject..."
                        className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 font-medium placeholder:text-zinc-400"
                    />
                </div>
                <div className="hidden md:flex items-center gap-2 pr-2">
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        By Level
                    </Button>
                    <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        Status
                    </Button>
                </div>
            </div>

            {/* Course List - py-4 as requested */}
            <div className="grid grid-cols-1 gap-4">
                {DUMMY_COURSES.map((course) => (
                    <Card
                        key={course.id}
                        className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 group hover:-translate-y-0.5 transition-all overflow-hidden"
                    >
                        <CardContent className="p-0">
                            <div className="py-4 px-6 flex items-center justify-between">   {/* Changed to py-4 */}
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <GraduationCap size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-black text-xl tracking-tight">{course.title}</h3>
                                            <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none text-[10px] font-black tracking-widest uppercase">
                                                {course.subject}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-5 mt-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5">
                                                <Layers size={14} className="text-primary/60" />
                                                {course.modulesCount} Modules
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <BookOpen size={14} className="text-primary/60" />
                                                {course.enrollment} Enrolled
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden lg:block">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Target Level</p>
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase">
                                            {course.level}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest 
                                            ${course.status === 'Published'
                                                ? 'bg-emerald-500/10 text-emerald-600'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                            }`}>
                                            {course.status}
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
                                                    Course Controls
                                                </DropdownMenuLabel>

                                                <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs">
                                                    <LayoutDashboard size={16} /> Course Overview
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onSelect={() => { setSelectedCourse(course); setActiveModal('UPDATE'); }}
                                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                >
                                                    <Pencil size={16} /> Update metadata
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />

                                                <DropdownMenuItem
                                                    onSelect={() => { setSelectedCourse(course); setActiveModal('DELETE'); }}
                                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-bold text-xs"
                                                >
                                                    <Trash2 size={16} /> Delete Course
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
                title={activeModal === 'CREATE' ? "Create Course" : "Update Course"}
                description={activeModal === 'CREATE'
                    ? "Initialize a new structured pathway in the academic registry."
                    : "Update the metadata and level requirements for this course."}
                open={activeModal === 'CREATE' || activeModal === 'UPDATE'}
                onOpenChange={closeModals}
            >
                <CourseForm
                    type={activeModal}
                    courseId={selectedCourse?.id}
                    initialData={selectedCourse}
                    onSuccess={closeModals}
                />
            </CustomDialog>

            <ConfirmDialog
                open={activeModal === 'DELETE'}
                onOpenChange={closeModals}
                title="Delete Course"
                warning={`Permanently delete "${selectedCourse?.title}"? This will detach all modules and erase enrollment data.`}
                confirmText="Delete Course"
                confirmIcon={Trash2}
                onConfirm={handleConfirmDelete}
                variant="destructive"
            />
        </div>
    );
}