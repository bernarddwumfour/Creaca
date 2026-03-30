'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { courseSchema } from './schemas';
import api from '@/lib/axios';
import z from 'zod';

// Component Import
import { CustomSelect } from '../../../../../widgets/CustomSelect/CustomSelect';

const DIFFICULTY_OPTIONS = [
    { label: "Beginner", value: "Beginner" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" },
    { label: "Expert", value: "Expert" },
];

export function CourseForm({ subjectId, subjectTitle, onSuccess }: any) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof courseSchema>>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: "",
            difficulty: "Beginner"
        },
    });

    async function onSubmit(values: z.infer<typeof courseSchema>) {
        setIsLoading(true);
        try {
            await api.post('/admin/courses', { ...values, subjectId });
            onSuccess();
        } catch (error: any) {
            form.setError('root', { message: "Failed to deploy course" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                {/* Context Badge */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                    <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-0.5">Deploying To</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{subjectTitle}</p>
                </div>

                {form.formState.errors.root && (
                    <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest border border-destructive/20 text-center italic">
                        {form.formState.errors.root.message}
                    </div>
                )}

                {/* Course Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Course Title</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. Linear Algebra II"
                                    className="h-11 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/20 rounded-xl font-bold text-sm bg-transparent"
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                {/* Difficulty Selection */}
                <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Difficulty</FormLabel>
                            <FormControl>
                                <CustomSelect
                                    options={DIFFICULTY_OPTIONS}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select Level"
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
                    className="w-full h-11 bg-primary hover:bg-orange-600 font-black uppercase tracking-[0.2em] text-[11px] transition-all rounded-xl text-white gap-2 shadow-lg shadow-primary/20 mt-2"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <PlusCircle size={18} />
                    )}
                    Create Course
                </Button>
            </form>
        </Form>
    );
}