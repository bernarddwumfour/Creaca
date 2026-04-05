'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Moon, Sun, Loader2, Mail, CheckCircle2, ArrowLeft, XCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Lang } from '@/lib/dictionary/dictionary';

import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

export default function VerifyEmailPage({ params }: { params: Promise<{ lang: Lang }> }) {
    const { lang } = React.use(params);
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Extract the token from the URL: ?token=...
    const token = searchParams.get('token');

    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    const verifyToken = useCallback(async () => {
        if (!token) {
            setVerificationStatus('error');
            setErrorMessage("No verification token found in the URL.");
            return;
        }

        try {
            // Adjust this endpoint based on your backend (e.g., /auth/verify-email/?token=...)
            const { data } = await api.get(`${ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`);

            if (data.status === 'success') {
                setVerificationStatus('success');
                toast.success("Email verified successfully!");
                // Redirect to login after 3 seconds
                setTimeout(() => router.push(`/${lang}/login`), 3000);
            } else {
                setVerificationStatus('error');
                setErrorMessage(data.message || "Verification failed.");
            }
        } catch (error: any) {
            setVerificationStatus('error');
            setErrorMessage(error.response?.data?.message || "The link is invalid or has expired.");
        }
    }, [token, lang, router]);

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    return (
        <div className="min-h-screen flex w-full bg-zinc-50 dark:bg-[#09090b] relative overflow-hidden transition-colors duration-500">
            {/* Top Actions */}
            <div className="absolute !right-6 top-6 z-20 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <LanguageSwitcher currentLang={lang} />
            </div>

            {/* Brand Side (Desktop) */}
            <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none select-none text-white font-serif italic">
                    <span className="absolute top-[20%] left-[10%] text-9xl">@</span>
                    <span className="absolute bottom-[20%] right-[10%] text-8xl">✓</span>
                </div>
                <div className="relative z-10 text-center text-white space-y-2">
                    <h1 className="text-8xl font-black tracking-tighter uppercase">KYRIOS<span className="text-zinc-900">.</span></h1>
                    <p className="text-white/90 font-medium text-lg tracking-widest uppercase">Securing your journey</p>
                </div>
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 items-center justify-center p-6 bg-white dark:bg-[#18181b] relative">
                <Link href={`/${lang}`}>
                    <span className='font-black text-xl text-zinc-900 dark:text-white'>KYRIOS<span className="text-primary">.</span></span>
                </Link>

                <Card className="w-full max-w-md group rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-[#111114] relative z-10 shadow-xl border-none">
                    <div className="absolute w-[98%] h-[98.5%] top-[0.75%] left-[1%] bg-white dark:bg-[#111114] rounded-xl" />
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '3s' }} />

                    <div className="relative p-8">
                        {verificationStatus === 'loading' && (
                            <div className="text-center space-y-6 py-8">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                                    <ShieldCheck className="text-primary animate-bounce" size={32} />
                                </div>
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl font-black tracking-tight uppercase">Verifying Link</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">Please wait while we confirm your identity...</CardDescription>
                                </div>
                                <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                            </div>
                        )}

                        {verificationStatus === 'success' && (
                            <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in-95 duration-700">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                                    <CheckCircle2 size={44} className="text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight uppercase">Success!</h2>
                                    <p className="text-zinc-500 font-medium">Your email has been verified. Welcome to Kyrios.</p>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 italic">Redirecting to login...</p>
                            </div>
                        )}

                        {verificationStatus === 'error' && (
                            <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                                    <XCircle size={44} className="text-red-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight uppercase">Invalid Link</h2>
                                    <p className="text-zinc-500 font-medium text-sm px-4">{errorMessage}</p>
                                </div>

                                <div className="pt-4 space-y-3">
                                    <Button asChild className="w-full h-12 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 font-bold rounded-xl">
                                        <Link href={`/${lang}/login`}>Back to Login</Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                <p className="text-[10px] text-zinc-400 uppercase tracking-widest text-center max-w-[280px] leading-relaxed">
                    The verification link expires after 24 hours for security purposes.
                </p>
            </div>
        </div>
    );
}