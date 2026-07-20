'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { Moon, Sun, Loader2, Mail, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Lang } from '@/lib/dictionary/dictionary';

import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

const forgotDict = {
    en: {
        brandTagline: "Skills for the Digital Future",
        title: "Reset Password",
        subtitle: "Enter your email and we'll send you a recovery link.",
        email: "Email Address",
        button: "Send Reset Link",
        resend: "Resend Email",
        backToLogin: "Back to login",
        successTitle: "Check your email",
        successSubtitle: "We've sent a recovery link to",
        error: "Failed to reset password.",
    },
    fr: {
        brandTagline: "Des Compétences pour l’Avenir Numérique",
        title: "Réinitialiser",
        subtitle: "Entrez votre email pour recevoir un lien de récupération.",
        email: "Adresse Email",
        button: "Envoyer le lien",
        resend: "Renvoyer l'e-mail",
        backToLogin: "Retour à la connexion",
        successTitle: "Vérifiez vos emails",
        successSubtitle: "Nous avons envoyé un lien à",
        error: "Échec de la réinitialisation du mot de passe.",
    },
    es: {
        brandTagline: "Habilidades para el Futuro Digital",
        title: "Restablecer",
        subtitle: "Ingresa tu correo para enviarte un enlace de recuperación.",
        email: "Correo Electrónico",
        button: "Enviar enlace",
        resend: "Reenviar correo",
        backToLogin: "Volver al inicio",
        successTitle: "Revisa tu correo",
        successSubtitle: "Enviamos un enlace a",
        error: "Error al restablecer la contraseña.",
    }
};

const forgotSchema = z.object({
    email: z.string().email("Invalid email address"),
});

function ForgotForm({ lang, t, onSubmitted }: { lang: Lang, t: any, onSubmitted: (email: string) => void }) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof forgotSchema>>({
        resolver: zodResolver(forgotSchema),
        defaultValues: { email: "" },
    });

    async function onSubmit(values: z.infer<typeof forgotSchema>) {
        setIsLoading(true);
        try {
            const response = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, values);
            if (response.data.status === 'success' || response.status === 200) {
                onSubmitted(values.email);
                toast.success("Recovery instructions sent!");
            }
        } catch (error: any) {
            form.setError('root', { message: error.response?.data?.message || t.error });
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
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t.email}</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" placeholder="name@domain.com" className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />
                <Button disabled={isLoading} className="w-full h-12 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-primary dark:hover:bg-primary dark:hover:text-white font-bold transition-all text-md rounded-xl text-white">
                    {isLoading ? <Loader2 className="animate-spin" /> : t.button}
                </Button>
            </form>
        </Form>
    );
}

export default function ForgotPasswordPage({ params }: { params: Promise<{ lang: Lang }> }) {
    const { lang } = React.use(params);
    const t = forgotDict[lang] || forgotDict.en;
    const { theme, setTheme } = useTheme();

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [isResending, setIsResending] = useState(false);

    const handleSubmitted = (email: string) => {
        setSubmittedEmail(email);
        setIsSubmitted(true);
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await api.post(ENDPOINTS.AUTH.RESEND_RESET_EMAIL, { email: submittedEmail });
            toast.success("Email resent successfully!");
        } catch (error: any) {
            toast.error("Failed to resend. Please try again later.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-zinc-50 dark:bg-[#09090b] relative overflow-hidden transition-colors duration-500">
            <div className="absolute !right-6 top-6 z-20 flex items-center">
                <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <LanguageSwitcher currentLang={lang} />
            </div>

            {/* Left Brand Panel */}
            <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none select-none text-white font-serif italic">
                    <span className="absolute top-[45%] left-[10%] text-8xl">√x</span>
                    <span className="absolute top-[60%] left-[75%] text-6xl">∫</span>
                </div>
                <div className="relative z-10 text-center text-white space-y-2">
                    <h1 className="text-8xl font-black tracking-tighter">KYRIOS<span className="text-zinc-900">.</span></h1>
                    <p className="text-white/90 font-medium text-lg tracking-widest uppercase">{t.brandTagline}</p>
                </div>
            </div>

            {/* Right Card Panel */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 items-center justify-center p-6 bg-white dark:bg-[#18181b] relative">
                <Link href={`/${lang}`}>
                    <span className='font-black text-xl'>KYRIOS<span className="text-primary">.</span></span>
                </Link>

                <Card className="w-full max-w-md group rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-[#111114] relative z-10 shadow-xl border-none">
                    <div className="absolute w-[98%] h-[98.5%] top-[0.75%] left-[1%] overflow-hidden bg-white dark:bg-[#111114] rounded-xl" />
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '3s' }} />

                    <div className="relative">
                        {!isSubmitted ? (
                            <>
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-3xl font-black tracking-tight">{t.title}</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">{t.subtitle}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <React.Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>}>
                                        <ForgotForm lang={lang} t={t} onSubmitted={handleSubmitted} />
                                    </React.Suspense>
                                </CardContent>
                                <CardFooter className="flex flex-col pb-6 pt-4">
                                    <Link href={`/${lang}/login`} className="flex items-center gap-2 text-[11px] font-bold text-primary hover:underline uppercase tracking-widest">
                                        <ArrowLeft size={14} /> {t.backToLogin}
                                    </Link>
                                </CardFooter>
                            </>
                        ) : (
                            <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                <CardHeader className="p-0 space-y-2">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 mb-2">
                                        <Mail size={40} className="text-emerald-500" />
                                    </div>
                                    <CardTitle className="text-3xl font-black tracking-tight uppercase">{t.successTitle}</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">
                                        {t.successSubtitle} <span className="text-zinc-900 dark:text-white font-bold">{submittedEmail}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    <Button onClick={handleResend} disabled={isResending} variant="outline" className="w-full h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                        {isResending ? <Loader2 className="animate-spin mr-2" size={16} /> : <RefreshCw className="mr-2" size={16} />}
                                        {t.resend}
                                    </Button>
                                    <Link href={`/${lang}/login`} className="flex items-center justify-center gap-2 text-[11px] font-bold text-primary hover:underline uppercase tracking-widest pt-2">
                                        <ArrowLeft size={14} /> {t.backToLogin}
                                    </Link>
                                </CardContent>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
