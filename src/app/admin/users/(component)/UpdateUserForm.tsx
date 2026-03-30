'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Fingerprint } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'sonner';
import z from 'zod';
import { CustomSelect } from '../../../../../widgets/CustomSelect/CustomSelect';


const ROLE_OPTIONS = [
    { label: "Administrator", value: "ADMIN" },
    { label: "Staff Member", value: "STAFF" },
    { label: "Standard User", value: "USER" },
];

interface Props {
    user: any;
    onSuccess: () => void;
}

const updateUserSchema = z.object({
    first_name: z.string().min(2, "First name required"),
    last_name: z.string().min(2, "Last name required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    role: z.string().min(1, "Please select a role"),
});

export function UpdateUserForm({ user, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof updateUserSchema>>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            username: user?.username || "",
            role: user?.role || "USER"
        },
    });

    async function onSubmit(values: z.infer<typeof updateUserSchema>) {
        setIsLoading(true);
        try {
            const endpoint = ENDPOINTS.ADMIN.UPDATE_USER.replace(":id", user.id);
            await api.post(endpoint, values);

            toast.success(`Identity [${values.username}] successfully reconfigured.`);
            onSuccess();
        } catch (error: any) {
            toast.error("Registry update failed.");
            form.setError('root', { message: "Critical: Failed to sync with identity provider" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                {/* Identity Context Badge */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-600/10 flex items-center justify-center text-orange-600">
                        <Fingerprint size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-0.5">System UID</p>
                        <p className="text-xs font-mono font-bold text-slate-900 dark:text-white tracking-tight italic">
                            {user.id}
                        </p>
                    </div>
                </div>

                {form.formState.errors.root && (
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 text-center italic">
                        {form.formState.errors.root.message}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">First Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="h-11 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm bg-transparent" />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Last Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="h-11 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm bg-transparent" />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Username</FormLabel>
                            <FormControl>
                                <Input {...field} className="h-11 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm bg-transparent" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Clearance Level</FormLabel>
                            <FormControl>
                                <CustomSelect
                                    options={ROLE_OPTIONS}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select Role"
                                    className="h-11"
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white font-black uppercase tracking-[0.2em] text-[11px] transition-all rounded-xl gap-2 mt-2 shadow-lg shadow-orange-600/5"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <Save size={18} />
                    )}
                    Save Changes
                </Button>
            </form>
        </Form>
    );
}