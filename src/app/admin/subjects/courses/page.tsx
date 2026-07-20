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
    LayoutDashboard,
    LayoutList,
    LayoutGrid,
    RefreshCw,
    Archive,
    Loader2,
    Eye,
    FileText,
    Clock,
    Target,
    BookMarked,
    List,
    Link as LinkIcon,
    GitBranch
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';
import { ConfirmDialog } from '../../../../../widgets/ConfirmDialog/ConfirmDialog';
import { DataTable } from '../../../../../widgets/Customtable/DataTable';
import { CourseForm } from '../(components)/CourseForm';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { ToggleGroup, ToggleGroupItem } from '../../../../../widgets/ToggleGroup/ToggleGroup';
import { CustomSelect } from '../../../../../widgets/CustomSelect/CustomSelect';

interface Course {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: 'active' | 'inactive' | 'draft';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    subject: {
        id: string;
        name: string;
        slug: string;
    };
    duration: number | null;
    modules_count: number;
    price: string | null;
    is_purchasable: boolean;
    requirements: string[];
    prerequisites_count: number;
    prerequisites: Array<{
        id: string;
        name: string;
        slug: string;
        difficulty: string;
        is_purchasable: boolean;
        price: string | null;
    }>;
    created_at: string;
    updated_at: string;
}

interface CoursesResponse {
    status: string;
    code: number;
    message: string;
    data: {
        results: Course[];
        pagination: {
            total: number;
            total_pages: number;
            current_page: number;
            page_size: number;
            has_next: boolean;
            has_previous: boolean;
            next_page: number | null;
            previous_page: number | null;
        };
    };
    errors: any[];
    meta: {
        timestamp: string;
        version: string;
        request_id: string | null;
    };
}

export default function CourseManagement() {
    const queryClient = useQueryClient();
    const [activeModal, setActiveModal] = useState<'CREATE' | 'UPDATE' | 'DELETE' | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [overviewModalOpen, setOverviewModalOpen] = useState(false);
    const [selectedCourseForOverview, setSelectedCourseForOverview] = useState<Course | null>(null);
    const [prerequisitesModalOpen, setPrerequisitesModalOpen] = useState(false);
    const [prerequisitesCourse, setPrerequisitesCourse] = useState<Course | null>(null);
    const [selectedPrerequisites, setSelectedPrerequisites] = useState<string[]>([]);
    const [isUpdatingPrerequisites, setIsUpdatingPrerequisites] = useState(false);

    // Fetch courses from API
    const { data: response, isLoading, refetch } = useQuery<CoursesResponse>({
        queryKey: [ENDPOINTS.COURSES.LIST_COURSES, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.LIST_COURSES, {
                params: { page, page_size: pageSize }
            });
            return data;
        },
    });

    const courses = response?.data?.results || [];
    const pagination = response?.data?.pagination;

    // Fetch all courses for prerequisites dropdown
    const { data: allCoursesResponse } = useQuery({
        queryKey: [ENDPOINTS.COURSES.LIST_COURSES, 'all'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.LIST_COURSES, {
                params: { page_size: 100 }
            });
            return data;
        },
    });

    const allCourses = allCoursesResponse?.data?.results || [];
    const courseOptions = allCourses
        .filter((c: Course) => c.id !== prerequisitesCourse?.id)
        .map((course: Course) => ({
            value: course.id,
            label: course.name,
        }));

    // Filter courses based on search
    const filteredCourses = React.useMemo(() => {
        if (!courses.length) return [];
        if (!searchQuery) return courses;

        const query = searchQuery.toLowerCase();
        return courses.filter((course: Course) =>
            course.name?.toLowerCase().includes(query) ||
            course.subject?.name?.toLowerCase().includes(query) ||
            course.description?.toLowerCase().includes(query)
        );
    }, [courses, searchQuery]);

    const invalidateCourses = () => {
        queryClient.invalidateQueries({ queryKey: [ENDPOINTS.COURSES.LIST_COURSES] });
    };

    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;

        try {
            const { data } = await api.delete(ENDPOINTS.COURSES.DELETE_COURSE.replace(':id', selectedCourse.id));
            toast.success(data.message || `Course "${selectedCourse.name}" deleted successfully.`);
            invalidateCourses();
            closeModals();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete course.";
            toast.error(errorMessage);
        }
    };

    const handleUpdateStatus = async (course: Course, newStatus: string) => {
        try {
            const { data } = await api.patch(ENDPOINTS.COURSES.UPDATE_COURSE.replace(':id', course.id), {
                status: newStatus
            });
            toast.success(data.message || `Course "${course.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
            invalidateCourses();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || `Failed to update course status.`;
            toast.error(errorMessage);
        }
    };

    const handleManagePrerequisites = (course: Course) => {
        setPrerequisitesCourse(course);
        setSelectedPrerequisites(course.prerequisites.map(p => p.id));
        setPrerequisitesModalOpen(true);
    };

    const handleSavePrerequisites = async () => {
        if (!prerequisitesCourse) return;
        setIsUpdatingPrerequisites(true);
        try {
            await api.patch(ENDPOINTS.COURSES.UPDATE_COURSE.replace(':id', prerequisitesCourse.id), {
                prerequisite_ids: selectedPrerequisites,
            });
            toast.success('Prerequisites updated successfully');
            setPrerequisitesModalOpen(false);
            invalidateCourses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update prerequisites');
        } finally {
            setIsUpdatingPrerequisites(false);
        }
    };

    const handleBulkAction = async (items: Course[], action: 'activate' | 'deactivate' | 'delete') => {
        if (items.length === 0) {
            toast.warning("No courses selected for bulk action.");
            return;
        }

        const ids = items.map(i => i.id);

        try {
            const { data } = await api.post(ENDPOINTS.COURSES.BULK_ACTION, {
                action: action,
                ids: ids
            });

            toast.success(data.message || `${items.length} course(s) ${action}d successfully.`);

            if (data.data?.warnings && data.data.warnings.length > 0) {
                data.data.warnings.forEach((warning: string) => {
                    toast.warning(warning);
                });
            }

            invalidateCourses();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || `Failed to ${action} ${items.length} course(s).`;
            toast.error(errorMessage);
        }
    };

    const handleExport = async (items: Course[]) => {
        if (items.length === 0) {
            toast.warning("No courses selected for export.");
            return;
        }

        try {
            const exportData = items.map(course => ({
                ID: course.id,
                Name: course.name,
                Slug: course.slug,
                Description: course.description,
                Status: course.status,
                Difficulty: course.difficulty,
                Subject: course.subject.name,
                Duration_Minutes: course.duration,
                Modules_Count: course.modules_count,
                Price: course.price,
                Requirements: course.requirements,
                Prerequisites: course.prerequisites.map(p => p.name),
                Created_At: course.created_at,
                Updated_At: course.updated_at
            }));

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `courses_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`${items.length} course(s) exported successfully.`);
        } catch (error: any) {
            toast.error(error.message || "Failed to export courses.");
        }
    };

    const closeModals = () => {
        setActiveModal(null);
        setSelectedCourse(null);
    };

    const handleUpdateClick = (course: Course) => {
        setSelectedCourse(course);
        setActiveModal('UPDATE');
    };

    const handleDeleteClick = (course: Course) => {
        setSelectedCourse(course);
        setActiveModal('DELETE');
    };

    const handleViewDetails = (course: Course) => {
        setSelectedCourseForOverview(course);
        setOverviewModalOpen(true);
    };

    // Difficulty badge colors
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-emerald-500/10 text-emerald-600';
            case 'intermediate': return 'bg-blue-500/10 text-blue-600';
            case 'advanced': return 'bg-amber-500/10 text-amber-600';
            case 'expert': return 'bg-rose-500/10 text-rose-600';
            default: return 'bg-zinc-100 text-zinc-600';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    };

    // Table display configurations
    const displayConfigs = [
        {
            id: 'basic_info',
            label: 'Course Information',
            icon: <BookOpen size={14} />,
            getData: (item: Course) => ({
                Name: item.name,
                Subject: item.subject?.name,
                Description: item.description?.substring(0, 100) + (item.description?.length > 100 ? '...' : '')
            }),
            excludeKeys: ['Description']
        },
        {
            id: 'metrics',
            label: 'Course Metrics',
            icon: <Layers size={14} />,
            getData: (item: Course) => ({
                Difficulty: getDifficultyLabel(item.difficulty),
                Duration: item.duration ? `${item.duration} min` : 'Not specified',
                Modules: item.modules_count,
                Prerequisites: item.prerequisites_count || 0
            })
        },
        {
            id: 'subjects',
            label: 'Course Subjects',
            icon: <List size={14} />,
            getData: (item: Course) => ({
                ...item.subject, id: undefined
            })
        }
    ];

    // Table actions
    const actions = [
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: handleViewDetails
        },
        {
            label: 'Update Course',
            icon: <Pencil size={14} />,
            onClick: handleUpdateClick
        },
        {
            label: 'View Prerequisites',
            icon: <GitBranch size={14} />,
            onClick: handleManagePrerequisites
        },
        {
            label: (course: Course) => course.status === 'active' ? 'Deactivate' : 'Activate',
            icon: (course: Course) => course.status === 'active' ? <Archive size={14} /> : <RefreshCw size={14} />,
            variant: (course: Course): 'destructive' | 'default' => course.status === 'active' ? 'destructive' : 'default',
            onClick: (course: Course) => handleUpdateStatus(course, course.status === 'active' ? 'inactive' : 'active')
        },
        {
            label: 'Delete Course',
            icon: <Trash2 size={14} />,
            variant: 'destructive' as const,
            onClick: handleDeleteClick
        }
    ];

    // Bulk actions
    const bulkActions = [
        {
            label: 'Activate All',
            icon: <RefreshCw size={14} />,
            onClick: (items: Course[]) => handleBulkAction(items, "activate")
        },
        {
            label: 'Deactivate All',
            icon: <Archive size={14} />,
            variant: 'destructive' as const,
            onClick: (items: Course[]) => handleBulkAction(items, "deactivate")
        },
        {
            label: 'Delete All',
            icon: <Trash2 size={14} />,
            variant: 'destructive' as const,
            onClick: (items: Course[]) => handleBulkAction(items, "delete")
        },
        {
            label: 'Export Data',
            icon: <FileText size={14} />,
            onClick: handleExport
        }
    ];

    if (isLoading) {
        return (
            <div className='h-full min-h-[300px] w-full flex items-center justify-center'>
                <Loader2 className='animate-spin h-12 w-12 m-auto text-primary' />
            </div>
        );
    }

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

                <div className="flex gap-3">
                    <ToggleGroup
                        type="single"
                        value={viewMode}
                        onValueChange={(value: any) => value && setViewMode(value as 'list' | 'table')}
                        className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 bg-white dark:bg-zinc-900/80"
                    >
                        <ToggleGroupItem
                            value="list"
                            className="rounded-lg data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 gap-3 p-3"
                        >
                            <LayoutGrid size={16} /> <span>List view</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="table"
                            className="rounded-lg data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 gap-3 p-3"
                        >
                            <LayoutList size={16} /><span>Table view</span>
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <Button
                        variant="outline"
                        onClick={() => {
                            refetch();
                            toast.info("Refreshing course list...");
                        }}
                        className="rounded-xl h-11 w-11 p-0 transition-all"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </Button>

                    <Button
                        onClick={() => setActiveModal('CREATE')}
                        className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all"
                    >
                        <Plus size={18} className="mr-2" /> Create Course
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center bg-white dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
                    <Input
                        placeholder="Search courses by title, subject, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 font-medium placeholder:text-zinc-400"
                    />
                </div>
                <div className="hidden md:flex items-center gap-2 pr-2">
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        By Difficulty
                    </Button>
                    <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        By Status
                    </Button>
                </div>
            </div>

            {/* View Renderer */}
            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredCourses.map((course: Course) => (
                        <Card
                            key={course.id}
                            className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 group hover:-translate-y-0.5 transition-all overflow-hidden"
                        >
                            <CardContent className="p-0">
                                <div className="py-4 px-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <GraduationCap size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="font-black text-xl tracking-tight">{course.name}</h3>
                                                <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none text-[10px] font-black tracking-widest uppercase">
                                                    {course.subject?.name}
                                                </Badge>
                                                <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getDifficultyColor(course.difficulty)}`}>
                                                    {getDifficultyLabel(course.difficulty)}
                                                </div>
                                                {course.prerequisites_count > 0 && (
                                                    <Badge variant="outline" className="gap-1">
                                                        <GitBranch size={10} />
                                                        {course.prerequisites_count} Prereq
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-500 mt-1 line-clamp-2 max-w-md">
                                                {course.description}
                                            </p>
                                            <div className="flex items-center gap-5 mt-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5">
                                                    <Layers size={14} className="text-primary/60" />
                                                    {course.modules_count} Modules
                                                </span>
                                                {course.duration && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-primary/60" />
                                                        {course.duration} min
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1.5">
                                                    <Target size={14} className="text-primary/60" />
                                                    {getDifficultyLabel(course.difficulty)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden lg:block">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Last Update</p>
                                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                {new Date(course.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest 
                                                ${course.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : course.status === 'inactive'
                                                        ? 'bg-rose-500/10 text-rose-600'
                                                        : 'bg-amber-500/10 text-amber-600'
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

                                                    <DropdownMenuItem
                                                        onSelect={() => handleViewDetails(course)}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                    >
                                                        <Eye size={16} /> Course Overview
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onSelect={() => handleUpdateClick(course)}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                    >
                                                        <Pencil size={16} /> Update Course
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onSelect={() => handleManagePrerequisites(course)}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                    >
                                                        <GitBranch size={16} /> View Prerequisites
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onSelect={() => handleUpdateStatus(course, course.status === 'active' ? 'inactive' : 'active')}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                    >
                                                        <RefreshCw size={16} /> {course.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />

                                                    <DropdownMenuItem
                                                        onSelect={() => handleDeleteClick(course)}
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

                    {filteredCourses.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <BookMarked className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No courses found</h3>
                            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or create a new course.</p>
                        </div>
                    )}

                    {pagination && (
                        <div className="flex justify-between items-center pt-4">
                            <div className="text-sm text-zinc-500">
                                Showing {filteredCourses.length} of {pagination.total} courses
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.has_previous}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!pagination.has_next}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <DataTable
                    data={filteredCourses}
                    displayConfigs={displayConfigs}
                    actions={actions}
                    bulkActions={bulkActions}
                    excludeColumns={['id', 'slug', 'description', 'created_at', 'updated_at', 'duration', 'modules_count', 'subject', 'price', 'requirements', 'prerequisites', 'prerequisites_count']}
                    dots={{
                        status: {
                            "active": 'emerald',
                            "inactive": 'rose',
                            "draft": 'amber'
                        },
                        difficulty: {
                            "beginner": 'emerald',
                            "intermediate": 'blue',
                            "advanced": 'amber',
                            "expert": 'rose'
                        }
                    }}
                    badges={{
                        modules_count: {
                            0: 'zinc',
                            1: 'blue',
                            2: 'violet',
                            3: 'amber',
                            4: 'orange',
                            5: 'rose',
                        }
                    }}
                    links={{
                        name: (course: Course) => `/admin/courses/${course.slug}`,
                        subject: (course: Course) => `/admin/subjects/${course.subject?.slug}`
                    }}
                    emptyTitle="No courses found"
                    emptyDescription="No courses match your current filters."
                />
            )}

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
                    type={activeModal as 'CREATE' | 'UPDATE'}
                    courseId={selectedCourse?.id}
                    initialData={selectedCourse ? {
                        name: selectedCourse.name,
                        description: selectedCourse.description,
                        difficulty: selectedCourse.difficulty,
                        subject_id: selectedCourse.subject?.id,
                        duration: selectedCourse.duration,
                        status: selectedCourse.status,
                        price: selectedCourse.price ? parseFloat(selectedCourse.price) : null,
                        requirements: selectedCourse.requirements,
                        prerequisites: selectedCourse.prerequisites?.map((p: any) => p.id) || [],
                    } : undefined}
                    onSuccess={() => {
                        invalidateCourses();
                        closeModals();
                    }}
                />
            </CustomDialog>

            <ConfirmDialog
                open={activeModal === 'DELETE'}
                onOpenChange={closeModals}
                title="Delete Course"
                warning={`Permanently delete "${selectedCourse?.name}"? ${selectedCourse?.modules_count && selectedCourse.modules_count > 0 ? `This course has ${selectedCourse.modules_count} module(s). ` : ''}This action cannot be undone.`}
                confirmText="Delete Course"
                confirmIcon={Trash2}
                onConfirm={handleDeleteCourse}
                variant="destructive"
            />

            <CustomDialog
                title="View Prerequisites"
                description={`Select courses that students should complete before taking "${prerequisitesCourse?.name}"`}
                open={prerequisitesModalOpen}
                onOpenChange={setPrerequisitesModalOpen}
                contentWidth="max-w-2xl"
            >
                <div className="space-y-6 py-4">
                    <CustomSelect options={courseOptions} multiple value={selectedPrerequisites} onChange={setSelectedPrerequisites} placeholder="Select prerequisite courses" />

                    {/* Current Prerequisites Preview */}
                    {prerequisitesCourse?.prerequisites && prerequisitesCourse.prerequisites.length > 0 && (
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                            <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-2">
                                Current Prerequisites
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {prerequisitesCourse.prerequisites.map((prereq) => (
                                    <Badge key={prereq.id} variant="secondary" className="gap-1">
                                        {prereq.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setPrerequisitesModalOpen(false)}>Cancel</Button>
                        <Button disabled={isUpdatingPrerequisites} onClick={handleSavePrerequisites}>{isUpdatingPrerequisites && <Loader2 className="mr-2 animate-spin" size={16}/>}Save prerequisites</Button>
                    </div>

                </div>
            </CustomDialog>

            {/* Course Overview Modal */}
            <CustomDialog
                title="Course Overview"
                description="Detailed information about this course"
                open={overviewModalOpen}
                onOpenChange={setOverviewModalOpen}
                contentWidth="max-w-2xl"
            >
                {selectedCourseForOverview && (
                    <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-2">
                        {/* Basic Info */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                            <h3 className="font-bold text-lg mb-3">{selectedCourseForOverview.name}</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedCourseForOverview.description}</p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30">
                                <p className="text-[10px] text-zinc-400">Subject</p>
                                <p className="font-bold text-sm">{selectedCourseForOverview.subject?.name}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30">
                                <p className="text-[10px] text-zinc-400">Difficulty</p>
                                <p className="font-bold text-sm capitalize">{selectedCourseForOverview.difficulty}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30">
                                <p className="text-[10px] text-zinc-400">Duration</p>
                                <p className="font-bold text-sm">{selectedCourseForOverview.duration ? `${selectedCourseForOverview.duration} min` : 'Self-paced'}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30">
                                <p className="text-[10px] text-zinc-400">Status</p>
                                <p className={`font-bold text-sm capitalize ${selectedCourseForOverview.status === 'active' ? 'text-emerald-600' : selectedCourseForOverview.status === 'inactive' ? 'text-rose-600' : 'text-amber-600'}`}>
                                    {selectedCourseForOverview.status}
                                </p>
                            </div>
                        </div>

                        {/* Requirements */}
                        {selectedCourseForOverview.requirements && selectedCourseForOverview.requirements.length > 0 && (
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <FileText size={14} className="text-primary" />
                                    Requirements
                                </h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {selectedCourseForOverview.requirements.map((req: string, idx: number) => (
                                        <li key={idx} className="text-sm text-zinc-600 dark:text-zinc-400">{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Prerequisites */}
                        {selectedCourseForOverview.prerequisites && selectedCourseForOverview.prerequisites.length > 0 && (
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <LinkIcon size={14} className="text-primary" />
                                    Prerequisite Courses
                                </h4>
                                <div className="space-y-2">
                                    {selectedCourseForOverview.prerequisites.map((prereq: any) => (
                                        <div key={prereq.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/50">
                                            <div>
                                                <p className="font-medium text-sm">{prereq.name}</p>
                                                <p className="text-[10px] text-zinc-500 capitalize">{prereq.difficulty}</p>
                                            </div>
                                            {prereq.is_purchasable && prereq.price && (
                                                <Badge variant="outline" className="text-[10px]">
                                                    ${prereq.price}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price Info */}
                        {selectedCourseForOverview.is_purchasable && selectedCourseForOverview.price && (
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <p className="text-sm text-center">
                                    <span className="font-bold text-primary">${selectedCourseForOverview.price}</span>
                                    <span className="text-zinc-500 text-xs ml-1">one-time purchase</span>
                                </p>
                                <p className="text-[10px] text-center text-zinc-500 mt-2">
                                    Or access with subscription
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CustomDialog>
        </div>
    );
}
