'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Save } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

const subjectSchema = z.object({
    name: z.string()
        .min(1, "Subject name is required")
        .max(200, "Subject name must be less than 200 characters"),
    description: z.string()
        .max(1000, "Description must be less than 1000 characters"),
    status: z.enum(['active', 'inactive', 'draft']),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
    type: 'CREATE' | 'UPDATE';
    subjectId?: string;
    initialData?: {
        name?: string;
        description?: string;
        status?: 'active' | 'inactive' | 'draft';
    } | null;
    onSuccess: () => void;
}

export function SubjectForm({ type, initialData, onSuccess, subjectId }: SubjectFormProps) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SubjectFormData>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            status: initialData?.status ?? "active",
        },
    });

    const invalidateSubjects = () => {
        queryClient.invalidateQueries({ queryKey: [ENDPOINTS.SUBJECTS.LIST_SUBJECTS] });
    };

    const onSubmit = async (values: SubjectFormData) => {
        setIsLoading(true);
        try {
            if (type === 'CREATE') {
                const response = await api.post(ENDPOINTS.SUBJECTS.CREATE_SUBJECT, {
                    name: values.name,
                    description: values.description,
                    status: values.status,
                });
                toast.success(response.data?.message || "Subject created successfully.");
            } else {
                const response = await api.patch(
                    ENDPOINTS.SUBJECTS.UPDATE_SUBJECT.replace(':id', subjectId!),
                    {
                        name: values.name,
                        description: values.description,
                        status: values.status,
                    }
                );
                toast.success(response.data?.message || "Subject updated successfully.");
            }

            invalidateSubjects();
            onSuccess();
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Operation failed. Please check your input and try again.";
            toast.error(errorMessage);
            form.setError('root', { message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                {form.formState.errors.root && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20 text-center">
                        {form.formState.errors.root.message}
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                Subject Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g., Web Development"
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
                    name="description"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                Description
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Provide a detailed description of this subject..."
                                    className="min-h-[100px] border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium resize-y"
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                Status
                            </FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isLoading}
                            >
                                <FormControl>
                                    <SelectTrigger className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className='z-[101]'>
                                    <SelectItem value="active" className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Active
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="inactive" className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                            Inactive
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="draft" className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            Draft
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-[10px]" />
                            <p className="text-[10px] text-zinc-400 mt-1">
                                Active subjects are visible to students. Inactive subjects are hidden. Draft subjects are only visible to admins.
                            </p>
                        </FormItem>
                    )}
                />

                <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-orange-600 font-bold transition-all rounded-xl text-white gap-2"
                >
                    {isLoading
                        ? <Loader2 className="animate-spin" size={18} />
                        : (type === 'CREATE' ? <Plus size={18} /> : <Save size={18} />)
                    }
                    {type === 'CREATE' ? 'Create Subject' : 'Save Changes'}
                </Button>
            </form>
        </Form>
    );
}
