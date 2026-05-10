'use client';

import React, { useState } from 'react';
import {
    Users,
    Search,
    MoreHorizontal,
    Eye,
    RefreshCw,
    Loader2,
    Calendar,
    User,
    BookOpen,
    Package,
    CheckCircle,
    XCircle,
    Award,
    Clock,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    LayoutList,
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
import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';
import { DataTable } from '../../../../../widgets/Customtable/DataTable';
import { ToggleGroup, ToggleGroupItem } from '../../../../../widgets/ToggleGroup/ToggleGroup';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

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
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

    const { data: response, isLoading, refetch } = useQuery<RegistrationsResponse>({
        queryKey: ['admin-registrations', page, pageSize],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.ADMIN_LIST_REGISTRATIONS, {
                params: { page, page_size: pageSize }
            });
            return data;
        },
    });

    const registrations = response?.data?.results || [];
    const pagination = response?.data?.pagination;

    const filteredRegistrations = React.useMemo(() => {
        if (!registrations.length) return [];
        if (!searchQuery) return registrations;

        const query = searchQuery.toLowerCase();
        return registrations.filter((reg: Registration) =>
            reg.user?.name?.toLowerCase().includes(query) ||
            reg.user?.email?.toLowerCase().includes(query) ||
            reg.course?.name?.toLowerCase().includes(query)
        );
    }, [registrations, searchQuery]);

    const handleExport = async (items: Registration[]) => {
        if (items.length === 0) {
            toast.warning("No registrations selected for export.");
            return;
        }

        try {
            const exportData = items.map(reg => ({
                ID: reg.id,
                Student_Name: reg.user.name,
                Student_Email: reg.user.email,
                Course: reg.course.name,
                Subject: reg.course.subject.name,
                Difficulty: reg.course.difficulty,
                Status: reg.status,
                Progress: `${reg.progress}%`,
                Package: reg.subscription.package,
                Enrolled_At: reg.enrolled_at,
                Completed_At: reg.completed_at,
                Dropped_At: reg.dropped_at
            }));

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `registrations_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`${items.length} registration(s) exported successfully.`);
        } catch (error: any) {
            toast.error(error.message || "Failed to export registrations.");
        }
    };

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

    // Table actions
    const actions = [
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: handleViewDetails
        }
    ];

    // Bulk actions
    const bulkActions = [
        {
            label: 'Export Selected',
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
                        ADMIN / REGISTRATIONS
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                        Course <span className="text-orange-600">Registrations</span>
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-tight text-sm">
                        Manage student enrollments and track course access across the platform.
                    </p>
                </div>

                <div className="flex gap-3">
                    {/* View Toggle */}
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
                        onClick={() => refetch()}
                        className="rounded-xl h-11 w-11 p-0 transition-all"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center bg-white dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
                    <Input
                        placeholder="Search by student name, email, or course..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 font-medium placeholder:text-zinc-400"
                    />
                </div>
                <div className="hidden md:flex items-center gap-2 pr-2">
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        By Status
                    </Button>
                    <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-primary transition-colors">
                        By Course
                    </Button>
                </div>
            </div>

            {/* View Renderer */}
            {viewMode === 'list' ? (
                /* LIST VIEW - Cards */
                <div className="grid grid-cols-1 gap-4">
                    {filteredRegistrations.map((reg: Registration) => {
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
                                                            Registration Controls
                                                        </DropdownMenuLabel>

                                                        <DropdownMenuItem
                                                            onSelect={() => handleViewDetails(reg)}
                                                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary font-bold text-xs"
                                                        >
                                                            <Eye size={16} /> View Details
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {filteredRegistrations.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <Users className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No registrations found</h3>
                            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search.</p>
                        </div>
                    )}

                    {/* Pagination Info */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="flex justify-between items-center pt-4">
                            <div className="text-sm text-zinc-500">
                                Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to{' '}
                                {Math.min(pagination.current_page * pagination.page_size, pagination.total)} of {pagination.total} registrations
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.has_previous}
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!pagination.has_next}
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* TABLE VIEW - Using DataTable */
                <DataTable
                    data={filteredRegistrations}
                    displayConfigs={displayConfigs}
                    actions={actions}
                    bulkActions={bulkActions}
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