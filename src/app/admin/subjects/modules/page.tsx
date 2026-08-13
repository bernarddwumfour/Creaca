'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
    Plus,
    Layers,
    Pencil,
    Trash2,
    RefreshCw,
    Archive,
    Settings2,
    BookOpen,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';
import { ConfirmDialog } from '../../../../../widgets/ConfirmDialog/ConfirmDialog';
import { DataTable } from '../../../../../widgets/Customtable/DataTable';
import { ModuleForm } from '../(components)/ModuleForm';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { apiMessage } from '@/lib/api-message';
import { CustomFilterFromUrl, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, type SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { CustomPagination } from '@/widgets/custom-pagination/CustomPagination';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { PageHeader } from '@/widgets/page-header/PageHeader';

interface Module {
    id: string;
    name: string;
    slug: string;
    description: string;
    order: number;
    status: 'draft' | 'active' | 'inactive';
    passing_score: number;
    course: { id: string; name: string };
    lesson_status: 'none' | 'draft' | 'approved';
    quiz_status: 'none' | 'draft' | 'approved';
    flashcards_status: 'none' | 'draft' | 'approved';
    created_at: string;
    updated_at: string;
}

interface ModulesResponse {
    data: {
        results: Module[];
        pagination: {
            current_page: number; per_page: number; total: number; total_pages: number;
            has_next: boolean; has_previous: boolean; next_page: number | null;
            previous_page: number | null; start_index: number; end_index: number;
        };
    };
}

const STATUS_OPTIONS = [
    { label: 'Draft', value: 'draft' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

const SORT_OPTIONS = [
    { value: 'order', label: 'Order' },
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Created' },
    { value: 'status', label: 'Status' },
];

const FILTERS: FilterConfig = {
    fields: [
        { name: 'status', type: 'select', placeholder: 'Status', options: STATUS_OPTIONS },
    ],
    searchPlaceholder: 'Search modules...',
};

const SORTS: SortConfig = {
    options: SORT_OPTIONS,
    defaultSortBy: 'order',
    defaultSortOrder: 'asc',
};

export default function ModulesManagement() {
    return (
        <Suspense fallback={<TableSkeleton />}>
            <ModulesManagementInner />
        </Suspense>
    );
}

function ModulesManagementInner() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [activeModal, setActiveModal] = useState<'CREATE' | 'UPDATE' | 'DELETE' | null>(null);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);

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

    const { data: response, isLoading, refetch } = useQuery<ModulesResponse>({
        queryKey: [ENDPOINTS.MODULES.LIST_MODULES, page, pageSize, search, status, sortBy, sortOrder],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.MODULES.LIST_MODULES, {
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

    const modules = response?.data?.results || [];
    const pagination = response?.data?.pagination;

    const invalidateModules = () => {
        queryClient.invalidateQueries({ queryKey: [ENDPOINTS.MODULES.LIST_MODULES] });
    };

    const closeModals = () => {
        setActiveModal(null);
        setSelectedModule(null);
    };

    const handleUpdateClick = (module: Module) => {
        setSelectedModule(module);
        setActiveModal('UPDATE');
    };

    const handleDeleteClick = (module: Module) => {
        setSelectedModule(module);
        setActiveModal('DELETE');
    };

    const handleManageContent = (module: Module) => {
        router.push(`/admin/subjects/modules/${module.id}`);
    };

    const handleDeleteModule = async () => {
        if (!selectedModule) return;
        try {
            const { data } = await api.delete(ENDPOINTS.MODULES.DELETE_MODULE.replace(':id', selectedModule.id));
            toast.success(data.message || `Module "${selectedModule.name}" deleted successfully.`);
            invalidateModules();
            closeModals();
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to delete module."));
        }
    };

    const handleTogglePublish = async (module: Module) => {
        const endpoint = module.status === 'active' ? ENDPOINTS.MODULES.UNPUBLISH_MODULE : ENDPOINTS.MODULES.PUBLISH_MODULE;
        try {
            const { data } = await api.post(endpoint.replace(':id', module.id));
            toast.success(data.message || `Module "${module.name}" ${module.status === 'active' ? 'unpublished' : 'published'}.`);
            invalidateModules();
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to update module status."));
        }
    };

    const handleBulkAction = async (items: Module[], action: 'activate' | 'deactivate' | 'delete') => {
        if (items.length === 0) {
            toast.warning("No modules selected for bulk action.");
            return;
        }
        try {
            const { data } = await api.post(ENDPOINTS.MODULES.BULK_ACTION, {
                action, ids: items.map(i => i.id)
            });
            toast.success(data.message || `${items.length} module(s) ${action}d successfully.`);
            if (data.data?.warnings?.length) {
                data.data.warnings.forEach((warning: string) => toast.warning(warning));
            }
            invalidateModules();
        } catch (error: any) {
            toast.error(apiMessage(error, `Failed to ${action} ${items.length} module(s).`));
        }
    };

    const rowActions = (module: Module): ActionItem[] => [
        { label: 'Manage Content', icon: <Settings2 size={14} />, onClick: () => handleManageContent(module) },
        { label: 'Edit Metadata', icon: <Pencil size={14} />, onClick: () => handleUpdateClick(module) },
        {
            label: module.status === 'active' ? 'Unpublish' : 'Publish',
            icon: module.status === 'active' ? <Archive size={14} /> : <RefreshCw size={14} />,
            variant: module.status === 'active' ? 'destructive' : 'default',
            onClick: () => handleTogglePublish(module),
        },
        { label: 'Delete Module', icon: <Trash2 size={14} />, variant: 'destructive', onClick: () => handleDeleteClick(module) },
    ];

    const bulkActions = [
        { label: 'Activate All', icon: <RefreshCw size={14} />, onClick: (items: Module[]) => handleBulkAction(items, "activate") },
        { label: 'Deactivate All', icon: <Archive size={14} />, variant: 'destructive' as const, onClick: (items: Module[]) => handleBulkAction(items, "deactivate") },
        { label: 'Delete All', icon: <Trash2 size={14} />, variant: 'destructive' as const, onClick: (items: Module[]) => handleBulkAction(items, "delete") },
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="CONTENT REGISTRY"
                title={<>Engineered <span className="text-orange-600">Modules.</span></>}
                description="Manage AI-generated lesson modules — text, quizzes, and flashcards — across every course."
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => { refetch(); toast.info("Refreshing module list..."); }}
                            className="rounded-xl h-11 w-11 p-0 transition-all"
                        >
                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                        </Button>
                        <Button
                            onClick={() => setActiveModal('CREATE')}
                            className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all"
                        >
                            <Plus size={18} className="mr-2" /> Create Module
                        </Button>
                    </>
                }
            />

            <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-zinc-900/80 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <CustomFilterFromUrl config={FILTERS} />
                <CustomSortFromUrl config={SORTS} />
            </div>

            <div className="space-y-4">
                <DataTable
                    data={modules}
                    isLoading={isLoading}
                    sortConfig={sortBy ? { sortBy, sortOrder } : undefined}
                    renderActions={(module) => <ActionsDropdown actions={rowActions(module)} maxVisible={3} showLabels={false} />}
                    bulkActions={bulkActions}
                    excludeColumns={['id', 'slug', 'description', 'created_at', 'updated_at', 'passing_score']}
                    dots={{
                        status: { "draft": 'amber', "active": 'emerald', "inactive": 'rose' },
                        lesson_status: { "none": 'zinc', "draft": 'amber', "approved": 'emerald' },
                        quiz_status: { "none": 'zinc', "draft": 'amber', "approved": 'emerald' },
                        flashcards_status: { "none": 'zinc', "draft": 'amber', "approved": 'emerald' },
                    }}
                    links={{
                        course: (module: Module) => `/admin/subjects/courses`,
                    }}
                    emptyTitle="No modules found"
                    emptyDescription="Create a module and generate its content to get started."
                />
                {pagination && (
                    <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} />
                )}
            </div>

            <CustomDialog
                title={activeModal === 'CREATE' ? "Create Module" : "Update Module"}
                description={activeModal === 'CREATE'
                    ? "Add a new lesson module to a course. Content is generated afterward."
                    : "Update this module's metadata."}
                open={activeModal === 'CREATE' || activeModal === 'UPDATE'}
                onOpenChange={closeModals}
            >
                <ModuleForm
                    type={activeModal as 'CREATE' | 'UPDATE'}
                    moduleId={selectedModule?.id}
                    initialData={selectedModule ? {
                        name: selectedModule.name,
                        description: selectedModule.description,
                        course_id: selectedModule.course?.id,
                        order: selectedModule.order,
                        passing_score: selectedModule.passing_score,
                    } : undefined}
                    onSuccess={() => {
                        invalidateModules();
                        closeModals();
                    }}
                />
            </CustomDialog>

            <ConfirmDialog
                open={activeModal === 'DELETE'}
                onOpenChange={closeModals}
                title="Delete Module"
                warning={`Permanently delete "${selectedModule?.name}"? This also deletes its lesson content, quiz questions, and flashcards. This action cannot be undone.`}
                confirmText="Delete Module"
                confirmIcon={Trash2}
                onConfirm={handleDeleteModule}
                variant="destructive"
            />
        </div>
    );
}
