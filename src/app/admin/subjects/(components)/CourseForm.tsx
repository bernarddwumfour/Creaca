'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Save, BookOpen, X, PlusCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { CustomSelect } from '../../../../../widgets/CustomSelect/CustomSelect';

// Course schema matching Django model with price
const courseSchema = z.object({
    name: z.string()
        .min(1, "Course name is required")
        .max(200, "Course name must be less than 200 characters"),
    description: z.string()
        .max(1000, "Description must be less than 1000 characters"),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    subject_id: z.string().min(1, "Please select a subject"),
    duration: z.number()
        .int("Duration must be a whole number")
        .positive("Duration must be a positive number")
        .nullable(),
    status: z.enum(['active', 'inactive', 'draft']),
    price: z.number()
        .min(0, "Price cannot be negative")
        .nullable()
        .optional(),
    requirements: z.array(z.string()).optional().default([]),
    prerequisites: z.array(z.string()).optional().default([]),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
    type?: 'CREATE' | 'UPDATE' | null;
    courseId?: string;
    subjectId?: string;
    subjectTitle?: string;
    initialData?: {
        name?: string;
        description?: string;
        difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        subject_id?: string;
        duration?: number | null;
        status?: 'active' | 'inactive' | 'draft';
        price?: number | null;
        requirements?: string[];
        prerequisites?: string[];
    } | null;
    onSuccess: () => void;
}

const DIFFICULTY_OPTIONS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
];

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' },
];

export function CourseForm({ type = 'CREATE', initialData, onSuccess, courseId, subjectId, subjectTitle }: CourseFormProps) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    // Fetch subjects for dropdown
    const { data: subjectsResponse, isLoading: subjectsLoading } = useQuery({
        queryKey: [ENDPOINTS.SUBJECTS.LIST_SUBJECTS, 'all'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.SUBJECTS.LIST_SUBJECTS, {
                params: { page_size: 100 }
            });
            return data;
        },
    });

    // Fetch courses for prerequisites dropdown
    const { data: coursesResponse, isLoading: coursesLoading } = useQuery({
        queryKey: [ENDPOINTS.COURSES.LIST_COURSES, 'all'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.COURSES.LIST_COURSES, {
                params: { page_size: 100 }
            });
            return data;
        },
    });

    const subjects = subjectsResponse?.data?.results || [];
    const subjectOptions = subjects.map((subject: any) => ({
        value: subject.id,
        label: subject.name,
    }));

    const allCourses = coursesResponse?.data?.results || [];
    const courseOptions = allCourses
        .filter((c: any) => c.id !== courseId)
        .map((course: any) => ({
            value: course.id,
            label: course.name,
        }));

    const form = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema) as any,
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            difficulty: initialData?.difficulty ?? "beginner",
            subject_id: initialData?.subject_id ?? subjectId ?? "",
            duration: initialData?.duration ?? null,
            status: initialData?.status ?? "active",
            price: initialData?.price ?? null,
            requirements: initialData?.requirements ?? [],
            prerequisites: initialData?.prerequisites ?? [],
        } as any,
    });

    const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
        control: form.control,
        name: ("requirements" as never),
    });

    const invalidateCourses = () => {
        queryClient.invalidateQueries({ queryKey: [ENDPOINTS.COURSES.LIST_COURSES] });
    };

    const onSubmit = async (values: CourseFormData) => {
        setIsLoading(true);
        try {
            const payload = {
                name: values.name,
                description: values.description,
                difficulty: values.difficulty,
                subject: values.subject_id,
                duration: values.duration,
                status: values.status,
                price: values.price,
                requirements: values.requirements.filter(r => r.trim() !== ""),
                prerequisites: values.prerequisites,
            };

            if (type === 'CREATE') {
                const response = await api.post(ENDPOINTS.COURSES.CREATE_COURSE, payload);
                toast.success(response.data?.message || "Course created successfully.");
            } else {
                const response = await api.patch(
                    ENDPOINTS.COURSES.UPDATE_COURSE.replace(':id', courseId!),
                    payload
                );
                toast.success(response.data?.message || "Course updated successfully.");
            }

            invalidateCourses();
            onSuccess();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Operation failed. Please check your input and try again.";
            toast.error(errorMessage);
            form.setError('root', { message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedSubjectName = subjectOptions.find((s: any) => s.value === form.watch('subject_id'))?.label;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10 max-h-[70vh] overflow-y-auto px-2">
                {form.formState.errors.root && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20 text-center">
                        {form.formState.errors.root.message}
                    </div>
                )}

                {/* Context Badge */}
                {(subjectTitle || selectedSubjectName) && (
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-0.5">
                            {type === 'CREATE' ? 'Creating Course Under' : 'Course Subject'}
                        </p>
                        <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-orange-500" />
                            <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                                {subjectTitle || selectedSubjectName || 'Select a subject'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Course Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                Course Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g., Responsive Web Design"
                                    className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                {/* Subject Selection */}
                {!subjectId && (
                    <FormField
                        control={form.control}
                        name="subject_id"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                    Subject <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <CustomSelect
                                        options={subjectOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select a subject"
                                        className="h-12"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />
                )}

                {/* Description */}
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
                                    placeholder="Provide a detailed description of this course..."
                                    className="min-h-[100px] border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium resize-y"
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                {/* Requirements - Dynamic List */}
                <div className="space-y-2">
                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                        Requirements
                    </FormLabel>
                    <div className="space-y-2">
                        {requirementFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-center">
                                <FormField
                                    control={form.control}
                                    name={`requirements.${index}`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={`Requirement ${index + 1}`}
                                                    className="h-10 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRequirement(index)}
                                    className="h-10 w-10 rounded-xl hover:bg-red-100 hover:text-red-600"
                                    disabled={isLoading}
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendRequirement("")}
                            className="w-full h-10 rounded-xl gap-2 border-dashed"
                            disabled={isLoading}
                        >
                            <PlusCircle size={14} />
                            Add Requirement
                        </Button>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                        List the requirements students need before taking this course
                    </p>
                </div>

                {/* Prerequisites - Dropdown from fetched courses */}
                <FormField
                    control={form.control}
                    name="prerequisites"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                Prerequisite Courses
                            </FormLabel>
                            <FormControl>
                                <CustomSelect
                                    options={courseOptions}
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    placeholder="Select prerequisite courses"
                                    multiple={true}
                                    className="h-auto min-h-12"
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                            <p className="text-[10px] text-zinc-400 mt-1">
                                Select courses that students should complete before taking this course
                            </p>
                        </FormItem>
                    )}
                />

                {/* Difficulty Selection */}
                <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                Difficulty Level <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <CustomSelect
                                    options={DIFFICULTY_OPTIONS}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select difficulty"
                                    className="h-12"
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                {/* Duration */}
                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                Duration (minutes)
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        field.onChange(val === '' ? null : parseInt(val, 10));
                                    }}
                                    onBlur={field.onBlur}
                                    placeholder="e.g., 120"
                                    className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                            <p className="text-[10px] text-zinc-400 mt-1">
                                Optional: Estimated total course duration in minutes.
                            </p>
                        </FormItem>
                    )}
                />

                {/* Price */}
                <div className="space-y-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                    Price (USD) - One-time purchase
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                field.onChange(val === '' ? null : parseFloat(val));
                                            }}
                                            onBlur={field.onBlur}
                                            placeholder="49.99"
                                            className="h-12 pl-8 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-medium"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                                <p className="text-[10px] text-zinc-400 mt-1">
                                    Leave empty for subscription only. Set a price for one-time purchase.
                                </p>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Status */}
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                Status
                            </FormLabel>
                            <FormControl>
                                <CustomSelect
                                    options={STATUS_OPTIONS}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select status"
                                    className="h-12"
                                />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                            <p className="text-[10px] text-zinc-400 mt-1">
                                Active courses are visible to students. Draft courses are only visible to admins.
                            </p>
                        </FormItem>
                    )}
                />

                <Button
                    disabled={isLoading || subjectsLoading || coursesLoading}
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-orange-600 font-bold transition-all rounded-xl text-white gap-2"
                >
                    {isLoading
                        ? <Loader2 className="animate-spin" size={18} />
                        : (type === 'CREATE' ? <Plus size={18} /> : <Save size={18} />)
                    }
                    {type === 'CREATE' ? 'Create Course' : 'Save Changes'}
                </Button>
            </form>
        </Form>
    );
}
