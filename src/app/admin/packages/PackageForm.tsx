'use client';

import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Save, Package as PackageIcon, Zap, Award, Download, Video, Mic, Brain, Star, TrendingUp } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { CustomSelect } from '../../../../widgets/CustomSelect/CustomSelect';

// ✅ No .default() or .optional() — all defaults handled by useForm defaultValues
const packageSchema = z.object({
    name: z.string()
        .min(1, "Package name is required")
        .max(200, "Name must be less than 200 characters"),
    description: z.string()
        .max(2000, "Description must be less than 2000 characters"),
    price: z.number()
        .min(0, "Price cannot be negative"),
    original_price: z.number()
        .nullable(),
    currency: z.string()
        .length(3, "Currency must be 3 characters"),
    billing_cycle: z.enum(['monthly', 'yearly', 'quarterly', 'lifetime']),
    max_difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    status: z.enum(['active', 'inactive', 'draft']),
    trial_days: z.number()
        .int()
        .min(0, "Trial days cannot be negative"),
    is_unlimited: z.boolean(),
    max_courses_at_level: z.number()
        .int()
        .positive("Must be positive")
        .nullable(),
    max_students: z.number()
        .int()
        .positive("Must be positive")
        .nullable(),
    includes_certificate: z.boolean(),
    can_download_materials: z.boolean(),
    includes_video_lessons: z.boolean(),
    video_quality: z.enum(['sd', 'hd', 'fhd']),
    text_to_audio: z.boolean(),
    audio_to_text: z.boolean(),
    audio_minutes_per_month: z.number()
        .int()
        .min(0, "Minutes cannot be negative"),
    ai_credits_per_month: z.number()
        .int()
        .min(0, "Credits cannot be negative"),
    ai_question_generation: z.boolean(),
    ai_explanations: z.boolean(),
    is_featured: z.boolean(),
    badge_text: z.string()
        .max(50, "Badge text too long"),
    display_order: z.number()
        .int()
        .min(0, "Display order must be positive"),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
    type: 'CREATE' | 'UPDATE' | null;
    packageId?: string;
    initialData?: Partial<PackageFormData> | null;
    onSuccess: () => void;
}

const BILLING_CYCLE_OPTIONS = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'lifetime', label: 'Lifetime' },
];

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' },
];

const VIDEO_QUALITY_OPTIONS = [
    { value: 'sd', label: 'SD (480p)' },
    { value: 'hd', label: 'HD (720p)' },
    { value: 'fhd', label: 'Full HD (1080p)' },
];

const CURRENCY_OPTIONS = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'GHS', label: 'GHS - Ghana Cedi' },
    { value: 'NGN', label: 'NGN - Nigerian Naira' },
];

const MAX_DIFFICULTY_OPTIONS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
];

const FORM_SECTION_OPTIONS = [
    { value: 'basic', label: 'Basic' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'features', label: 'Features' },
    { value: 'ai', label: 'AI & Display' },
];

export function PackageForm({ type, initialData, onSuccess, packageId }: PackageFormProps) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');

    const form = useForm<PackageFormData>({
        resolver: zodResolver(packageSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            price: initialData?.price ?? 0,
            original_price: initialData?.original_price ?? null,
            currency: initialData?.currency ?? "USD",
            billing_cycle: initialData?.billing_cycle ?? "monthly",
            status: initialData?.status ?? "active",
            trial_days: initialData?.trial_days ?? 0,
            is_unlimited: initialData?.is_unlimited ?? false,
            max_courses_at_level: initialData?.max_courses_at_level ?? null,
            max_students: initialData?.max_students ?? null,
            max_difficulty: initialData?.max_difficulty ?? "beginner",
            includes_certificate: initialData?.includes_certificate ?? false,
            can_download_materials: initialData?.can_download_materials ?? false,
            includes_video_lessons: initialData?.includes_video_lessons ?? false,
            video_quality: initialData?.video_quality ?? "hd",
            text_to_audio: initialData?.text_to_audio ?? false,
            audio_to_text: initialData?.audio_to_text ?? false,
            audio_minutes_per_month: initialData?.audio_minutes_per_month ?? 0,
            ai_credits_per_month: initialData?.ai_credits_per_month ?? 0,
            ai_question_generation: initialData?.ai_question_generation ?? false,
            ai_explanations: initialData?.ai_explanations ?? false,
            is_featured: initialData?.is_featured ?? false,
            badge_text: initialData?.badge_text ?? "",
            display_order: initialData?.display_order ?? 0,
        },
    });

    const isUnlimited = useWatch({ control: form.control, name: 'is_unlimited' });
    const selectedDifficulty = useWatch({ control: form.control, name: 'max_difficulty' });

    const invalidatePackages = () => {
        queryClient.invalidateQueries({ queryKey: [ENDPOINTS.PACKAGES.LIST_PACKAGES] });
    };

    const onSubmit = async (values: PackageFormData) => {
        setIsLoading(true);
        try {
            if (type === 'CREATE') {
                const response = await api.post(ENDPOINTS.PACKAGES.CREATE_PACKAGE, values);
                toast.success(response.data?.message || "Package created successfully.");
            } else {
                const response = await api.patch(
                    ENDPOINTS.PACKAGES.UPDATE_PACKAGE.replace(':id', packageId!),
                    values
                );
                toast.success(response.data?.message || "Package updated successfully.");
            }

            invalidatePackages();
            onSuccess();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Operation failed. Please check your input and try again.";
            toast.error(errorMessage);
            form.setError('root', { message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    // Get difficulty display text
    const getDifficultyLabel = (difficulty: string) => {
        const map: Record<string, string> = {
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced',
            expert: 'Expert',
        };
        return map[difficulty] || difficulty;
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                {form.formState.errors.root && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20 text-center">
                        {form.formState.errors.root.message}
                    </div>
                )}

                <CustomSelect
                    options={FORM_SECTION_OPTIONS}
                    value={activeSection}
                    onChange={setActiveSection}
                    placeholder="Select section"
                    className="h-12 mb-6"
                />

                {activeSection === 'basic' && (
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                        Package Name <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g., Pro Plan" className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium" disabled={isLoading} />
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
                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Describe what this package includes..." className="min-h-[100px] border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium resize-y" disabled={isLoading} />
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
                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Status</FormLabel>
                                    <FormControl>
                                        <CustomSelect options={STATUS_OPTIONS} value={field.value} onChange={field.onChange} placeholder="Select status" className="h-12" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="badge_text"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Badge Text (Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g., Most Popular, Best Value" className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium" disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        {/* Max Difficulty Selection */}
                        <FormField
                            control={form.control}
                            name="max_difficulty"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                        Maximum Difficulty Level <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <CustomSelect
                                            options={MAX_DIFFICULTY_OPTIONS}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select maximum difficulty"
                                            className="h-12"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                    <p className="text-[10px] text-zinc-400 mt-1">
                                        Courses below this level are unlimited. At {getDifficultyLabel(field.value)} level, the course limit below applies.
                                    </p>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="display_order"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Display Order</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(parseInt(e.target.value))}
                                            className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {activeSection === 'pricing' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                            Price <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
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
                                name="original_price"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Original Price (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={field.value ?? ''}
                                                onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                                className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Currency</FormLabel>
                                    <FormControl>
                                        <CustomSelect options={CURRENCY_OPTIONS} value={field.value} onChange={field.onChange} placeholder="Select currency" className="h-12" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="billing_cycle"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                        Billing Cycle <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <CustomSelect options={BILLING_CYCLE_OPTIONS} value={field.value} onChange={field.onChange} placeholder="Select billing cycle" className="h-12" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="trial_days"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Trial Period (Days)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(parseInt(e.target.value))}
                                            className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {activeSection === 'features' && (
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="is_unlimited"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Unlimited Access</FormLabel>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">No limits on courses and students</p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {!isUnlimited && (
                            <div className="grid grid-cols-2 gap-4 items-start">
                                <FormField
                                    control={form.control}
                                    name="max_courses_at_level"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                                Max Courses at {getDifficultyLabel(selectedDifficulty)} Level
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    ref={field.ref}
                                                    placeholder="Unlimited"
                                                    className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                            <p className="text-[10px] text-zinc-400 mt-1">
                                                Courses below {getDifficultyLabel(selectedDifficulty)} are unlimited. Leave empty for unlimited at this level too.
                                            </p>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="max_students"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Max Students</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    ref={field.ref}
                                                    placeholder="Unlimited"
                                                    className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <Separator />

                        <div className="space-y-3">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Learning Features</FormLabel>

                            <FormField
                                control={form.control}
                                name="includes_certificate"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Award size={18} className="text-zinc-500" />
                                            <span className="text-sm font-medium">Certificate of Completion</span>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="can_download_materials"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Download size={18} className="text-zinc-500" />
                                            <span className="text-sm font-medium">Download Course Materials</span>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="includes_video_lessons"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Video size={18} className="text-zinc-500" />
                                            <span className="text-sm font-medium">Video Lessons</span>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {form.watch('includes_video_lessons') && (
                                <FormField
                                    control={form.control}
                                    name="video_quality"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1 pl-8">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Video Quality</FormLabel>
                                            <FormControl>
                                                <CustomSelect options={VIDEO_QUALITY_OPTIONS} value={field.value} onChange={field.onChange} placeholder="Select quality" className="h-12" />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeSection === 'ai' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">AI Capabilities</FormLabel>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="ai_credits_per_month"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">AI Credits / Month</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(parseInt(e.target.value))}
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
                                    name="audio_minutes_per_month"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Audio Minutes / Month</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                                    className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="ai_question_generation"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Brain size={18} className="text-zinc-500" />
                                            <span className="text-sm font-medium">AI Question Generation</span>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ai_explanations"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Brain size={18} className="text-zinc-500" />
                                            <span className="text-sm font-medium">AI Explanations</span>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="text_to_audio"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Mic size={18} className="text-zinc-500" />
                                            <span className="text-sm font-medium">Text to Audio Conversion</span>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="audio_to_text"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Mic size={18} className="text-zinc-500" />
                                            <span className="text-sm font-medium">Audio to Text Transcription</span>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Display Settings</FormLabel>

                            <FormField
                                control={form.control}
                                name="is_featured"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Star size={18} className="text-zinc-500" />
                                            <span className="text-sm font-medium">Featured Package</span>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-orange-600 font-bold transition-all rounded-xl text-white gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : (type === 'CREATE' ? <Plus size={18} /> : <Save size={18} />)}
                    {type === 'CREATE' ? 'Create Package' : 'Save Changes'}
                </Button>
            </form>
        </Form>
    );
}