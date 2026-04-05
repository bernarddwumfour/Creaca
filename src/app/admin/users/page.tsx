// 'use client';

// import {
//     Mail, Trash2, Download, Lock, User, HardDrive,
//     FlaskConical, Binary, Sigma, Layers, Terminal, Activity
// } from 'lucide-react';
// import { DataTable } from '../../../../widgets/Customtable/DataTable';

// export default function RegistryTestPage() {
//     const TEST_REGISTRY = [
//         { id: "USR-001", name: "Bernard Nyanteh", status: "Active", role: "Super Admin", focus: "Neural Networks", access: "Full" },
//         { id: "USR-002", name: "Alice Dupont", status: "Idle", role: "Student", focus: "Linear Algebra", access: "Limited" },
//         { id: "USR-003", name: "Carlos Mendez", status: "Flagged", role: "Tutor", focus: "Calculus III", access: "Full" },
//         { id: "USR-004", name: "Kofi Mensah", status: "Banned", role: "Student", focus: "Data Structures", access: "None" },
//         { id: "USR-005", name: "Sarah Chen", status: "Active", role: "Faculty", focus: "Quantum Computing", access: "Full" },
//     ];

//     const displayConfigs = [
//         {
//             id: 'profile',
//             label: 'User Profile',
//             icon: <User size={14} />,
//             getData: (item: any) => ({
//                 Name: item.name,
//                 Current_Role: item.role,
//                 Department: "Engineering"
//             }),
//             excludeKeys: ['Name']
//         },
//         {
//             id: 'sys_logs',
//             label: 'System Access',
//             icon: <Terminal size={14} />,
//             getData: (item: any) => ({
//                 System_ID: item.id,
//                 Access_Token: "JWT_SECURE_v5",
//                 Last_Login: new Date().toLocaleTimeString()
//             })
//         }
//     ];

//     const actions = [
//         { label: 'Send Mail', icon: <Mail size={14} />, onClick: (i: any) => console.log(i) },
//         { label: 'Purge', icon: <Trash2 size={14} />, variant: 'destructive' as const, onClick: (i: any) => alert("Purged") },
//     ];

//     const bulkActions = [
//         { label: 'Download All', icon: <Download size={14} />, onClick: (items: any[]) => console.log(items) },
//         { label: 'Lock Accounts', icon: <Lock size={14} />, variant: 'destructive' as const, onClick: (items: any[]) => console.log(items) }
//     ];

//     return (
//         <div className="space-y-8 ">
//             <header className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-6">
//                 <div className="space-y-1">
//                     <h2 className="text-[10px] font-black uppercase text-orange-600 tracking-[0.4em]">System Registry</h2>
//                     <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white font-mono uppercase">
//                         Registry <span className="text-orange-600">v6.0</span>
//                     </h1>
//                 </div>
//                 <div className="text-right hidden md:block">
//                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</p>
//                     <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
//                         <Activity size={14} /> LIVE_SYNC
//                     </div>
//                 </div>
//             </header>

//             <DataTable
//                 data={TEST_REGISTRY}
//                 displayConfigs={displayConfigs}
//                 actions={actions}
//                 bulkActions={bulkActions}
//                 excludeColumns={['id']}
//                 emptyTitle='No data'
//                 emptyDescription='No data for users '

//                 dots={{
//                     status: {
//                         Active: 'emerald',
//                         Idle: 'zinc',
//                         Flagged: 'orange',
//                         Banned: 'rose'
//                     }
//                 }}

//                 badges={{
//                     role: {
//                         "Super Admin": 'blue',
//                         "Faculty": 'violet',
//                         "Tutor": 'orange',
//                         "Student": 'zinc'
//                     },
//                     access: {
//                         "Full": 'emerald',
//                         "Limited": 'amber',
//                         "None": 'rose'
//                     }
//                 }}

//                 icons={{
//                     focus: {
//                         "Neural Networks": <Layers size={14} className="text-orange-500" />,
//                         "Quantum Computing": <FlaskConical size={14} className="text-violet-500" />,
//                         "Calculus III": <Sigma size={14} className="text-blue-500" />,
//                         "Linear Algebra": <Binary size={14} className="text-zinc-500" />,
//                         "Data Structures": <HardDrive size={14} className="text-emerald-500" />
//                     }
//                 }}

//                 links={{
//                     name: (user) => `/registry/users/${user.id.toLowerCase()}`,
//                     focus: (user) => `/curriculum/${user.focus.toLowerCase().replace(/ /g, '-')}`
//                 }}
//             />
//         </div>
//     );
// }
'use client';

import React, { useState } from 'react';
import {
    UserPlus, Search, Shield, Trash2, Lock,
    Fingerprint, ShieldCheck, RefreshCcw,
    Pencil, UserCheck, Activity, Power, PowerOff,
    UserCog, CheckCircle2, XCircle, Users,
    Loader2
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ENDPOINTS } from '@/lib/endpoints';
import api from '@/lib/axios';

// Internal Widgets
import { DataTable } from '../../../../widgets/Customtable/DataTable';
import { CustomDialog } from '../../../../widgets/CustomDialog/CustomDialog';
import { UpdateUserForm } from './(component)/UpdateUserForm';

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

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [activeModal, setActiveModal] = useState<'CREATE' | 'UPDATE' | 'ROLE' | null>(null);
    const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

    const { data: users, isLoading: isFetching, refetch } = useQuery({
        queryKey: [ENDPOINTS.ADMIN.USERS || 'users'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.ADMIN.USERS || '/users');
            return data?.data || data;
        },
    });

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
        } catch (error) {
            toast.error(`Critical failure during ${action} sequence.`);
        }
    };

    const handleChangeRole = async (role: string) => {
        if (!selectedUser) return;
        try {
            await api.post(ENDPOINTS.ADMIN.CHANGE_ROLE.replace(":id", selectedUser.id), { role });
            toast.success(`Authorization level for ${selectedUser.username} elevated to ${role}.`);
            invalidateRegistry();
            closeModals();
        } catch (error) {
            toast.error("Failed to reconfigure user permissions.");
        }
    };

    const handleBulkStatus = async (items: SystemUser[], action: "activate" | "deactivate") => {
        const ids = items.map(i => i.id);
        try {
            await api.post(ENDPOINTS.ADMIN.BULK_STATUS_UPDATE, { user_ids: ids, action });
            toast.success(`Bulk ${action} sequence completed for ${ids.length} identities.`);
            invalidateRegistry();
        } catch (error) {
            toast.error("Bulk status transition failed.");
        }
    };

    const handleBulkRole = async (items: SystemUser[], role: string) => {
        const ids = items.map(i => i.id);
        try {
            await api.post(ENDPOINTS.ADMIN.BULK_CHANGE_ROLE, { user_ids: ids, role });
            toast.success(`Clearance level updated to ${role} for ${ids.length} accounts.`);
            invalidateRegistry();
        } catch (error) {
            toast.error("Bulk role reconfiguration encountered an error.");
        }
    };

    const closeModals = () => {
        setActiveModal(null);
        setSelectedUser(null);
    };

    if (isFetching) return <div className='h-full min-h-[300px] w-full flex items-center justify-center'><Loader2 className='animate-spin 1-12 h-12 m-auto text-primary' /></div>;

    return (
        <div className="space-y-8">
            {/* Header - New Theme Style */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">
                        ACCESS REGISTRY
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                        Identity <span className="text-orange-600">Control</span>
                    </h1>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="rounded-xl h-11 w-11 p-0 transition-all"
                    >
                        <RefreshCcw size={18} className={isFetching ? "animate-spin" : ""} />
                    </Button>
                    {/* <Button
                        onClick={() => setActiveModal('CREATE')}
                        className="rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-6 text-[10px] transition-all"
                    >
                        <UserPlus size={18} className="mr-2" /> Provision User
                    </Button> */}
                </div>
            </div>

            {/* DataTable - Now using new theme */}
            <DataTable
                data={users || []}
                excludeColumns={['id', "avatar_config", "phone_number",]}
                dots={{ is_active: { "true": 'emerald', "false": 'rose' } }}
                badges={{ role: { ADMIN: 'blue', STAFF: 'violet', USER: 'zinc' }, email_verified: { "true": 'emerald', "false": 'rose' } }}

                actions={[
                    {
                        label: 'Update Profile',
                        icon: <Pencil size={14} />,
                        onClick: (u) => { setSelectedUser(u); setActiveModal('UPDATE'); }
                    },
                    {
                        label: 'Change Role',
                        icon: <UserCog size={14} />,
                        onClick: (u) => { setSelectedUser(u); setActiveModal('ROLE'); }
                    },
                    {
                        label: (u: SystemUser) => u.is_active ? 'Deactivate' : 'Activate',
                        icon: (u: SystemUser) => u.is_active ? <PowerOff size={14} /> : <Power size={14} />,
                        variant: (u: SystemUser) => u.is_active ? 'destructive' : 'default',
                        onClick: (u) => handleToggleStatus(u)
                    }
                ]}

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

            {/* Role Change Dialog */}
            <CustomDialog
                title="Change User Role"
                description={`Modify administrative clearance for ${selectedUser?.username}.`}
                open={activeModal === 'ROLE'}
                onOpenChange={closeModals}
            >
                <div className="grid grid-cols-1 gap-2 py-4">
                    {['ADMIN', 'STAFF', 'USER'].map((role) => (
                        <Button
                            key={role}
                            variant={selectedUser?.role === role ? "default" : "outline"}
                            className="justify-start font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl"
                            onClick={() => handleChangeRole(role)}
                        >
                            <Shield className="mr-3 text-orange-600" size={16} />
                            Set as {role}
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