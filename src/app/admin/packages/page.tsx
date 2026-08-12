'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
    Plus,
    Pencil,
    Trash2,
    Package as PackageIcon,
    LayoutList,
    LayoutGrid,
    RefreshCw,
    Archive,
    Eye,
    Clock,
    Zap,
    Award,
    CheckCircle2,
    XCircle,
    Brain,
    TrendingUp
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CustomDialog } from '../../../../widgets/CustomDialog/CustomDialog';
import { ConfirmDialog } from '../../../../widgets/ConfirmDialog/ConfirmDialog';
import { DataTable } from '../../../../widgets/Customtable/DataTable';
import { PackageForm } from './PackageForm';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { apiMessage } from '@/lib/api-message';
import { ToggleGroup, ToggleGroupItem } from '../../../../widgets/ToggleGroup/ToggleGroup';
import { Separator } from "@/components/ui/separator";
import { CustomFilterFromUrl, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, type SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { CustomPagination } from '@/widgets/custom-pagination/CustomPagination';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { PageHeader } from '@/widgets/page-header/PageHeader';

interface Package {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: 'active' | 'inactive' | 'draft';
    price: number;
    original_price: number | null;
    currency: string;
    billing_cycle: 'monthly' | 'yearly' | 'lifetime' | 'quarterly';
    trial_days: number;
    max_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    is_unlimited: boolean;
    max_courses_at_level: number | null;
    max_students: number | null;
    includes_certificate: boolean;
    can_download_materials: boolean;
    includes_video_lessons: boolean;
    video_quality: 'sd' | 'hd' | 'fhd';
    text_to_audio: boolean;
    audio_to_text: boolean;
    audio_minutes_per_month: number;
    ai_credits_per_month: number;
    ai_question_generation: boolean;
    ai_explanations: boolean;
    is_featured: boolean;
    badge_text: string;
    display_order: number;
    created_at: string;
    updated_at: string;
}

interface PackagesResponse {
    status: string;
    code: number;
    message: string;
    data: {
        results: Package[];
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

const BILLING_OPTIONS = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Lifetime', value: 'lifetime' },
];

const SORT_OPTIONS = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'display_order', label: 'Display Order' },
    { value: 'created_at', label: 'Created' },
];

// Hoisted to module scope — see courses/page.tsx for why.
const FILTERS: FilterConfig = {
    fields: [
        { name: 'billing_cycle', type: 'select', placeholder: 'Billing', options: BILLING_OPTIONS },
        { name: 'status', type: 'select', placeholder: 'Status', options: STATUS_OPTIONS },
    ],
    searchPlaceholder: 'Search packages...',
};

const SORTS: SortConfig = {
    options: SORT_OPTIONS,
    defaultSortBy: 'display_order',
    defaultSortOrder: 'asc',
};

export default function PackagesManagement() {
    return (
        <Suspense fallback={<TableSkeleton />}>
            <PackagesManagementInner />
        </Suspense>
    );
}

function PackagesManagementInner() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [activeModal, setActiveModal] = useState<'CREATE' | 'UPDATE' | 'DELETE' | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'table'>('table');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedPackageForDetails, setSelectedPackageForDetails] = useState<Package | null>(null);

    const pageSize = 10;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const billingCycle = searchParams.get('billing_cycle') || '';
    const sortBy = searchParams.get('sort_by') || '';
    const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc';

    const setPage = (nextPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(nextPage));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const { data: response, isLoading, refetch } = useQuery<PackagesResponse>({
        queryKey: [ENDPOINTS.PACKAGES.LIST_PACKAGES, page, pageSize, search, status, billingCycle, sortBy, sortOrder],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.PACKAGES.LIST_PACKAGES, {
                params: {
                    page, page_size: pageSize,
                    search: search || undefined,
                    status: status || undefined,
                    billing_cycle: billingCycle || undefined,
                    sort_by: sortBy || undefined,
                    sort_order: sortBy ? sortOrder : undefined,
                }
            });
            return data;
        },
    });

    const packages = response?.data?.results || [];
    const pagination = response?.data?.pagination;

    const invalidatePackages = () => {
        queryClient.invalidateQueries({ queryKey: [ENDPOINTS.PACKAGES.LIST_PACKAGES] });
    };

    const handleDeletePackage = async () => {
        if (!selectedPackage) return;

        try {
            const { data } = await api.delete(ENDPOINTS.PACKAGES.DELETE_PACKAGE.replace(':id', selectedPackage.id));
            toast.success(data.message || `Package "${selectedPackage.name}" deleted successfully.`);
            invalidatePackages();
            closeModals();
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to delete package."));
        }
    };

    const handleUpdateStatus = async (pkg: Package, newStatus: string) => {
        try {
            const { data } = await api.patch(ENDPOINTS.PACKAGES.UPDATE_PACKAGE.replace(':id', pkg.id), {
                status: newStatus
            });
            toast.success(data.message || `Package "${pkg.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
            invalidatePackages();
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to update package status."));
        }
    };

    const handleBulkAction = async (items: Package[], action: 'activate' | 'deactivate' | 'delete') => {
        if (items.length === 0) {
            toast.warning("No packages selected for bulk action.");
            return;
        }

        const ids = items.map(i => i.id);

        try {
            const { data } = await api.post(ENDPOINTS.PACKAGES.BULK_ACTION, {
                action: action,
                ids: ids
            });

            toast.success(data.message || `${items.length} package(s) ${action}d successfully.`);

            if (data.data?.warnings && data.data.warnings.length > 0) {
                data.data.warnings.forEach((warning: string) => {
                    toast.warning(warning);
                });
            }

            invalidatePackages();
        } catch (error: any) {
            toast.error(apiMessage(error, `Failed to ${action} ${items.length} package(s).`));
        }
    };

    const closeModals = () => {
        setActiveModal(null);
        setSelectedPackage(null);
    };

    const handleViewDetails = (pkg: Package) => {
        setSelectedPackageForDetails(pkg);
        setDetailsModalOpen(true);
    };

    const handleUpdateClick = (pkg: Package) => {
        setSelectedPackage(pkg);
        setActiveModal('UPDATE');
    };

    const handleDeleteClick = (pkg: Package) => {
        setSelectedPackage(pkg);
        setActiveModal('DELETE');
    };

    const getBillingCycleLabel = (cycle: string) => {
        switch (cycle) {
            case 'monthly': return 'Monthly';
            case 'yearly': return 'Yearly';
            case 'quarterly': return 'Quarterly';
            case 'lifetime': return 'Lifetime';
            default: return cycle;
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        const map: Record<string, string> = {
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced',
            expert: 'Expert',
        };
        return map[difficulty] || difficulty;
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    };

    // Table display configurations
    const displayConfigs = [
        {
            id: 'basic_info',
            label: 'Package Information',
            icon: <PackageIcon size={14} />,
            getData: (item: Package) => ({
                Name: item.name,
                Price: formatPrice(item.price, item.currency),
                Billing: getBillingCycleLabel(item.billing_cycle),
                Status: item.status
            })
        },
        {
            id: 'features',
            label: 'Features',
            icon: <Zap size={14} />,
            getData: (item: Package) => ({
                'AI Credits': `${item.ai_credits_per_month}/month`,
                'Audio Minutes': `${item.audio_minutes_per_month}/month`,
                Certificate: item.includes_certificate ? 'Yes' : 'No',
                Downloads: item.can_download_materials ? 'Yes' : 'No'
            })
        }
    ];

    // Row actions, pre-bound per row for ActionsDropdown (both list and
    // table view render through renderActions).
    const rowActions = (pkg: Package): ActionItem[] => [
        { label: 'View Details', icon: <Eye size={14} />, onClick: () => handleViewDetails(pkg) },
        { label: 'Update Package', icon: <Pencil size={14} />, onClick: () => handleUpdateClick(pkg) },
        {
            label: pkg.status === 'active' ? 'Deactivate' : 'Activate',
            icon: pkg.status === 'active' ? <Archive size={14} /> : <RefreshCw size={14} />,
            variant: pkg.status === 'active' ? 'destructive' : 'default',
            onClick: () => handleUpdateStatus(pkg, pkg.status === 'active' ? 'inactive' : 'active'),
        },
        { label: 'Delete Package', icon: <Trash2 size={14} />, variant: 'destructive', onClick: () => handleDeleteClick(pkg) },
    ];

    const bulkActions = [
        {
            label: 'Activate All',
            icon: <RefreshCw size={14} />,
            onClick: (items: Package[]) => handleBulkAction(items, "activate")
        },
        {
            label: 'Deactivate All',
            icon: <Archive size={14} />,
            variant: 'destructive' as const,
            onClick: (items: Package[]) => handleBulkAction(items, "deactivate")
        },
        {
            label: 'Delete All',
            icon: <Trash2 size={14} />,
            variant: 'destructive' as const,
            onClick: (items: Package[]) => handleBulkAction(items, "delete")
        },
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="SUBSCRIPTION MANAGEMENT"
                title={<>Package <span className="text-orange-600">Registry.</span></>}
                description="Manage subscription plans, pricing tiers, and feature access for the ecosystem."
                actions={
                    <>
                        <ToggleGroup
                            type="single"
                            value={viewMode}
                            onValueChange={(value: any) => value && setViewMode(value as 'list' | 'table')}
                            className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 bg-white dark:bg-zinc-900/80"
                        >
                            <ToggleGroupItem value="list" className="rounded-lg data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 gap-3 px-3 py-1">
                                <LayoutGrid size={16} /> <span className="hidden sm:inline">List view</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="table" className="rounded-lg data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 gap-3 px-3 py-1">
                                <LayoutList size={16} /><span className="hidden sm:inline">Table view</span>
                            </ToggleGroupItem>
                        </ToggleGroup>

                        <Button variant="outline" onClick={() => refetch()} className="rounded-xl h-11 w-11 p-0 transition-all">
                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                        </Button>

                        <Button onClick={() => setActiveModal('CREATE')} className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all">
                            <Plus size={18} className="mr-2" /> Create Package
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {packages.map((pkg: Package) => (
                        <Card
                            key={pkg.id}
                            className={`shadow-none bg-white dark:bg-zinc-900/80 border-2 transition-all overflow-hidden relative
                                ${pkg.is_featured ? 'border-orange-500/50 dark:border-orange-500/30' : 'border-zinc-200 dark:border-zinc-800'}
                                hover:scale-[1.02] hover:shadow-xl`}
                        >
                            {pkg.is_featured && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                                        Featured
                                    </div>
                                </div>
                            )}
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-black text-xl tracking-tight mb-1">{pkg.name}</h3>
                                        {pkg.badge_text && (
                                            <Badge variant="outline" className="mb-2 text-[9px] font-black uppercase tracking-widest">
                                                {pkg.badge_text}
                                            </Badge>
                                        )}
                                        <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{pkg.description}</p>
                                    </div>

                                    <Badge className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest
                                        ${pkg.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                                            pkg.status === 'inactive' ? 'bg-rose-500/10 text-rose-600' :
                                                'bg-amber-500/10 text-amber-600'}`}>
                                        {pkg.status === 'active' ? "Active" : "Inactive"}
                                    </Badge>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400 font-bold uppercase tracking-widest">Price</span>
                                        <span className="font-black text-lg">
                                            {formatPrice(pkg.price, pkg.currency)}
                                            {pkg.original_price && (
                                                <span className="text-zinc-400 line-through text-sm ml-2">
                                                    {formatPrice(pkg.original_price, pkg.currency)}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400 font-bold uppercase tracking-widest">Billing</span>
                                        <span className="font-bold">{getBillingCycleLabel(pkg.billing_cycle)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400 font-bold uppercase tracking-widest">Trial</span>
                                        <span className="font-bold">{pkg.trial_days} days</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400 font-bold uppercase tracking-widest">AI Credits</span>
                                        <span className="font-bold">{pkg.ai_credits_per_month}/month</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {pkg.includes_certificate && (
                                        <Badge className="bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                                            <Award size={10} className="mr-1" /> Certificate
                                        </Badge>
                                    )}
                                    {pkg.can_download_materials && (
                                        <Badge className="bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-widest">
                                            Downloads
                                        </Badge>
                                    )}
                                    {pkg.includes_video_lessons && (
                                        <Badge className="bg-purple-500/10 text-purple-600 text-[9px] font-black uppercase tracking-widest">
                                            Video Lessons
                                        </Badge>
                                    )}
                                </div>

                                <ActionsDropdown
                                    actions={rowActions(pkg)}
                                    maxVisible={0}
                                    showLabels
                                    className="w-full justify-center rounded-xl border border-zinc-200 dark:border-zinc-800"
                                />
                            </CardContent>
                        </Card>
                    ))}

                    {packages.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <PackageIcon className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No packages found</h3>
                            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or create a new package.</p>
                        </div>
                    )}

                    {pagination && (
                        <div className="col-span-full">
                            <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                <DataTable
                    data={packages}
                    isLoading={isLoading}
                    sortConfig={sortBy ? { sortBy, sortOrder } : undefined}
                    displayConfigs={displayConfigs}
                    renderActions={(pkg) => <ActionsDropdown actions={rowActions(pkg)} maxVisible={3} showLabels={false} />}
                    bulkActions={bulkActions}
                    excludeColumns={['id', 'slug', 'description', 'created_at', 'updated_at', 'original_price', 'max_courses_at_level', 'max_students', 'video_quality', 'audio_minutes_per_month', 'ai_credits_per_month', 'display_order', 'badge_text']}
                    dots={{
                        status: { "active": 'emerald', "inactive": 'rose', "draft": 'amber' },
                        billing_cycle: { "monthly": 'blue', "yearly": 'violet', "quarterly": 'orange', "lifetime": 'rose' }
                    }}
                    badges={{
                        is_featured: { "true": 'orange', "false": 'zinc' },
                        includes_certificate: { "true": 'emerald', "false": 'zinc' }
                    }}
                    links={{
                        name: (pkg: Package) => `/admin/packages/${pkg.slug}`
                    }}
                    emptyTitle="No packages found"
                    emptyDescription="No subscription packages match your current filters."
                />
                {pagination && (
                    <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} />
                )}
                </div>
            )}

            {/* Package Details Modal */}
            <CustomDialog
                title="Package Details"
                description={`Complete information about ${selectedPackageForDetails?.name}`}
                open={detailsModalOpen}
                onOpenChange={setDetailsModalOpen}
                contentWidth="max-w-5xl"
            >
                {selectedPackageForDetails && (
                    <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-2">
                        {/* Header */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-orange-500/5 border border-primary/20">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">{selectedPackageForDetails.name}</h2>
                                    <p className="text-sm text-zinc-500 mt-1">{selectedPackageForDetails.description}</p>
                                </div>
                                <div className="text-right">
                                    <Badge className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest
                                        ${selectedPackageForDetails.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                                            selectedPackageForDetails.status === 'inactive' ? 'bg-rose-500/10 text-rose-600' :
                                                'bg-amber-500/10 text-amber-600'}`}>
                                        {selectedPackageForDetails.status === 'active' ? "Active" : "Inactive"}
                                    </Badge>
                                    {selectedPackageForDetails.badge_text && (
                                        <Badge variant="outline" className="mt-2 ml-2 text-[9px] font-black uppercase tracking-widest">
                                            {selectedPackageForDetails.badge_text}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Billing Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30">
                                <p className="text-[10px] text-zinc-400">Monthly Price</p>
                                <p className="font-bold text-lg">{formatPrice(selectedPackageForDetails.price, selectedPackageForDetails.currency)}</p>
                                {selectedPackageForDetails.original_price && (
                                    <p className="text-xs text-zinc-400 line-through">{formatPrice(selectedPackageForDetails.original_price, selectedPackageForDetails.currency)}</p>
                                )}
                            </div>
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30">
                                <p className="text-[10px] text-zinc-400">Billing Cycle</p>
                                <p className="font-bold">{getBillingCycleLabel(selectedPackageForDetails.billing_cycle)}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30">
                                <p className="text-[10px] text-zinc-400">Trial Period</p>
                                <p className="font-bold">{selectedPackageForDetails.trial_days} days free trial</p>
                            </div>
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30">
                                <p className="text-[10px] text-zinc-400">Display Order</p>
                                <p className="font-bold">{selectedPackageForDetails.display_order}</p>
                            </div>
                        </div>

                        {/* Course Access Limits */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <TrendingUp size={14} className="text-primary" />
                                Course Access Limits
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[10px] text-zinc-400">Max Difficulty</p>
                                    <p className="font-bold capitalize">{getDifficultyLabel(selectedPackageForDetails.max_difficulty)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-400">Courses at Max Level</p>
                                    <p className="font-bold">{selectedPackageForDetails.max_courses_at_level ? `${selectedPackageForDetails.max_courses_at_level} courses` : 'Unlimited'}</p>
                                    <p className="text-[9px] text-zinc-400 mt-1">Courses below level: Unlimited</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-400">Max Students</p>
                                    <p className="font-bold">{selectedPackageForDetails.max_students ? `${selectedPackageForDetails.max_students} students` : 'Unlimited'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <Zap size={14} className="text-primary" />
                                Included Features
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    {selectedPackageForDetails.includes_certificate ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-zinc-400" />}
                                    <span className="text-sm">Certificate of Completion</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedPackageForDetails.can_download_materials ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-zinc-400" />}
                                    <span className="text-sm">Download Materials</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedPackageForDetails.includes_video_lessons ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-zinc-400" />}
                                    <span className="text-sm">Video Lessons {selectedPackageForDetails.includes_video_lessons && `(${selectedPackageForDetails.video_quality.toUpperCase()})`}</span>
                                </div>
                            </div>
                        </div>

                        {/* AI & Audio Features */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <Brain size={14} className="text-primary" />
                                AI & Audio Features
                            </h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-zinc-400">AI Credits / Month</p>
                                        <p className="font-bold">{selectedPackageForDetails.ai_credits_per_month} credits</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-400">Audio Minutes / Month</p>
                                        <p className="font-bold">{selectedPackageForDetails.audio_minutes_per_month} minutes</p>
                                    </div>
                                </div>
                                <Separator className="my-2" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        {selectedPackageForDetails.ai_question_generation ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-zinc-400" />}
                                        <span className="text-sm">AI Question Generation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedPackageForDetails.ai_explanations ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-zinc-400" />}
                                        <span className="text-sm">AI Explanations</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedPackageForDetails.text_to_audio ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-zinc-400" />}
                                        <span className="text-sm">Text to Audio</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedPackageForDetails.audio_to_text ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-zinc-400" />}
                                        <span className="text-sm">Audio to Text</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meta Information */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                <Clock size={14} className="text-primary" />
                                Meta Information
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-zinc-500">Created:</span> {new Date(selectedPackageForDetails.created_at).toLocaleDateString()}
                                </div>
                                <div>
                                    <span className="text-zinc-500">Last Updated:</span> {new Date(selectedPackageForDetails.updated_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CustomDialog>

            {/* Modals */}
            <CustomDialog
                title={activeModal === 'CREATE' ? "Create Package" : "Update Package"}
                description={activeModal === 'CREATE'
                    ? "Define a new subscription tier with pricing and feature limits."
                    : "Modify pricing, features, and limits for this subscription package."}
                open={activeModal === 'CREATE' || activeModal === 'UPDATE'}
                onOpenChange={closeModals}
            >
                <PackageForm
                    type={activeModal as Partial<'CREATE' | 'UPDATE' | null>}
                    packageId={selectedPackage?.id}
                    initialData={selectedPackage ? {
                        name: selectedPackage.name,
                        description: selectedPackage.description,
                        price: selectedPackage.price,
                        original_price: selectedPackage.original_price,
                        currency: selectedPackage.currency,
                        billing_cycle: selectedPackage.billing_cycle,
                        status: selectedPackage.status,
                        trial_days: selectedPackage.trial_days,
                        max_difficulty: selectedPackage.max_difficulty,
                        is_unlimited: selectedPackage.is_unlimited,
                        max_courses_at_level: selectedPackage.max_courses_at_level,
                        max_students: selectedPackage.max_students,
                        includes_certificate: selectedPackage.includes_certificate,
                        can_download_materials: selectedPackage.can_download_materials,
                        includes_video_lessons: selectedPackage.includes_video_lessons,
                        video_quality: selectedPackage.video_quality,
                        text_to_audio: selectedPackage.text_to_audio,
                        audio_to_text: selectedPackage.audio_to_text,
                        audio_minutes_per_month: selectedPackage.audio_minutes_per_month,
                        ai_credits_per_month: selectedPackage.ai_credits_per_month,
                        ai_question_generation: selectedPackage.ai_question_generation,
                        ai_explanations: selectedPackage.ai_explanations,
                        is_featured: selectedPackage.is_featured,
                        badge_text: selectedPackage.badge_text,
                        display_order: selectedPackage.display_order
                    } : undefined}
                    onSuccess={() => {
                        invalidatePackages();
                        closeModals();
                    }}
                />
            </CustomDialog>

            <ConfirmDialog
                open={activeModal === 'DELETE'}
                onOpenChange={closeModals}
                title="Delete Package"
                warning={`Permanently delete "${selectedPackage?.name}"? This will remove this package from all users. Users with active subscriptions will not be affected, but new subscriptions cannot be created.`}
                confirmText="Delete Package"
                confirmIcon={Trash2}
                onConfirm={handleDeletePackage}
                variant="destructive"
            />
        </div>
    );
}
