'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
    Plus,
    Layers,
    BookOpen,
    Pencil,
    Trash2,
    GraduationCap,
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
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';
import { ConfirmDialog } from '../../../../../widgets/ConfirmDialog/ConfirmDialog';
import { DataTable } from '../../../../../widgets/Customtable/DataTable';
import { CourseForm } from '../(components)/CourseForm';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { apiMessage } from '@/lib/api-message';
import { ToggleGroup, ToggleGroupItem } from '../../../../../widgets/ToggleGroup/ToggleGroup';
import { CustomSelect } from '../../../../../widgets/CustomSelect/CustomSelect';
import { CustomFilterFromUrl, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, type SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { CustomPagination } from '@/widgets/custom-pagination/CustomPagination';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { PageHeader } from '@/widgets/page-header/PageHeader';

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
            current_page: number;
            per_page: number;
            total: number;
            total_pages: number;
            has_next: boolean;
            has_previous: boolean;
            next_page: number | null;
            previous_page: number | null;
            start_index: number;
            end_index: number;
        };
    };
    errors: any[];
    meta: {
        timestamp: string;
        version: string;
        request_id: string | null;
    };
}

const DIFFICULTY_OPTIONS = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
];

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

const SORT_OPTIONS = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'created_at', label: 'Created' },
    { value: 'difficulty', label: 'Difficulty' },
];

// Hoisted to module scope (not built inline in JSX): CustomFilterFromUrl/
// CustomSortFromUrl's effects depend on `config.fields`/`config.defaultSortBy`
// by reference — a fresh object literal on every render triggers a
// setState-in-effect infinite loop.
const FILTERS: FilterConfig = {
    fields: [
        { name: 'difficulty', type: 'select', placeholder: 'Difficulty', options: DIFFICULTY_OPTIONS },
        { name: 'status', type: 'select', placeholder: 'Status', options: STATUS_OPTIONS },
    ],
    searchPlaceholder: 'Search courses...',
};

const SORTS: SortConfig = {
    options: SORT_OPTIONS,
    defaultSortBy: 'name',
    defaultSortOrder: 'asc',
};

export default function CourseManagement() {
    return (
        <Suspense fallback={<TableSkeleton />}>
            <CourseManagementInner />
        </Suspense>
    );
}

function CourseManagementInner() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [activeModal, setActiveModal] = useState<'CREATE' | 'UPDATE' | 'DELETE' | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'table'>('table');
    const [overviewModalOpen, setOverviewModalOpen] = useState(false);
    const [selectedCourseForOverview, setSelectedCourseForOverview] = useState<Course | null>(null);
    const [prerequisitesModalOpen, setPrerequisitesModalOpen] = useState(false);
    const [prerequisitesCourse, setPrerequisitesCourse] = useState<Course | null>(null);
    const [selectedPrerequisites, setSelectedPrerequisites] = useState<string[]>([]);
    const [isUpdatingPrerequisites, setIsUpdatingPrerequisites] = useState(false);

    const pageSize = 10;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sort_by') || '';
    const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc';

    const setPage = (nextPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(nextPage));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Fetch courses from API
    const { data: response, isLoading, refetch } = useQuery<CoursesResponse>({
        queryKey: [ENDPOINTS.COURSES.LIST_COURSES, page, pageSize, search, difficulty, status, sortBy, sortOrder],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.LIST_COURSES, {
                params: {
                    page, page_size: pageSize,
                    search: search || undefined,
                    difficulty: difficulty || undefined,
                    status: status || undefined,
                    sort_by: sortBy || undefined,
                    sort_order: sortBy ? sortOrder : undefined,
                }
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
            toast.error(apiMessage(error, "Failed to delete course."));
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
            toast.error(apiMessage(error, "Failed to update course status."));
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
            toast.error(apiMessage(error, 'Failed to update prerequisites'));
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
            toast.error(apiMessage(error, `Failed to ${action} ${items.length} course(s).`));
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

    // Row actions, pre-bound per row for ActionsDropdown (both list and
    // table view render through renderActions) — matches the reference
    // apps' `actions(row): ActionItem[]` factory
    // pattern rather than passing the item down into the widget.
    const rowActions = (course: Course): ActionItem[] => [
        { label: 'View Details', icon: <Eye size={14} />, onClick: () => handleViewDetails(course) },
        { label: 'Update Course', icon: <Pencil size={14} />, onClick: () => handleUpdateClick(course) },
        { label: 'View Prerequisites', icon: <GitBranch size={14} />, onClick: () => handleManagePrerequisites(course) },
        {
            label: course.status === 'active' ? 'Deactivate' : 'Activate',
            icon: course.status === 'active' ? <Archive size={14} /> : <RefreshCw size={14} />,
            variant: course.status === 'active' ? 'destructive' : 'default',
            onClick: () => handleUpdateStatus(course, course.status === 'active' ? 'inactive' : 'active'),
        },
        { label: 'Delete Course', icon: <Trash2 size={14} />, variant: 'destructive', onClick: () => handleDeleteClick(course) },
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
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="CURRICULUM MANAGEMENT"
                title={<>Course <span className="text-orange-600">Architect.</span></>}
                description="Manage the structured learning paths and enrollment settings for the ecosystem."
                actions={
                    <>
                        <ToggleGroup
                            type="single"
                            value={viewMode}
                            onValueChange={(value: any) => value && setViewMode(value as 'list' | 'table')}
                            className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 bg-white dark:bg-zinc-900/80"
                        >
                            <ToggleGroupItem
                                value="list"
                                className="rounded-lg data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 gap-3 px-3 py-1"
                            >
                                <LayoutGrid size={16} /> <span className="hidden sm:inline">List view</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="table"
                                className="rounded-lg data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 gap-3 px-3 py-1"
                            >
                                <LayoutList size={16} /><span className="hidden sm:inline">Table view</span>
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
                    </>
                }
            />

            {/* Filter + Sort Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-zinc-900/80 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <CustomFilterFromUrl config={FILTERS} />
                <CustomSortFromUrl config={SORTS} />
            </div>

            {/* View Renderer */}
            {isLoading ? (
                <TableSkeleton />
            ) : viewMode === 'list' ? (
                <div className="grid grid-cols-1 gap-4">
                    {courses.map((course: Course) => (
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

                                            <ActionsDropdown actions={rowActions(course)} maxVisible={1} showLabels={false} className="rounded-xl" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {courses.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <BookMarked className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No courses found</h3>
                            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or create a new course.</p>
                        </div>
                    )}

                    {pagination && (
                        <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} className="pt-4" />
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                <DataTable
                    data={courses}
                    isLoading={isLoading}
                    sortConfig={sortBy ? { sortBy, sortOrder } : undefined}
                    displayConfigs={displayConfigs}
                    renderActions={(course) => <ActionsDropdown actions={rowActions(course)} maxVisible={3} showLabels={false} />}
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
                    emptyTitle="No courses found"
                    emptyDescription="No courses match your current filters."
                />
                {pagination && (
                    <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} />
                )}
                </div>
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
