'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
    Plus,
    BookOpen,
    Layers,
    Library,
    Pencil,
    Trash2,
    PlusCircle,
    LayoutList,
    LayoutGrid,
    RefreshCw,
    Archive,
    Eye,
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Widgets & Components
import { CustomDialog } from '../../../../widgets/CustomDialog/CustomDialog';
import { ConfirmDialog } from '../../../../widgets/ConfirmDialog/ConfirmDialog';
import { DataTable } from '../../../../widgets/Customtable/DataTable';
import { SubjectForm } from './(components)/SubjectForm';
import { CourseForm } from './(components)/CourseForm';

// API imports
import { ENDPOINTS } from '@/lib/endpoints';
import api from '@/lib/axios';
import { apiMessage } from '@/lib/api-message';
import { ToggleGroup, ToggleGroupItem } from '../../../../widgets/ToggleGroup/ToggleGroup';
import { CustomFilterFromUrl, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, type SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { CustomPagination } from '@/widgets/custom-pagination/CustomPagination';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { PageHeader } from '@/widgets/page-header/PageHeader';

interface Subject {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: 'active' | 'inactive' | 'draft';
    course_count: number;
    created_at: string;
    updated_at: string;
}

interface SubjectsResponse {
    status: string;
    code: number;
    message: string;
    data: {
        results: Subject[];
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

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

const SORT_OPTIONS = [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Created' },
];

// Hoisted to module scope — see courses/page.tsx for why.
const FILTERS: FilterConfig = {
    fields: [{ name: 'status', type: 'select', placeholder: 'Status', options: STATUS_OPTIONS }],
    searchPlaceholder: 'Search subject registry...',
};

const SORTS: SortConfig = {
    options: SORT_OPTIONS,
    defaultSortBy: 'name',
    defaultSortOrder: 'asc',
};

export default function SubjectsManagement() {
    return (
        <Suspense fallback={<TableSkeleton />}>
            <SubjectsManagementInner />
        </Suspense>
    );
}

function SubjectsManagementInner() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [activeModal, setActiveModal] = useState<'CREATE_SUBJECT' | 'UPDATE_SUBJECT' | 'CREATE_COURSE' | 'DELETE_SUBJECT' | 'DETAILS' | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'table'>('table');

    const pageSize = 10;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sort_by') || '';
    const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc';

    const setPage = (nextPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(nextPage));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Fetch subjects from API
    const { data: response, isLoading, refetch } = useQuery<SubjectsResponse>({
        queryKey: [ENDPOINTS.SUBJECTS.LIST_SUBJECTS, page, pageSize, search, status, sortBy, sortOrder],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.SUBJECTS.LIST_SUBJECTS, {
                params: {
                    page, page_size: pageSize,
                    search: search || undefined,
                    status: status || undefined,
                    sort_by: sortBy || undefined,
                    sort_order: sortBy ? sortOrder : undefined,
                }
            });
            return data;
        },
    });

    const subjects = response?.data?.results || [];
    const pagination = response?.data?.pagination;

    const invalidateSubjects = () => {
        queryClient.invalidateQueries({ queryKey: [ENDPOINTS.SUBJECTS.LIST_SUBJECTS] });
    };

    // Single function for updating subject status
    const handleUpdateStatus = async (subject: Subject, newStatus: string) => {
        try {
            const { data } = await api.patch(ENDPOINTS.SUBJECTS.UPDATE_SUBJECT.replace(':id', subject.id), {
                status: newStatus
            });
            toast.success(data.message || `Subject "${subject.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
            invalidateSubjects();
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to update subject status."));
        }
    };

    // Single function for deleting a subject
    const handleDeleteSubject = async () => {
        if (!selectedSubject) return;

        try {
            const { data } = await api.delete(ENDPOINTS.SUBJECTS.DELETE_SUBJECT.replace(':id', selectedSubject.id));
            toast.success(data.message || `Subject "${selectedSubject.name}" deleted successfully.`);
            invalidateSubjects();
            closeModals();
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to delete subject."));
        }
    };

    // Single function for bulk actions
    const handleBulkAction = async (items: Subject[], action: 'activate' | 'deactivate' | 'delete') => {
        if (items.length === 0) {
            toast.warning("No subjects selected for bulk action.");
            return;
        }

        const ids = items.map(i => i.id);

        // Map action to the format API expects
        const actionMap = {
            activate: 'activate',
            deactivate: 'deactivate',
            delete: 'delete'
        };

        try {
            const { data } = await api.post(ENDPOINTS.SUBJECTS.BULK_ACTION, {
                action: actionMap[action],
                ids: ids
            });

            // Show success message from API response
            toast.success(data.message || `${items.length} subject(s) ${action}d successfully.`);

            // Show warnings if any
            if (data.data?.warnings && data.data.warnings.length > 0) {
                data.data.warnings.forEach((warning: string) => {
                    toast.warning(warning);
                });
            }

            invalidateSubjects();
        } catch (error: any) {
            toast.error(apiMessage(error, `Failed to ${action} ${items.length} subject(s).`));
        }
    };

    const closeModals = () => {
        setActiveModal(null);
        setSelectedSubject(null);
    };

    // Shared action handlers - used by both list and table views
    const handleViewDetails = (subject: Subject) => {
        setSelectedSubject(subject);
        setActiveModal('DETAILS');
    };

    const handleUpdateClick = (subject: Subject) => {
        setSelectedSubject(subject);
        setActiveModal('UPDATE_SUBJECT');
    };

    const handleCreateCourseClick = (subject: Subject) => {
        setSelectedSubject(subject);
        setActiveModal('CREATE_COURSE');
    };

    const handleDeleteClick = (subject: Subject) => {
        setSelectedSubject(subject);
        setActiveModal('DELETE_SUBJECT');
    };

    // Table display configurations
    const displayConfigs = [
        {
            id: 'basic_info',
            label: 'Subject Information',
            icon: <BookOpen size={14} />,
            getData: (item: Subject) => ({
                Name: item.name,
                Slug: item.slug,
                Description: item.description?.substring(0, 100) + (item.description?.length > 100 ? '...' : '')
            }),
            excludeKeys: ['Slug', 'Description']
        },
        {
            id: 'metrics',
            label: 'Academic Metrics',
            icon: <Layers size={14} />,
            getData: (item: Subject) => ({
                Course_Count: item.course_count,
                Module_Estimate: item.course_count * 4
            })
        }
    ];

    // Row actions, pre-bound per row for ActionsDropdown (both list and
    // table view render through renderActions).
    const rowActions = (subject: Subject): ActionItem[] => [
        { label: 'View Details', icon: <Eye size={14} />, onClick: () => handleViewDetails(subject) },
        { label: 'Update Subject', icon: <Pencil size={14} />, onClick: () => handleUpdateClick(subject) },
        { label: 'Create Course', icon: <PlusCircle size={14} />, onClick: () => handleCreateCourseClick(subject) },
        {
            label: subject.status === 'active' ? 'Deactivate' : 'Activate',
            icon: subject.status === 'active' ? <Archive size={14} /> : <RefreshCw size={14} />,
            variant: subject.status === 'active' ? 'destructive' : 'default',
            onClick: () => handleUpdateStatus(subject, subject.status === 'active' ? 'inactive' : 'active'),
        },
        { label: 'Delete Subject', icon: <Trash2 size={14} />, variant: 'destructive', onClick: () => handleDeleteClick(subject) },
    ];

    // Bulk actions
    const bulkActions = [
        {
            label: 'Activate All',
            icon: <RefreshCw size={14} />,
            onClick: (items: Subject[]) => handleBulkAction(items, "activate")
        },
        {
            label: 'Deactivate All',
            icon: <Archive size={14} />,
            variant: 'destructive' as const,
            onClick: (items: Subject[]) => handleBulkAction(items, "deactivate")
        },
        {
            label: 'Delete All',
            icon: <Trash2 size={14} />,
            variant: 'destructive' as const,
            onClick: (items: Subject[]) => handleBulkAction(items, "delete")
        },
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="ACADEMIC REGISTRY"
                title={<>Subject <span className="text-orange-600">Registry.</span></>}
                description="Architect the core academic pillars of the Kyrios ecosystem."
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
                                toast.info("Refreshing subject list...");
                            }}
                            className="rounded-xl h-11 w-11 p-0 transition-all"
                        >
                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                        </Button>

                        <Button
                            onClick={() => setActiveModal('CREATE_SUBJECT')}
                            className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all"
                        >
                            <Plus size={18} className="mr-2" /> Create Subject
                        </Button>
                    </>
                }
            />

            {/* Filter + Sort Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-zinc-900/80 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <CustomFilterFromUrl config={FILTERS} />
                <CustomSortFromUrl config={SORTS} />
            </div>

            {/* View Renderer - Both views now use the SAME handlers */}
            {isLoading ? (
                <TableSkeleton />
            ) : viewMode === 'list' ? (
                /* LIST VIEW - Cards using the same handler functions */
                <div className="grid grid-cols-1 gap-4">
                    {subjects.map((subject: Subject) => (
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
                                                <h3 className="font-black text-xl tracking-tight">{subject.name}</h3>
                                                <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none text-[10px] font-black tracking-widest uppercase">
                                                    {subject.slug}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-zinc-500 mt-1 line-clamp-2 max-w-md">
                                                {subject.description}
                                            </p>
                                            <div className="flex items-center gap-5 mt-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5">
                                                    <Layers size={14} className="text-primary/60" />
                                                    {subject.course_count} Courses
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <BookOpen size={14} className="text-primary/60" />
                                                    {subject.course_count * 4} Modules
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden lg:block">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Last Update</p>
                                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                {new Date(subject.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest 
                                                ${subject.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : subject.status === 'inactive'
                                                        ? 'bg-rose-500/10 text-rose-600'
                                                        : 'bg-amber-500/10 text-amber-600'
                                                }`}>
                                                {subject.status}
                                            </div>

                                            <ActionsDropdown actions={rowActions(subject)} maxVisible={1} showLabels={false} className="rounded-xl" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {subjects.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <Library className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No subjects found</h3>
                            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or create a new subject.</p>
                        </div>
                    )}

                    {pagination && (
                        <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} className="pt-4" />
                    )}
                </div>
            ) : (
                /* TABLE VIEW - Using DataTable with the SAME handlers */
                <div className="space-y-4">
                <DataTable
                    data={subjects}
                    isLoading={isLoading}
                    sortConfig={sortBy ? { sortBy, sortOrder } : undefined}
                    displayConfigs={displayConfigs}
                    renderActions={(subject) => <ActionsDropdown actions={rowActions(subject)} maxVisible={3} showLabels={false} />}
                    bulkActions={bulkActions}
                    excludeColumns={['id', 'slug', 'description', 'created_at', 'updated_at']}
                    dots={{
                        status: {
                            "active": 'emerald',
                            "inactive": 'rose',
                            "draft": 'amber'
                        }
                    }}
                    badges={{
                        course_count: {
                            0: 'zinc',
                            1: 'blue',
                            2: 'violet',
                            3: 'amber',
                            4: 'orange',
                            5: 'rose'
                        }
                    }}
                    links={{
                        name: (subject: Subject) => `/admin/subjects/${subject.slug}`,
                        course_count: (subject: Subject) => `/admin/subjects/${subject.id}/courses`
                    }}
                    emptyTitle="No subjects found"
                    emptyDescription="No academic subjects match your current filters."
                />
                {pagination && (
                    <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} />
                )}
                </div>
            )}

            {/* Modals - same for both views */}
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
                    initialData={selectedSubject as Partial<Subject>}
                    onSuccess={() => {
                        invalidateSubjects();
                        closeModals();
                    }}
                />
            </CustomDialog>

            <CustomDialog
                title="Create Course"
                description={`Deploy a new course under ${selectedSubject?.name}.`}
                open={activeModal === 'CREATE_COURSE'}
                onOpenChange={closeModals}
            >
                <CourseForm
                    subjectId={selectedSubject?.id}
                    subjectTitle={selectedSubject?.name}
                    onSuccess={() => {
                        invalidateSubjects();
                        closeModals();
                    }}
                />
            </CustomDialog>

            <ConfirmDialog
                open={activeModal === 'DELETE_SUBJECT'}
                onOpenChange={closeModals}
                title="Delete Subject"
                warning={`You are about to purge "${selectedSubject?.name}". ${selectedSubject?.course_count && selectedSubject.course_count > 0 ? `This subject has ${selectedSubject.course_count} course(s). Deleting it will also remove all associated courses. ` : ''}This action is terminal.`}
                confirmText="Delete Subject"
                confirmIcon={Trash2}
                onConfirm={handleDeleteSubject}
                variant="destructive"
            />
            <CustomDialog title="Subject details" description="Complete subject metadata" open={activeModal === 'DETAILS'} onOpenChange={closeModals}>
                {selectedSubject && <div className="grid grid-cols-2 gap-4 py-4 text-sm"><div><p className="text-zinc-400">Name</p><p className="font-bold">{selectedSubject.name}</p></div><div><p className="text-zinc-400">Status</p><p className="font-bold capitalize">{selectedSubject.status}</p></div><div className="col-span-2"><p className="text-zinc-400">Description</p><p>{selectedSubject.description || '—'}</p></div><div><p className="text-zinc-400">Courses</p><p className="font-bold">{selectedSubject.course_count}</p></div><div><p className="text-zinc-400">Created</p><p>{new Date(selectedSubject.created_at).toLocaleString()}</p></div></div>}
            </CustomDialog>
        </div>
    );
}
