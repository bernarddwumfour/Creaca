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

const signupDict = {
  en: {
    title: "Create Account",
    subtitle: "Join the global community of AI math learners.",
    name: "Full Name",
    email: "Email Address",
    password: "Password",
    button: "Get Started",
    hasAccount: "Already have an account?",
    action: "Log in",
  },
  fr: {
    title: "Créer un compte",
    subtitle: "Rejoignez la communauté mondiale des apprenants.",
    name: "Nom complet",
    email: "Adresse Email",
    password: "Mot de passe",
    button: "Commencer",
    hasAccount: "Déjà inscrit ?",
    action: "Se connecter",
  },
  es: {
    title: "Crear Cuenta",
    subtitle: "Únete a la comunidad global de matemáticas con IA.",
    name: "Nombre Completo",
    email: "Correo Electrónico",
    password: "Contraseña",
    button: "Empezar",
    hasAccount: "¿Ya tienes cuenta?",
    action: "Inicia sesión",
  }
};

export default function SignupPage({ params }: { params: Promise<{ lang: Lang }> }) {
  // CORRECT: Unwrap params for Next.js 15 Client Component
  const { lang } = React.use(params);
  const t = signupDict[lang] || signupDict.en;

  return (
    <div className="min-h-screen flex w-full bg-zinc-50 relative overflow-hidden">

      <div className="absolute !right-6 top-6 z-10 ">
        <LanguageSwitcher currentLang={lang} />
      </div>

      {/* LEFT SIDE: SCATTERED MATH BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        {/* Math Symbols Scatter Overlay */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none select-none text-white font-serif italic">
          <span className="absolute top-[5%] left-[10%] text-6xl">α</span>
          <span className="absolute top-[20%] left-[60%] text-5xl">β</span>
          <span className="absolute top-[40%] left-[15%] text-8xl font-bold">∑</span>
          <span className="absolute top-[15%] left-[80%] text-7xl">δ</span>
          <span className="absolute top-[60%] left-[70%] text-6xl">θ</span>
          <span className="absolute top-[80%] left-[10%] text-5xl font-mono">λ</span>
          <span className="absolute top-[85%] left-[50%] text-4xl">Ω</span>
          <span className="absolute top-[45%] left-[40%] text-7xl">φ</span>
          <span className="absolute top-[10%] left-[35%] text-3xl opacity-50">ε</span>
        </div>

        <div className="relative z-10 text-center text-white space-y-4">
          <h1 className="text-8xl font-black tracking-tighter">
          QUBIT<span className="text-zinc-900">.</span>
          </h1>
          <p className="text-white/90 font-bold text-xl tracking-widest uppercase">
            Solve the Futures
          </p>
          <div className="flex gap-2 justify-center pt-4">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>

        {/* Technical Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]" />
      </div>

      {/* RIGHT SIDE: THE SIGNUP CARD */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 items-center justify-center p-6 bg-white relative">
      <Link href={`/${lang}`}>
      <span className='font-black text-xl'>QUBIT<span className="text-primary">.</span></span>
      </Link>
        <Card className="w-full max-w-md border-zinc-200 shadow-2xl bg-white relative z-10 rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight">{t.title}</CardTitle>
            <CardDescription className="text-zinc-500 font-medium">
              {t.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                {t.name}
              </Label>
              <Input
                id="name"
                placeholder="Isaac Newton"
                className="h-12 border-zinc-200 focus-visible:ring-primary rounded-xl shadow-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                {t.email}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="genius@qubit.ai"
                className="h-12 border-zinc-200 focus-visible:ring-primary rounded-xl shadow-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                {t.password}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 border-zinc-200 focus-visible:ring-primary rounded-xl shadow-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button className="w-full h-12 bg-zinc-900 hover:bg-primary font-bold transition-all text-md shadow-lg shadow-zinc-200 text-white rounded-xl">
              {t.button}
            </Button>
            <p className="text-sm text-center text-zinc-500 font-medium">
              {t.hasAccount}{' '}
              <Link href={`/${lang}/login`} className="text-primary font-bold hover:underline">
                {t.action}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}