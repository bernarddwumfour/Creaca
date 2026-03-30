import * as z from 'zod';

export const subjectSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    code: z.string().min(3, "Subject code is required (e.g., MATH-101)"),
});

export const courseSchema = z.object({
    title: z.string().min(2, "Course title is required"),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
});