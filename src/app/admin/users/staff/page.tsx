'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
    Shield, Fingerprint, ShieldCheck, RefreshCcw,
    Pencil, UserCog, Power, PowerOff,
    Users, CheckCircle2, XCircle,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { ENDPOINTS } from '@/lib/endpoints';
import api from '@/lib/axios';
import { apiMessage } from '@/lib/api-message';
import { DataTable } from '../../../../../widgets/Customtable/DataTable';
import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';
import { UpdateUserForm } from '../(component)/UpdateUserForm';
import { CustomFilterFromUrl, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, type SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { CustomPagination, type PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { PageHeader } from '@/widgets/page-header/PageHeader';

interface SystemUser {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    date_joined: string;
    last_login: string | null;
}

interface UsersResponse {
    results: SystemUser[];
    pagination: PaginationMeta;
}

const ACTIVE_OPTIONS = [
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
];

const SORT_OPTIONS = [
    { value: 'created_at', label: 'Joined' },
    { value: 'email', label: 'Email' },
    { value: 'is_active', label: 'Status' },
    { value: 'last_login', label: 'Last Login' },
];

// Hoisted to module scope — see admin/subjects/courses/page.tsx for why.
const FILTERS: FilterConfig = {
    fields: [{ name: 'is_active', type: 'select', placeholder: 'Status', options: ACTIVE_OPTIONS }],
    searchPlaceholder: 'Search staff...',
};

const SORTS: SortConfig = {
    options: SORT_OPTIONS,
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
};

export default function StaffManagement() {
    return (
        <Suspense fallback={<TableSkeleton />}>
            <StaffManagementInner />
        </Suspense>
    );
}

function StaffManagementInner() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [activeModal, setActiveModal] = useState<'CREATE' | 'UPDATE' | 'ROLE' | null>(null);
    const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

    const pageSize = 10;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('is_active') || '';
    const sortBy = searchParams.get('sort_by') || '';
    const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';

    const setPage = (nextPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(nextPage));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const { data: response, isLoading: isFetching, refetch } = useQuery<UsersResponse>({
        queryKey: [ENDPOINTS.ADMIN.USERS, 'STAFF', page, pageSize, search, isActive, sortBy, sortOrder],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.ADMIN.USERS, {
                params: {
                    role: 'STAFF',
                    page, page_size: pageSize,
                    search: search || undefined,
                    is_active: isActive || undefined,
                    sort_by: sortBy || undefined,
                    sort_order: sortBy ? sortOrder : undefined,
                }
            });
            return data?.data;
        },
    });

    const users = response?.results || [];
    const pagination = response?.pagination;

    const invalidateRegistry = () => {
        queryClient.invalidateQueries({ queryKey: [ENDPOINTS.ADMIN.USERS] });
    };

    const handleToggleStatus = async (user: SystemUser) => {
        const action = !user.is_active ? 'activate' : 'deactivate';
        const endpoint = !user.is_active
            ? ENDPOINTS.ADMIN.ACTIVATE_USER.replace(":id", user.id)
            : ENDPOINTS.ADMIN.DEACTIVATE_USER.replace(":id", user.id);

        try {
            await api.post(endpoint);
            toast.success(`Identity ${user.username} has been ${action}d successfully.`);
            invalidateRegistry();
        } catch (error: any) {
            toast.error(apiMessage(error, `Critical failure during ${action} sequence.`));
        }
    };

    const handleChangeRole = async (newRole: string) => {
        if (!selectedUser) return;
        try {
            await api.post(ENDPOINTS.ADMIN.CHANGE_ROLE.replace(":id", selectedUser.id), { role: newRole });
            toast.success(`Authorization level for ${selectedUser.username} elevated to ${newRole}.`);
            invalidateRegistry();
            closeModals();
        } catch (error: any) {
            toast.error(apiMessage(error, "Failed to reconfigure user permissions."));
        }
    };

    const handleBulkStatus = async (items: SystemUser[], action: "activate" | "deactivate") => {
        const ids = items.map(i => i.id);
        try {
            await api.post(ENDPOINTS.ADMIN.BULK_STATUS_UPDATE, { user_ids: ids, action });
            toast.success(`Bulk ${action} sequence completed for ${ids.length} identities.`);
            invalidateRegistry();
        } catch (error: any) {
            toast.error(apiMessage(error, "Bulk status transition failed."));
        }
    };

    const handleBulkRole = async (items: SystemUser[], newRole: string) => {
        const ids = items.map(i => i.id);
        try {
            await api.post(ENDPOINTS.ADMIN.BULK_CHANGE_ROLE, { user_ids: ids, role: newRole });
            toast.success(`Clearance level updated to ${newRole} for ${ids.length} accounts.`);
            invalidateRegistry();
        } catch (error: any) {
            toast.error(apiMessage(error, "Bulk role reconfiguration encountered an error."));
        }
    };

    const closeModals = () => {
        setActiveModal(null);
        setSelectedUser(null);
    };

    const rowActions = (user: SystemUser): ActionItem[] => [
        {
            label: 'Update Profile',
            icon: <Pencil size={14} />,
            onClick: () => { setSelectedUser(user); setActiveModal('UPDATE'); }
        },
        {
            label: 'Change Role',
            icon: <UserCog size={14} />,
            onClick: () => { setSelectedUser(user); setActiveModal('ROLE'); }
        },
        {
            label: user.is_active ? 'Deactivate' : 'Activate',
            icon: user.is_active ? <PowerOff size={14} /> : <Power size={14} />,
            variant: user.is_active ? 'destructive' : 'default',
            onClick: () => handleToggleStatus(user)
        }
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="ACCESS REGISTRY / STAFF"
                title={<>Staff <span className="text-orange-600">Control</span></>}
                actions={
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="rounded-xl h-11 w-11 p-0 transition-all"
                    >
                        <RefreshCcw size={18} className={isFetching ? "animate-spin" : ""} />
                    </Button>
                }
            />

            {/* Filter + Sort Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-zinc-900/80 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <CustomFilterFromUrl config={FILTERS} />
                <CustomSortFromUrl config={SORTS} />
            </div>

            {isFetching ? (
                <TableSkeleton />
            ) : (
                <div className="space-y-4">
                    <DataTable
                        data={users}
                        isLoading={isFetching}
                        sortConfig={sortBy ? { sortBy, sortOrder } : undefined}
                        excludeColumns={['id']}
                        dots={{ is_active: { "true": 'emerald', "false": 'rose' } }}
                        badges={{ role: { ADMIN: 'blue', STAFF: 'violet', USER: 'zinc' } }}
                        renderActions={(user) => <ActionsDropdown actions={rowActions(user)} maxVisible={3} showLabels={false} />}
                        bulkActions={[
                            {
                                label: 'Set as Admin',
                                icon: <ShieldCheck size={14} />,
                                onClick: (items: SystemUser[]) => handleBulkRole(items, "ADMIN")
                            },
                            {
                                label: 'Set as Staff',
                                icon: <Users size={14} />,
                                onClick: (items: SystemUser[]) => handleBulkRole(items, "STAFF")
                            },
                            {
                                label: 'Set as User',
                                icon: <Users size={14} />,
                                onClick: (items: SystemUser[]) => handleBulkRole(items, "USER")
                            },
                            {
                                label: 'Activate All',
                                icon: <CheckCircle2 size={14} />,
                                onClick: (items: SystemUser[]) => handleBulkStatus(items, "activate")
                            },
                            {
                                label: 'Deactivate All',
                                icon: <XCircle size={14} />,
                                variant: 'destructive',
                                onClick: (items: SystemUser[]) => handleBulkStatus(items, "deactivate")
                            }
                        ]}
                        displayConfigs={[{
                            id: 'identity',
                            label: 'Profile Summary',
                            icon: <Fingerprint size={14} />,
                            getData: (u: SystemUser) => ({
                                Username: u.username,
                                Full_Name: `${u.first_name} ${u.last_name}`,
                                Role: u.role,
                                Status: u.is_active ? "Active" : "Inactive"
                            })
                        }]}
                    />
                    {pagination && (
                        <CustomPagination pagination={pagination} onPageChange={setPage} showLimitSelector={false} />
                    )}
                </div>
            )}

            {/* Role Change Dialog */}
            <CustomDialog
                title="Change User Role"
                description={`Modify administrative clearance for ${selectedUser?.username}.`}
                open={activeModal === 'ROLE'}
                onOpenChange={closeModals}
            >
                <div className="grid grid-cols-1 gap-2 py-4">
                    {['ADMIN', 'STAFF', 'USER'].map((r) => (
                        <Button
                            key={r}
                            variant={selectedUser?.role === r ? "default" : "outline"}
                            className="justify-start font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl"
                            onClick={() => handleChangeRole(r)}
                        >
                            <Shield className="mr-3 text-orange-600" size={16} />
                            Set as {r}
                        </Button>
                    ))}
                </div>
            </CustomDialog>

            <CustomDialog
                title="Update User"
                description="Modify administrative records and access permissions."
                open={activeModal === 'UPDATE'}
                onOpenChange={closeModals}
            >
                {selectedUser && (
                    <UpdateUserForm
                        user={selectedUser}
                        onSuccess={() => {
                            invalidateRegistry();
                            closeModals();
                        }}
                    />
                )}
            </CustomDialog>
        </div>
    );
}
