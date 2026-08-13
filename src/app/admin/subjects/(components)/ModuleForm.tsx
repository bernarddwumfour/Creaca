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
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { CustomSelect } from '../../../../../widgets/CustomSelect/CustomSelect';

const moduleSchema = z.object({
    name: z.string().min(2, "Module name is required"),
    course_id: z.string().min(1, "Course selection is required"),
    description: z.string().optional(),
    order: z.number().min(0, "Order must be 0 or greater"),
    passing_score: z.number().min(0).max(100, "Passing score must be between 0 and 100"),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface ModuleFormProps {
    type: 'CREATE' | 'UPDATE' | null;
    moduleId?: string;
    initialData?: Partial<ModuleFormData>;
    onSuccess: () => void;
}

export function ModuleForm({ type, moduleId, initialData, onSuccess }: ModuleFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const { data: coursesResponse, isLoading: coursesLoading } = useQuery({
        queryKey: [ENDPOINTS.COURSES.LIST_COURSES, 'all'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.LIST_COURSES, {
                params: { page_size: 100 }
            });
            return data;
        },
    });

    const courseOptions = (coursesResponse?.data?.results || []).map((course: any) => ({
        value: course.id,
        label: course.name,
    }));

    const form = useForm<ModuleFormData>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            name: initialData?.name || "",
            course_id: initialData?.course_id || "",
            description: initialData?.description || "",
            order: initialData?.order ?? 0,
            passing_score: initialData?.passing_score ?? 70,
        },
    });

    const invalidateModules = () => {
        queryClient.invalidateQueries({ queryKey: [ENDPOINTS.MODULES.LIST_MODULES] });
    };

    const onSubmit = async (values: ModuleFormData) => {
        setIsLoading(true);
        try {
            if (type === 'CREATE') {
                const response = await api.post(ENDPOINTS.MODULES.CREATE_MODULE, {
                    name: values.name,
                    description: values.description || "",
                    course: values.course_id,
                    order: values.order,
                    passing_score: values.passing_score,
                });
                toast.success(response.data?.message || "Module created successfully.");
            } else {
                const response = await api.patch(
                    ENDPOINTS.MODULES.UPDATE_MODULE.replace(':id', moduleId!),
                    {
                        name: values.name,
                        description: values.description || "",
                        order: values.order,
                        passing_score: values.passing_score,
                    }
                );
                toast.success(response.data?.message || "Module updated successfully.");
            }

            invalidateModules();
            onSuccess();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Operation failed. Please check your input and try again.";
            toast.error(errorMessage);
            form.setError('root', { message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Module Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g., Introduction to Quadratic Equations"
                                    className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 bg-transparent text-sm font-bold"
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="course_id"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Course</FormLabel>
                            <FormControl>
                                <CustomSelect
                                    options={courseOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={coursesLoading ? "Loading courses..." : "Select course"}
                                    className="h-11"
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
                            <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="What this module covers..."
                                    className="min-h-[100px] rounded-xl border-zinc-200 dark:border-zinc-800 bg-transparent text-sm resize-none focus:ring-primary/20"
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Order</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={field.value}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 bg-transparent text-sm font-bold"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="passing_score"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Passing Score %</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={field.value}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 bg-transparent text-sm font-bold"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />
                </div>

                <p className="text-[10px] text-zinc-400 leading-relaxed pt-1">
                    Lesson text, quizzes, and flashcards are AI-generated after the module is
                    created — manage content from the module's detail page.
                </p>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-primary hover:bg-orange-600 font-black uppercase tracking-[0.2em] text-[11px] transition-all rounded-xl text-white gap-2 shadow-lg shadow-primary/20 mt-2"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        type === 'CREATE' ? <Plus size={18} /> : <Save size={18} />
                    )}
                    {type === 'CREATE' ? 'Create Module' : 'Save Changes'}
                </Button>
            </form>
        </Form>
    );
}
