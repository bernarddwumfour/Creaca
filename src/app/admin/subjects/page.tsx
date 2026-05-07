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
    PlusCircle,
    LayoutList,
    LayoutGrid,
    RefreshCw,
    Archive,
    Loader2,
    Eye,
    FileText
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

// Widgets & Components
import { CustomDialog } from '../../../../widgets/CustomDialog/CustomDialog';
import { ConfirmDialog } from '../../../../widgets/ConfirmDialog/ConfirmDialog';
import { DataTable } from '../../../../widgets/Customtable/DataTable';
import { SubjectForm } from './(components)/SubjectForm';
import { CourseForm } from './(components)/CourseForm';

// API imports
import { ENDPOINTS } from '@/lib/endpoints';
import api from '@/lib/axios';
import { ToggleGroup, ToggleGroupItem } from '../../../../widgets/ToggleGroup/ToggleGroup';

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

export default function SubjectsManagement() {
    const queryClient = useQueryClient();
    const [activeModal, setActiveModal] = useState<'CREATE_SUBJECT' | 'UPDATE_SUBJECT' | 'CREATE_COURSE' | 'DELETE_SUBJECT' | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    // Fetch subjects from API
    const { data: response, isLoading, refetch } = useQuery<SubjectsResponse>({
        queryKey: [ENDPOINTS.SUBJECTS.LIST_SUBJECTS, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.SUBJECTS.LIST_SUBJECTS, {
                params: { page, page_size: pageSize }
            });
            return data;
        },
    });

    const subjects = response?.data?.results || [];
    const pagination = response?.data?.pagination;

    const filteredSubjects = React.useMemo(() => {
        if (!subjects.length) return [];
        if (!searchQuery) return subjects;

        const query = searchQuery.toLowerCase();
        return subjects.filter((subject: Subject) =>
            subject.name?.toLowerCase().includes(query) ||
            subject.slug?.toLowerCase().includes(query) ||
            subject.description?.toLowerCase().includes(query)
        );
    }, [subjects, searchQuery]);

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
            const errorMessage = error.response?.data?.message || error.message || `Failed to update subject status.`;
            toast.error(errorMessage);
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
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete subject.";
            toast.error(errorMessage);
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
            const errorMessage = error.response?.data?.message || error.message || `Failed to ${action} ${items.length} subject(s).`;
            toast.error(errorMessage);
        }
    };

    // Export function
    const handleExport = async (items: Subject[]) => {
        if (items.length === 0) {
            toast.warning("No subjects selected for export.");
            return;
        }

        try {
            const exportData = items.map(subject => ({
                ID: subject.id,
                Name: subject.name,
                Slug: subject.slug,
                Status: subject.status,
                Course_Count: subject.course_count,
                Description: subject.description,
                Created_At: subject.created_at,
                Updated_At: subject.updated_at
            }));

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `subjects_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`${items.length} subject(s) exported successfully.`);
        } catch (error: any) {
            toast.error(error.message || "Failed to export subjects.");
        }
    };

    const closeModals = () => {
        setActiveModal(null);
        setSelectedSubject(null);
    };

    // Shared action handlers - used by both list and table views
    const handleViewDetails = (subject: Subject) => {
        console.log('View subject:', subject);
        toast.info(`Viewing details for "${subject.name}"`);
        // Navigate to details page if needed
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

    // Table actions - using the same handlers as list view
    const actions = [
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: handleViewDetails
        },
        {
            label: 'Update Subject',
            icon: <Pencil size={14} />,
            onClick: handleUpdateClick
        },
        {
            label: 'Create Course',
            icon: <PlusCircle size={14} />,
            onClick: handleCreateCourseClick
        },
        {
            label: (subject: Subject) => subject.status === 'active' ? 'Deactivate' : 'Activate',
            icon: (subject: Subject) => subject.status === 'active' ? <Archive size={14} /> : <RefreshCw size={14} />,
            variant: (subject: Subject): 'destructive' | 'default' => subject.status === 'active' ? 'destructive' : 'default',
            onClick: (subject: Subject) => handleUpdateStatus(subject, subject.status === 'active' ? 'inactive' : 'active')
        },
        {
            label: 'Delete Subject',
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
                        ACADEMIC REGISTRY
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                        Subject <span className="text-orange-600">Registry.</span>
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-tight text-sm">
                        Architect the core academic pillars of the Kyrios ecosystem.
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
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center bg-white dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
                    <Input
                        placeholder="Search subject registry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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

            {/* View Renderer - Both views now use the SAME handlers */}
            {viewMode === 'list' ? (
                /* LIST VIEW - Cards using the same handler functions */
                <div className="grid grid-cols-1 gap-4">
                    {filteredSubjects.map((subject: Subject) => (
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
                                                        onSelect={() => handleViewDetails(subject)}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                    >
                                                        <Eye size={16} /> View Details
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onSelect={() => handleUpdateClick(subject)}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                    >
                                                        <Pencil size={16} /> Update Subject
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onSelect={() => handleCreateCourseClick(subject)}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                    >
                                                        <PlusCircle size={16} /> Create Course
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onSelect={() => handleUpdateStatus(subject, subject.status === 'active' ? 'inactive' : 'active')}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                    >
                                                        <RefreshCw size={16} /> {subject.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />

                                                    <DropdownMenuItem
                                                        onSelect={() => handleDeleteClick(subject)}
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

                    {filteredSubjects.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <Library className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No subjects found</h3>
                            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or create a new subject.</p>
                        </div>
                    )}

                    {pagination && (
                        <div className="flex justify-between items-center pt-4">
                            <div className="text-sm text-zinc-500">
                                Showing {filteredSubjects.length} of {pagination.total} subjects
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
                /* TABLE VIEW - Using DataTable with the SAME handlers */
                <DataTable
                    data={filteredSubjects}
                    displayConfigs={displayConfigs}
                    actions={actions}
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
        </div>
    );
}