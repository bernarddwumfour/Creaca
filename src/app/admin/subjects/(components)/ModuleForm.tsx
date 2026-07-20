'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Save } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Import your new CustomSelect
import { CustomSelect } from '../../../../../widgets/CustomSelect/CustomSelect';
import z from 'zod';
import { Badge } from '@/components/ui/badge';

const moduleSchema = z.object({
    title: z.string().min(2, "Title is required"),
    category: z.string().min(1, "Topic selection is required"),
    difficulty: z.string().min(1, "Level selection is required"),
    content: z.string().refine((val) => {
        try {
            JSON.parse(val);
            return true;
        } catch {
            return false;
        }
    }, "Invalid JSON format"),
});

// Mock options for the Selects
const TOPIC_OPTIONS = [
    { label: "Web Development", value: "Web Development" },
    { label: "Data Analysis", value: "Data Analysis" },
    { label: "Digital Marketing", value: "Digital Marketing" },
    { label: "Cybersecurity", value: "Cybersecurity" },
    { label: "Product Design", value: "Product Design" },
];

const DIFFICULTY_OPTIONS = [
    { label: "Beginner", value: "Beginner" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" },
    { label: "Expert", value: "Expert" },
];

export function ModuleForm({ type, initialData, onSuccess }: any) {
    const form = useForm<z.infer<typeof moduleSchema>>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            title: initialData?.title || "",
            category: initialData?.category || "",
            difficulty: initialData?.difficulty || "Intermediate",
            content: initialData?.content ? JSON.stringify(initialData.content, null, 2) : "{\n  \"sections\": []\n}",
        },
    });

    async function onSubmit(values: z.infer<typeof moduleSchema>) {
        const payload = { ...values, content: JSON.parse(values.content) };
        console.log("Submitting Module:", payload);
        onSuccess();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                {/* Title Input */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Module Title</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g., Eigenvectors and Eigenspaces"
                                    className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 bg-transparent text-sm font-bold"
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                {/* Selection Row */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Topic</FormLabel>
                                <FormControl>
                                    <CustomSelect
                                        options={TOPIC_OPTIONS}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select Topic"
                                        className="h-11"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Level</FormLabel>
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
                </div>

                {/* JSON Content Area */}
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <div className="flex justify-between items-center mb-1">
                                <FormLabel className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Module Content (JSON)</FormLabel>
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5 rounded-lg">Schema V2</Badge>
                            </div>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    className="min-h-[250px] font-mono text-[11px] p-4 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl resize-none focus:ring-primary/20 leading-relaxed"
                                    placeholder='{ "sections": [...] }'
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                {/* Action Button */}
                <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-orange-600 font-black uppercase tracking-[0.2em] text-[11px] transition-all rounded-xl text-white gap-2 shadow-lg shadow-primary/20 mt-2"
                >
                    {form.formState.isSubmitting ? (
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
