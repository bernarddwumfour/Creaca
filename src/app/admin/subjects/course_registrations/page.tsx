'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
    Users,
    Eye,
    RefreshCw,
    Calendar,
    User,
    BookOpen,
    Package,
    CheckCircle,
    XCircle,
    Award,
    Clock,
    LayoutGrid,
    LayoutList,
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';
import { DataTable } from '../../../../../widgets/Customtable/DataTable';
import { ToggleGroup, ToggleGroupItem } from '../../../../../widgets/ToggleGroup/ToggleGroup';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { CustomFilterFromUrl, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, type SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { CustomPagination } from '@/widgets/custom-pagination/CustomPagination';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { PageHeader } from '@/widgets/page-header/PageHeader';

interface Registration {
    id: string;
    course: {
        id: string;
        name: string;
        slug: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        duration: number | null;
        price: string | null;
        subject: {
            id: string;
            name: string;
        }
    };
    user: {
        id: string;
        email: string;
        name: string;
    };
    subscription: {
        id: string;
        package: string;
    };
    status: 'active' | 'dropped' | 'completed';
    progress: number;
    is_completed: boolean;
    completed_at: string | null;
    enrolled_at: string;
    dropped_at: string | null;
    created_at: string;
    updated_at: string;
}

interface RegistrationsResponse {
    status: string;
    code: number;
    message: string;
    data: {
        results: Registration[];
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
    { label: 'Completed', value: 'completed' },
    { label: 'Dropped', value: 'dropped' },
];

const SORT_OPTIONS = [
    { value: 'enrolled_at', label: 'Enrolled' },
    { value: 'status', label: 'Status' },
    { value: 'course', label: 'Course' },
];

// Hoisted to module scope — see courses/page.tsx for why.
const FILTERS: FilterConfig = {
    fields: [{ name: 'status', type: 'select', placeholder: 'Status', options: STATUS_OPTIONS }],
    searchPlaceholder: 'Search by student name, email, or course...',
};

const SORTS: SortConfig = {
    options: SORT_OPTIONS,
    defaultSortBy: 'enrolled_at',
    defaultSortOrder: 'desc',
};

const STATUS_COLORS = {
    active: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle, label: 'Active' },
    completed: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: Award, label: 'Completed' },
    dropped: { bg: 'bg-rose-500/10', text: 'text-rose-600', icon: XCircle, label: 'Dropped' }
};

const getDifficultyLabel = (difficulty: string) => {
    const map: Record<string, string> = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
    };
    return map[difficulty] || difficulty;
};

export default function AdminRegistrationsPage() {
    return (
        <Suspense fallback={<TableSkeleton />}>
            <AdminRegistrationsPageInner />
        </Suspense>
    );
}

function AdminRegistrationsPageInner() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [viewMode, setViewMode] = useState<'list' | 'table'>('table');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

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

    const { data: response, isLoading, refetch } = useQuery<RegistrationsResponse>({
        queryKey: ['admin-registrations', page, pageSize, search, status, sortBy, sortOrder],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.ADMIN_LIST_REGISTRATIONS, {
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

    const registrations = response?.data?.results || [];
    const pagination = response?.data?.pagination;

    const handleViewDetails = (registration: Registration) => {
        setSelectedRegistration(registration);
        setDetailModalOpen(true);
    };

    // Table display configurations
    const displayConfigs = [
        {
            id: 'student_info',
            label: 'Student Information',
            icon: <User size={14} />,
            getData: (item: Registration) => ({
                Name: item.user.name,
                Email: item.user.email,
            }),
            excludeKeys: ['Email']
        },
        {
            id: 'course_info',
            label: 'Course Details',
            icon: <BookOpen size={14} />,
            getData: (item: Registration) => ({
                Course: item.course.name,
                Subject: item.course.subject.name,
                Difficulty: getDifficultyLabel(item.course.difficulty),
            })
        },
        {
            id: 'access_info',
            label: 'Access Method',
            icon: <Package size={14} />,
            getData: (item: Registration) => ({
                Package: item.subscription.package,
            })
        }
    ];

    const rowActions = (reg: Registration): ActionItem[] => [
        { label: 'View Details', icon: <Eye size={14} />, onClick: () => handleViewDetails(reg) },
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="ADMIN / REGISTRATIONS"
                title={<>Course <span className="text-orange-600">Registrations</span></>}
                description="Manage student enrollments and track course access across the platform."
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
                            onClick={() => refetch()}
                            className="rounded-xl h-11 w-11 p-0 transition-all"
                        >
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
                /* LIST VIEW - Cards */
                <div className="grid grid-cols-1 gap-4">
                    {registrations.map((reg: Registration) => {
                        const statusStyle = STATUS_COLORS[reg.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.active;
                        const StatusIcon = statusStyle.icon;
                        const progressColor = reg.progress >= 75 ? 'bg-emerald-500' : reg.progress >= 50 ? 'bg-blue-500' : reg.progress >= 25 ? 'bg-amber-500' : 'bg-rose-500';

                        return (
                            <Card
                                key={reg.id}
                                className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 group hover:-translate-y-0.5 transition-all overflow-hidden"
                            >
                                <CardContent className="p-0">
                                    <div className="py-4 px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                        <User size={18} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-lg tracking-tight">{reg.user.name}</h3>
                                                        <p className="text-xs text-zinc-500">{reg.user.email}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Course</p>
                                                        <p className="font-bold text-sm">{reg.course.name}</p>
                                                        <p className="text-xs text-zinc-500">{reg.course.subject.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Package</p>
                                                        <div className="flex items-center gap-1">
                                                            <Package size={12} className="text-primary" />
                                                            <span className="text-sm font-medium">{reg.subscription.package}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Progress</p>
                                                        <div className="w-32">
                                                            <div className="flex justify-between text-[10px] mb-1">
                                                                <span className="font-medium">Progress</span>
                                                                <span className="font-bold">{reg.progress}%</span>
                                                            </div>
                                                            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
                                                                <div className={`${progressColor} h-1.5 rounded-full transition-all`} style={{ width: `${reg.progress}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Status</p>
                                                        <Badge className={`${statusStyle.bg} ${statusStyle.text} border-none gap-1`}>
                                                            <StatusIcon size={10} />
                                                            {statusStyle.label}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        Enrolled: {new Date(reg.enrolled_at).toLocaleDateString()}
                                                    </div>
                                                    {reg.completed_at && (
                                                        <div className="flex items-center gap-1">
                                                            <Award size={12} className="text-emerald-500" />
                                                            Completed: {new Date(reg.completed_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {reg.dropped_at && (
                                                        <div className="flex items-center gap-1">
                                                            <XCircle size={12} className="text-rose-500" />
                                                            Dropped: {new Date(reg.dropped_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <ActionsDropdown actions={rowActions(reg)} maxVisible={1} showLabels={false} className="rounded-xl" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {registrations.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <Users className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No registrations found</h3>
                            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search.</p>
                        </div>
                    )}

                    {pagination && (
                        <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} className="pt-4" />
                    )}
                </div>
            ) : (
                /* TABLE VIEW - Using DataTable */
                <div className="space-y-4">
                <DataTable
                    data={registrations}
                    isLoading={isLoading}
                    sortConfig={sortBy ? { sortBy, sortOrder } : undefined}
                    displayConfigs={displayConfigs}
                    renderActions={(reg) => <ActionsDropdown actions={rowActions(reg)} maxVisible={3} showLabels={false} />}
                    excludeColumns={['id', 'user', 'course', 'subscription', 'created_at', 'updated_at', 'completed_at', 'dropped_at', 'is_completed']}
                    dots={{
                        status: {
                            "active": 'emerald',
                            "completed": 'blue',
                            "dropped": 'rose'
                        }
                    }}
                    badges={{
                        difficulty: {
                            "beginner": 'emerald',
                            "intermediate": 'blue',
                            "advanced": 'amber'
                        }
                    }}
                    emptyTitle="No registrations found"
                    emptyDescription="No course registrations match your current filters."
                />
                {pagination && (
                    <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} />
                )}
                </div>
            )}

            {/* Registration Detail Modal */}
            <CustomDialog
                title="Registration Details"
                description="Complete information about this course registration"
                open={detailModalOpen}
                onOpenChange={setDetailModalOpen}
                contentWidth="max-w-2xl"
            >
                {selectedRegistration && (
                    <div className="space-y-6 py-4">
                        {/* Student Info */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                            <div className="flex items-center gap-2 mb-3">
                                <User size={16} className="text-primary" />
                                <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Student Information</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-zinc-400">Full Name</p>
                                    <p className="font-bold">{selectedRegistration.user.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-400">Email</p>
                                    <p className="font-mono text-sm">{selectedRegistration.user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Course Info */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen size={16} className="text-primary" />
                                <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Course Information</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-zinc-400">Course Name</p>
                                    <p className="font-bold">{selectedRegistration.course.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-400">Subject</p>
                                    <p>{selectedRegistration.course.subject.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-400">Difficulty</p>
                                    <Badge className="bg-zinc-100 text-zinc-600">{getDifficultyLabel(selectedRegistration.course.difficulty)}</Badge>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-400">Price</p>
                                    <p>{selectedRegistration.course.price ? `$${selectedRegistration.course.price}` : 'Subscription only'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Info */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Package size={16} className="text-primary" />
                                <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Access Method</h3>
                            </div>
                            <p className="font-bold">{selectedRegistration.subscription.package}</p>
                            <p className="text-xs text-zinc-500 mt-1">Subscription-based access</p>
                        </div>

                        {/* Status & Dates */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={16} className="text-primary" />
                                <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Timeline</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Enrolled</span>
                                    <span className="text-sm font-medium">{new Date(selectedRegistration.enrolled_at).toLocaleString()}</span>
                                </div>
                                {selectedRegistration.completed_at && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-emerald-600">Completed</span>
                                        <span className="text-sm font-medium">{new Date(selectedRegistration.completed_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {selectedRegistration.dropped_at && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-rose-600">Dropped</span>
                                        <span className="text-sm font-medium">{new Date(selectedRegistration.dropped_at).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CustomDialog>
        </div>
    );
}