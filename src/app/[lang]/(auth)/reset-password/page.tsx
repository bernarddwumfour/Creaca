'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { Moon, Sun, Loader2, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Lang } from '@/lib/dictionary/dictionary';

import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

const resetSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

function ResetForm({ lang, onSuccess }: { lang: Lang, onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();

    const token = searchParams.get('token');

    const form = useForm<z.infer<typeof resetSchema>>({
        resolver: zodResolver(resetSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    const password = form.watch("password");

    const getStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[a-z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const strength = getStrength(password);
    const strengthColor = ["bg-zinc-200", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"][strength];
    const strengthLabel = ["Weak", "Weak", "Fair", "Good", "Strong", "Excellent"][strength];

    async function onSubmit(values: z.infer<typeof resetSchema>) {
        if (!token) return toast.error("Invalid or expired reset link.");

        setIsLoading(true);
        try {
            const response = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
                token,
                new_password: values.password
            });

            if (response.data.status === 'success') {
                onSuccess();
            }
        } catch (error: any) {
            form.setError('root', { message: error.response?.data?.message || "Failed to reset password." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500 py-4">
                {form.formState.errors.root && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20 flex items-center justify-center gap-2">
                        <AlertCircle size={14} />
                        {form.formState.errors.root.message}
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <div className="flex justify-between items-end">
                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">New Password</FormLabel>
                                {password && <span className="text-[9px] font-black uppercase opacity-40">{strengthLabel}</span>}
                            </div>
                            <div className="relative">
                                <FormControl>
                                    <Input {...field} type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl pr-10" />
                                </FormControl>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="flex gap-1 h-1 mt-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className={`h-full flex-1 rounded-full transition-all duration-500 ${strength >= s ? strengthColor : "bg-zinc-100 dark:bg-zinc-800"}`} />
                                ))}
                            </div>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Confirm Password</FormLabel>
                            <FormControl>
                                <Input {...field} type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <Button disabled={isLoading} className="w-full h-12 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-primary dark:hover:bg-primary dark:hover:text-white font-bold transition-all text-md rounded-xl text-white mt-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
                </Button>
            </form>
        </Form>
    );
}

export default function ResetPasswordPage({ params }: { params: Promise<{ lang: Lang }> }) {
    const { lang } = React.use(params);
    const { theme, setTheme } = useTheme();
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        setIsSuccess(true);
        toast.success("Security configuration updated.");
        setTimeout(() => router.push(`/${lang}/login`), 3000);
    };

    return (
        <div className="min-h-screen flex w-full bg-zinc-50 dark:bg-[#09090b] relative overflow-hidden transition-colors duration-500">
            <div className="absolute !right-6 top-6 z-20 flex items-center">
                <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <LanguageSwitcher currentLang={lang} />
            </div>

            <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none select-none text-white font-serif italic">
                    <span className="absolute top-[45%] left-[10%] text-8xl">√x</span>
                    <span className="absolute top-[60%] left-[75%] text-6xl">∫</span>
                </div>
                <div className="relative z-10 text-center text-white space-y-2">
                    <h1 className="text-8xl font-black tracking-tighter">KYRIOS<span className="text-zinc-900">.</span></h1>
                    <p className="text-white/90 font-medium text-lg tracking-widest">Secure Your Access</p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col gap-6 items-center justify-center p-6 bg-white dark:bg-[#18181b] relative">
                <Link href={`/${lang}`}>
                    <span className='font-black text-xl text-zinc-900 dark:text-white'>KYRIOS<span className="text-primary">.</span></span>
                </Link>

                <Card className="w-full max-w-md group rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-[#111114] relative z-10 shadow-xl border-none">
                    <div className="absolute w-[98%] h-[98.5%] top-[0.75%] left-[1%] bg-white dark:bg-[#111114] rounded-xl" />
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '3s' }} />

                    <div className="relative">
                        {!isSuccess ? (
                            <>
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-3xl font-black tracking-tight">New Password</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">Create a new secure password for your account.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <React.Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>}>
                                        <ResetForm lang={lang} onSuccess={handleSuccess} />
                                    </React.Suspense>
                                </CardContent>
                            </>
                        ) : (
                            <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
                                <CardHeader className="p-0 space-y-2">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 mb-2">
                                        <ShieldCheck size={40} className="text-emerald-500" />
                                    </div>
                                    <CardTitle className="text-3xl font-black tracking-tight">Security Updated</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">Your credentials have been successfully reset.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-6 italic">Redirecting to login...</p>
                                    <Button asChild className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold hover:bg-primary">
                                        <Link href={`/${lang}/login`}>Log In Now</Link>
                                    </Button>
                                </CardContent>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}