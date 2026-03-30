'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Save } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subjectSchema } from './schemas'; // adjust path
import api from '@/lib/axios';

export function SubjectForm({ type, initialData, onSuccess, subjectId }: any) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            title: initialData?.title || "",
            code: initialData?.code || "",
        },
    });

    async function onSubmit(values: any) {
        setIsLoading(true);
        try {
            if (type === 'CREATE') {
                await api.post('/admin/subjects', values);
            } else {
                await api.patch(`/admin/subjects/${subjectId}`, values);
            }
            onSuccess();
        } catch (error: any) {
            form.setError('root', { message: error.response?.data?.message || "Operation failed" });
        } finally {
            setIsLoading(false);
        }
    }

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
                    name="title"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Subject Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. Pure Mathematics" className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Subject Code</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="MATH-101" className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <Button disabled={isLoading} className="w-full h-12 bg-primary hover:bg-orange-600 font-bold transition-all rounded-xl text-white gap-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : (type === 'CREATE' ? <Plus size={18} /> : <Save size={18} />)}
                    {type === 'CREATE' ? 'Create Subject' : 'Save Changes'}
                </Button>
            </form>
        </Form>
    );
}