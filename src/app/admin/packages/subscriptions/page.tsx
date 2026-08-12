'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
    CreditCard,
    LayoutList,
    LayoutGrid,
    RefreshCw,
    Loader2,
    Eye,
    User,
    Calendar,
    Pencil,
    Save,
    XCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Package
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ENDPOINTS } from '@/lib/endpoints';
import { apiMessage } from '@/lib/api-message';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import { ToggleGroup, ToggleGroupItem } from '../../../../../widgets/ToggleGroup/ToggleGroup';
import { DataTable } from '../../../../../widgets/Customtable/DataTable';
import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';
import { CustomFilterFromUrl, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, type SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { CustomPagination } from '@/widgets/custom-pagination/CustomPagination';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { PageHeader } from '@/widgets/page-header/PageHeader';

interface Subscription {
    id: string;
    user: {
        id: string;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    package: {
        id: string;
        name: string;
        price: number;
        currency: string;
        billing_cycle: string;
    };
    status: 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled';
    start_date: string;
    end_date: string | null;
    trial_end_date: string | null;
    auto_renew: boolean;
    payment_method: string | null;
    created_at: string;
    updated_at: string;
}

interface SubscriptionsResponse {
    status: string;
    code: number;
    message: string;
    data: {
        results: Subscription[];
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

// Update subscription schema
const updateSubscriptionSchema = z.object({
    status: z.enum(['active', 'inactive', 'trial', 'expired', 'cancelled']),
    auto_renew: z.boolean(),
    end_date: z.string().nullable().optional(),
    trial_end_date: z.string().nullable().optional(),
});

type UpdateSubscriptionFormData = z.infer<typeof updateSubscriptionSchema>;

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active', color: 'emerald' },
    { value: 'trial', label: 'Trial', color: 'blue' },
    { value: 'inactive', label: 'Inactive', color: 'zinc' },
    { value: 'expired', label: 'Expired', color: 'amber' },
    { value: 'cancelled', label: 'Cancelled', color: 'rose' },
];

const SORT_OPTIONS = [
    { value: 'created_at', label: 'Created' },
    { value: 'status', label: 'Status' },
    { value: 'package', label: 'Package' },
];

// Hoisted to module scope — see courses/page.tsx for why.
const FILTERS: FilterConfig = {
    fields: [{ name: 'status', type: 'select', placeholder: 'Status', options: STATUS_OPTIONS.map(o => ({ label: o.label, value: o.value })) }],
    searchPlaceholder: 'Search by username, email, or package...',
};

const SORTS: SortConfig = {
    options: SORT_OPTIONS,
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
};

export default function SubscriptionsManagement() {
    return (
        <Suspense fallback={<TableSkeleton />}>
            <SubscriptionsManagementInner />
        </Suspense>
    );
}

function SubscriptionsManagementInner() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [activeModal, setActiveModal] = useState<'UPDATE' | 'DETAILS' | null>(null);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'table'>('table');

    const pageSize = 10;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sort_by') || '';
    const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc';

    const setPage = (nextPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(nextPage));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const { data: response, isLoading, refetch } = useQuery<SubscriptionsResponse>({
        queryKey: [ENDPOINTS.SUBSCRIPTIONS.LIST_SUBSCRIPTIONS, page, pageSize, search, statusFilter, sortBy, sortOrder],
        queryFn: async () => {
            const params: any = {
                page, page_size: pageSize,
                search: search || undefined,
                sort_by: sortBy || undefined,
                sort_order: sortBy ? sortOrder : undefined,
            };
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const { data } = await api.get(ENDPOINTS.SUBSCRIPTIONS.LIST_SUBSCRIPTIONS, { params });
            return data;
        },
    });

    const subscriptions = response?.data?.results || [];
    const pagination = response?.data?.pagination;

    const invalidateSubscriptions = () => {
        queryClient.invalidateQueries({ queryKey: [ENDPOINTS.SUBSCRIPTIONS.LIST_SUBSCRIPTIONS] });
    };

    const handleUpdateSubscription = async (values: UpdateSubscriptionFormData) => {
        if (!selectedSubscription) return;

        try {
            const updateData: any = {
                status: values.status,
                auto_renew: values.auto_renew,
            };

            if (values.end_date) updateData.end_date = values.end_date;
            if (values.trial_end_date) updateData.trial_end_date = values.trial_end_date;

            const { data } = await api.patch(
                ENDPOINTS.SUBSCRIPTIONS.UPDATE_SUBSCRIPTION.replace(':id', selectedSubscription.id),
                updateData
            );

            toast.success(data.message || `Subscription updated successfully.`);
            invalidateSubscriptions();
            setActiveModal(null);
            setSelectedSubscription(null);
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to update subscription."));
        }
    };

    const getStatusColor = (status: string) => {
        const option = STATUS_OPTIONS.find(opt => opt.value === status);
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-600';
            case 'trial': return 'bg-blue-500/10 text-blue-600';
            case 'inactive': return 'bg-zinc-500/10 text-zinc-600';
            case 'expired': return 'bg-amber-500/10 text-amber-600';
            case 'cancelled': return 'bg-rose-500/10 text-rose-600';
            default: return 'bg-zinc-100 text-zinc-600';
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(price);
    };

    const getBillingCycleLabel = (cycle: string) => {
        switch (cycle) {
            case 'monthly': return '/month';
            case 'yearly': return '/year';
            case 'quarterly': return '/quarter';
            case 'lifetime': return ' (Lifetime)';
            default: return '';
        }
    };

    // Table display configurations
    const displayConfigs = [
        {
            id: 'user_info',
            label: 'User Information',
            icon: <User size={14} />,
            getData: (item: Subscription) => ({
                Username: item.user?.username,
                Email: item.user?.email,
                'Full Name': `${item.user?.first_name || ''} ${item.user?.last_name || ''}`.trim() || 'N/A'
            }),
            excludeKeys: ['Email']
        },
        {
            id: 'subscription_info',
            label: 'Subscription Details',
            icon: <CreditCard size={14} />,
            getData: (item: Subscription) => ({
                Package: item.package?.name,
                Price: `${formatPrice(item.package?.price, item.package?.currency)}${getBillingCycleLabel(item.package?.billing_cycle)}`,
                'Auto Renew': item.auto_renew ? 'Yes' : 'No',
                'Start Date': formatDate(item.start_date),
                'End Date': formatDate(item.end_date)
            })
        },
        {
            id: 'package_info',
            label: 'Package Details',
            icon: <Package size={14} />,
            getData: (item: Subscription) => ({
                ...item.package
            })
        }
    ];

    // Row actions, pre-bound per row for ActionsDropdown (both list and
    // table view render through renderActions).
    const rowActions = (sub: Subscription): ActionItem[] => [
        {
            label: 'Update Subscription',
            icon: <Pencil size={14} />,
            onClick: () => { setSelectedSubscription(sub); setActiveModal('UPDATE'); },
        },
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => { setSelectedSubscription(sub); setActiveModal('DETAILS'); },
        },
    ];

    // Update Form Component
    function UpdateSubscriptionForm({ subscription, onSuccess }: { subscription: Subscription; onSuccess: () => void }) {
        const [isLoading, setIsLoading] = useState(false);

        const form = useForm<UpdateSubscriptionFormData>({
            resolver: zodResolver(updateSubscriptionSchema),
            defaultValues: {
                status: subscription.status,
                auto_renew: subscription.auto_renew,
                end_date: subscription.end_date,
                trial_end_date: subscription.trial_end_date,
            },
        });

        const onSubmit = async (values: UpdateSubscriptionFormData) => {
            setIsLoading(true);
            try {
                const updateData: any = {
                    status: values.status,
                    auto_renew: values.auto_renew,
                };

                if (values.end_date) updateData.end_date = values.end_date;
                if (values.trial_end_date) updateData.trial_end_date = values.trial_end_date;

                const { data } = await api.patch(
                    ENDPOINTS.SUBSCRIPTIONS.UPDATE_SUBSCRIPTION.replace(':id', subscription.id),
                    updateData
                );

                toast.success(data.message || `Subscription updated successfully.`);
                onSuccess();
            } catch (error: any) {
                const errorMessage = apiMessage(error, "Failed to update subscription.");
                toast.error(errorMessage);
                form.setError('root', { message: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {form.formState.errors.root && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20 text-center">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">User:</span>
                            <span className="font-bold">{subscription.user?.username} ({subscription.user?.email})</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Package:</span>
                            <span className="font-bold">{subscription.package?.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Start Date:</span>
                            <span className="font-bold">{formatDate(subscription.start_date)}</span>
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                    Status
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="z-[101]">
                                        {STATUS_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full bg-${option.color}-500`} />
                                                    {option.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="auto_renew"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                    Auto Renew
                                </FormLabel>
                                <Select onValueChange={(val) => field.onChange(val === 'true')} value={String(field.value)} disabled={isLoading}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium">
                                            <SelectValue placeholder="Select auto renew" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="z-[101]">
                                        <SelectItem value="true" className="cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={14} className="text-emerald-500" />
                                                Enabled
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="false" className="cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <XCircle size={14} className="text-rose-500" />
                                                Disabled
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                    End Date (Optional)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value || null)}
                                        className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="trial_end_date"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                    Trial End Date (Optional)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value || null)}
                                        className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <Button
                        disabled={isLoading}
                        type="submit"
                        className="w-full h-12 bg-primary hover:bg-orange-600 font-bold transition-all rounded-xl text-white gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Update Subscription
                    </Button>
                </form>
            </Form>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="SUBSCRIPTION MANAGEMENT"
                title={<>Subscription <span className="text-orange-600">Registry.</span></>}
                description="Monitor and manage user subscriptions across the platform."
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
                    {subscriptions.map((subscription: Subscription) => (
                        <Card
                            key={subscription.id}
                            className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 group hover:-translate-y-0.5 transition-all overflow-hidden"
                        >
                            <CardContent className="p-0">
                                <div className="py-4 px-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <CreditCard size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-xl tracking-tight">
                                                    {subscription.user?.username}
                                                </h3>
                                                <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none text-[10px] font-black tracking-widest uppercase">
                                                    {subscription.package?.name}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-zinc-500">{subscription.user?.email}</p>
                                            <div className="flex items-center gap-5 mt-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-primary/60" />
                                                    Started: {formatDate(subscription.start_date)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={14} className="text-primary/60" />
                                                    Ends: {formatDate(subscription.end_date)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <DollarSign size={14} className="text-primary/60" />
                                                    {formatPrice(subscription.package?.price, subscription.package?.currency)}
                                                    {getBillingCycleLabel(subscription.package?.billing_cycle)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden lg:block">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Auto Renew</p>
                                            <span className="text-xs font-bold">
                                                {subscription.auto_renew ?
                                                    <Badge className="bg-emerald-500/10 text-emerald-600">Enabled</Badge> :
                                                    <Badge className="bg-rose-500/10 text-rose-600">Disabled</Badge>
                                                }
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(subscription.status)}`}>
                                                {subscription.status}
                                            </div>

                                            <ActionsDropdown actions={rowActions(subscription)} maxVisible={1} showLabels={false} className="rounded-xl" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {subscriptions.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <CreditCard className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No subscriptions found</h3>
                            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or filters.</p>
                        </div>
                    )}

                    {pagination && (
                        <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} className="pt-4" />
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                <DataTable
                    data={subscriptions}
                    isLoading={isLoading}
                    sortConfig={sortBy ? { sortBy, sortOrder } : undefined}
                    displayConfigs={displayConfigs}
                    renderActions={(sub) => <ActionsDropdown actions={rowActions(sub)} maxVisible={3} showLabels={false} />}
                    excludeColumns={['id', 'payment_method', 'created_at', 'updated_at', 'trial_end_date', 'package', 'user']}
                    dots={{
                        status: {
                            "active": 'emerald',
                            "trial": 'blue',
                            "inactive": 'zinc',
                            "expired": 'amber',
                            "cancelled": 'rose'
                        },
                        auto_renew: {
                            "true": 'emerald',
                            "false": 'rose'
                        }
                    }}
                    links={{
                        username: (sub: Subscription) => `/admin/users/${sub.user?.id}`,
                        email: (sub: Subscription) => `/admin/users/${sub.user?.id}`,
                        package: (sub: Subscription) => `/admin/packages/${sub.package?.id}`
                    }}
                    emptyTitle="No subscriptions found"
                    emptyDescription="No subscriptions match your current filters."
                />
                {pagination && (
                    <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} />
                )}
                </div>
            )}

            {/* Update Subscription Modal */}
            <CustomDialog
                title="Update Subscription"
                description={`Modify subscription details for ${selectedSubscription?.user?.username}`}
                open={activeModal === 'UPDATE'}
                onOpenChange={() => {
                    setActiveModal(null);
                    setSelectedSubscription(null);
                }}
            >
                {selectedSubscription && (
                    <UpdateSubscriptionForm
                        subscription={selectedSubscription}
                        onSuccess={() => {
                            invalidateSubscriptions();
                            setActiveModal(null);
                            setSelectedSubscription(null);
                        }}
                    />
                )}
            </CustomDialog>
            <CustomDialog title="Subscription details" description="Complete subscription metadata" open={activeModal === 'DETAILS'} onOpenChange={() => { setActiveModal(null); setSelectedSubscription(null); }}>
                {selectedSubscription && <div className="grid grid-cols-2 gap-4 py-4 text-sm"><div><p className="text-zinc-400">User</p><p className="font-bold">{selectedSubscription.user?.username}</p></div><div><p className="text-zinc-400">Package</p><p className="font-bold">{selectedSubscription.package?.name}</p></div><div><p className="text-zinc-400">Status</p><p className="font-bold capitalize">{selectedSubscription.status}</p></div><div><p className="text-zinc-400">Auto renew</p><p>{selectedSubscription.auto_renew ? 'Yes' : 'No'}</p></div><div><p className="text-zinc-400">Started</p><p>{new Date(selectedSubscription.start_date).toLocaleString()}</p></div><div><p className="text-zinc-400">Ends</p><p>{selectedSubscription.end_date ? new Date(selectedSubscription.end_date).toLocaleString() : 'Never'}</p></div></div>}
            </CustomDialog>
        </div>
    );
}
