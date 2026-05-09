'use client';

import React, { useState } from 'react';
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Package as PackageIcon,
    LayoutList,
    LayoutGrid,
    RefreshCw,
    Archive,
    Loader2,
    Eye,
    FileText,
    DollarSign,
    CreditCard,
    Clock,
    Zap,
    Award,
    CheckCircle2,
    XCircle
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
import { CustomDialog } from '../../../../widgets/CustomDialog/CustomDialog';
import { ConfirmDialog } from '../../../../widgets/ConfirmDialog/ConfirmDialog';
import { DataTable } from '../../../../widgets/Customtable/DataTable';
import { PackageForm } from './PackageForm';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { ToggleGroup, ToggleGroupItem } from '../../../../widgets/ToggleGroup/ToggleGroup';

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
    is_unlimited: boolean;
    max_courses: number | null;
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

export default function PackagesManagement() {
    const queryClient = useQueryClient();
    const [activeModal, setActiveModal] = useState<'CREATE' | 'UPDATE' | 'DELETE' | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    const { data: response, isLoading, refetch } = useQuery<PackagesResponse>({
        queryKey: [ENDPOINTS.PACKAGES.LIST_PACKAGES, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.PACKAGES.LIST_PACKAGES, {
                params: { page, page_size: pageSize }
            });
            return data;
        },
    });

    const packages = response?.data?.results || [];
    const pagination = response?.data?.pagination;

    const filteredPackages = React.useMemo(() => {
        if (!packages.length) return [];
        if (!searchQuery) return packages;

        const query = searchQuery.toLowerCase();
        return packages.filter((pkg: Package) =>
            pkg.name?.toLowerCase().includes(query) ||
            pkg.description?.toLowerCase().includes(query)
        );
    }, [packages, searchQuery]);

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
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete package.";
            toast.error(errorMessage);
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
            const errorMessage = error.response?.data?.message || error.message || `Failed to update package status.`;
            toast.error(errorMessage);
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
            const errorMessage = error.response?.data?.message || error.message || `Failed to ${action} ${items.length} package(s).`;
            toast.error(errorMessage);
        }
    };

    const handleExport = async (items: Package[]) => {
        if (items.length === 0) {
            toast.warning("No packages selected for export.");
            return;
        }

        try {
            const exportData = items.map(pkg => ({
                ID: pkg.id,
                Name: pkg.name,
                Slug: pkg.slug,
                Description: pkg.description,
                Status: pkg.status,
                Price: pkg.price,
                Original_Price: pkg.original_price,
                Currency: pkg.currency,
                Billing_Cycle: pkg.billing_cycle,
                Trial_Days: pkg.trial_days,
                Is_Unlimited: pkg.is_unlimited,
                Max_Courses: pkg.max_courses,
                Max_Students: pkg.max_students,
                Includes_Certificate: pkg.includes_certificate,
                Can_Download_Materials: pkg.can_download_materials,
                Includes_Video_Lessons: pkg.includes_video_lessons,
                Video_Quality: pkg.video_quality,
                Text_To_Audio: pkg.text_to_audio,
                Audio_To_Text: pkg.audio_to_text,
                Audio_Minutes_Per_Month: pkg.audio_minutes_per_month,
                AI_Credits_Per_Month: pkg.ai_credits_per_month,
                AI_Question_Generation: pkg.ai_question_generation,
                AI_Explanations: pkg.ai_explanations,
                Is_Featured: pkg.is_featured,
                Badge_Text: pkg.badge_text,
                Display_Order: pkg.display_order,
                Created_At: pkg.created_at,
                Updated_At: pkg.updated_at
            }));

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `packages_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`${items.length} package(s) exported successfully.`);
        } catch (error: any) {
            toast.error(error.message || "Failed to export packages.");
        }
    };

    const closeModals = () => {
        setActiveModal(null);
        setSelectedPackage(null);
    };

    const handleViewDetails = (pkg: Package) => {
        toast.info(`Viewing details for "${pkg.name}"`);
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

    const actions = [
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: handleViewDetails
        },
        {
            label: 'Update Package',
            icon: <Pencil size={14} />,
            onClick: handleUpdateClick
        },
        {
            label: (pkg: Package) => pkg.status === 'active' ? 'Deactivate' : 'Activate',
            icon: (pkg: Package) => pkg.status === 'active' ? <Archive size={14} /> : <RefreshCw size={14} />,
            variant: (pkg: Package): 'destructive' | 'default' => pkg.status === 'active' ? 'destructive' : 'default',
            onClick: (pkg: Package) => handleUpdateStatus(pkg, pkg.status === 'active' ? 'inactive' : 'active')
        },
        {
            label: 'Delete Package',
            icon: <Trash2 size={14} />,
            variant: 'destructive' as const,
            onClick: handleDeleteClick
        }
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
                        SUBSCRIPTION MANAGEMENT
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                        Package <span className="text-orange-600">Registry.</span>
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-tight text-sm">
                        Manage subscription plans, pricing tiers, and feature access for the ecosystem.
                    </p>
                </div>

                <div className="flex gap-3">
                    <ToggleGroup
                        type="single"
                        value={viewMode}
                        onValueChange={(value: any) => value && setViewMode(value as 'list' | 'table')}
                        className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 bg-white dark:bg-zinc-900/80"
                    >
                        <ToggleGroupItem value="list" className="rounded-lg data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 gap-3 p-3">
                            <LayoutGrid size={16} /> <span>List view</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="table" className="rounded-lg data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 gap-3 p-3">
                            <LayoutList size={16} /><span>Table view</span>
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <Button variant="outline" onClick={() => refetch()} className="rounded-xl h-11 w-11 p-0 transition-all">
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </Button>

                    <Button onClick={() => setActiveModal('CREATE')} className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all">
                        <Plus size={18} className="mr-2" /> Create Package
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center bg-white dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
                    <Input
                        placeholder="Search packages by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 font-medium placeholder:text-zinc-400"
                    />
                </div>
                <div className="hidden md:flex items-center gap-2 pr-2">
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        By Billing
                    </Button>
                    <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        By Status
                    </Button>
                </div>
            </div>

            {/* View Renderer */}
            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPackages.map((pkg: Package) => (
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

                                    <Badge className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                        ${pkg.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                                            pkg.status === 'inactive' ? 'bg-rose-500/10 text-rose-600' :
                                                'bg-amber-500/10 text-amber-600'}`}>
                                        {pkg.status}
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

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full rounded-xl font-bold text-xs">
                                            <MoreHorizontal size={14} className="mr-2" /> Actions
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                                        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                            Package Controls
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem onSelect={() => handleViewDetails(pkg)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs">
                                            <Eye size={16} /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleUpdateClick(pkg)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs">
                                            <Pencil size={16} /> Update Package
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleUpdateStatus(pkg, pkg.status === 'active' ? 'inactive' : 'active')} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs">
                                            <RefreshCw size={16} /> {pkg.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />
                                        <DropdownMenuItem onSelect={() => handleDeleteClick(pkg)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-bold text-xs">
                                            <Trash2 size={16} /> Delete Package
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredPackages.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <PackageIcon className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No packages found</h3>
                            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or create a new package.</p>
                        </div>
                    )}

                    {pagination && (
                        <div className="col-span-full flex justify-between items-center pt-4">
                            <div className="text-sm text-zinc-500">
                                Showing {filteredPackages.length} of {pagination.total} packages
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.has_previous}>
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={!pagination.has_next}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <DataTable
                    data={filteredPackages}
                    displayConfigs={displayConfigs}
                    actions={actions}
                    bulkActions={bulkActions}
                    excludeColumns={['id', 'slug', 'description', 'created_at', 'updated_at', 'original_price', 'max_courses', 'max_students', 'video_quality', 'audio_minutes_per_month', 'ai_credits_per_month', 'display_order', 'badge_text']}
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
            )}

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
                        is_unlimited: selectedPackage.is_unlimited,
                        max_courses: selectedPackage.max_courses,
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