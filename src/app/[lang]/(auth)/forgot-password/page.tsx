'use client';

import React from 'react';
import Link from 'next/link';
import { Lang } from '@/lib/dictionary/dictionary';

// shadcn/ui imports
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from '../../components/LanguageSwitcher';

const forgotDict = {
    en: {
        title: "Reset Password",
        subtitle: "Enter your email and we'll send you a recovery link.",
        email: "Email Address",
        button: "Send Reset Link",
        backToLogin: "Back to login",
    },
    fr: {
        title: "Réinitialiser le mot de passe",
        subtitle: "Entrez votre email pour recevoir un lien de récupération.",
        email: "Adresse Email",
        button: "Envoyer le lien",
        backToLogin: "Retour à la connexion",
    },
    es: {
        title: "Restablecer Contraseña",
        subtitle: "Ingresa tu correo para enviarte un enlace de recuperación.",
        email: "Correo Electrónico",
        button: "Enviar enlace",
        backToLogin: "Volver al inicio",
    }
};

export default function ForgotPasswordPage({ params }: { params: Promise<{ lang: Lang }> }) {
    // Unwrap the params promise for Next.js 15
    const { lang } = React.use(params);
    const t = forgotDict[lang] || forgotDict.en;

    return (
        <div className="min-h-screen flex w-full bg-zinc-50 relative overflow-hidden">

            <div className="absolute !right-6 top-6 z-10 ">
                <LanguageSwitcher currentLang={lang} />
            </div>

            {/* LEFT SIDE: BRANDING & SCATTERED MATH */}
            <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none select-none text-white font-serif italic">
                    <span className="absolute top-[15%] left-[20%] text-6xl">?</span>
                    <span className="absolute top-[35%] left-[60%] text-7xl font-bold">x = ?</span>
                    <span className="absolute top-[55%] left-[15%] text-8xl">√</span>
                    <span className="absolute top-[75%] left-[70%] text-6xl">!</span>
                    <span className="absolute top-[10%] left-[80%] text-5xl">δ</span>
                </div>

                <div className="relative z-10 text-center text-white space-y-2">
                    <h1 className="text-8xl font-black tracking-tighter">
                        QUBIT<span className="text-zinc-900">.</span>
                    </h1>
                    <p className="text-white/90 font-medium text-lg tracking-widest uppercase">
                        Recovery Portal
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: THE RESET CARD */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 items-center justify-center p-6 bg-white relative">
                <Link href={`/${lang}`}>
                    <span className='font-bold text-xl'>Qubit</span>
                </Link>
                <Card className="w-full max-w-md border-zinc-200 shadow-2xl bg-white relative z-10 rounded-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-black tracking-tight">{t.title}</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium">
                            {t.subtitle}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                                {t.email}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@domain.com"
                                className="h-12 border-zinc-200 focus-visible:ring-primary rounded-xl"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full h-12 bg-zinc-900 hover:bg-primary font-bold transition-all text-md shadow-lg shadow-zinc-200 text-white rounded-xl">
                            {t.button}
                        </Button>
                        <p className="text-sm text-center text-zinc-500 font-medium">
                            <Link href={`/${lang}/login`} className="text-primary font-bold hover:underline">
                                {t.backToLogin}
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}