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
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const loginDict = {
  en: {
    title: "Welcome Back",
    subtitle: "Log in to continue your AI-guided math journey.",
    email: "Email Address",
    password: "Password",
    button: "Sign In",
    noAccount: "Don't have an account?",
    action: "Create one for free",
    forgot: "Forgot password?",
  },
  fr: {
    title: "Bon retour",
    subtitle: "Connectez-vous pour continuer votre parcours.",
    email: "Adresse Email",
    password: "Mot de passe",
    button: "Se connecter",
    noAccount: "Pas de compte ?",
    action: "Créez-en un gratuitement",
    forgot: "Mot de passe oublié ?",
  },
  es: {
    title: "Bienvenido",
    subtitle: "Inicia sesión para continuar tu camino.",
    email: "Correo Electrónico",
    password: "Contraseña",
    button: "Entrar",
    noAccount: "¿No tienes cuenta?",
    action: "Crea una gratis",
    forgot: "¿Olvidaste tu contraseña?",
  }
};

export default function LoginPage({ params }: { params: Promise<{ lang: Lang }> }) {
  // Correctly unwrap params for Next.js 15
  const { lang } = React.use(params);
  const t = loginDict[lang] || loginDict.en;
  const { theme, setTheme } = useTheme()


  return (
    <div className="min-h-screen flex w-full relative overflow-hidden">
      <div className="absolute !right-6 top-6 z-10 flex item-center ">

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <LanguageSwitcher currentLang={lang} />
      </div>


      {/* LEFT SIDE: BRANDING & SCATTERED MATH */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none select-none text-white font-serif italic">
          <span className="absolute top-[10%] left-[15%] text-6xl">π</span>
          <span className="absolute top-[25%] left-[70%] text-5xl">∑</span>
          <span className="absolute top-[45%] left-[10%] text-8xl">√x</span>
          <span className="absolute top-[15%] left-[85%] text-7xl">∞</span>
          <span className="absolute top-[60%] left-[75%] text-6xl">∫</span>
          <span className="absolute top-[80%] left-[20%] text-5xl">dy/dx</span>
          <span className="absolute top-[40%] left-[45%] text-6xl">Δ</span>
        </div>

        <div className="relative z-10 text-center text-white space-y-2">
          <h1 className="text-8xl font-black tracking-tighter">
            QUBIT<span className="text-zinc-900">.</span>
          </h1>
          <p className="text-white/90 font-medium text-lg tracking-widest uppercase">
            Intelligence in Mathematics
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: THE LOGIN CARD */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 items-center justify-center p-6 bg-white dark:bg-[#18181b] relative">
        <Link href={`/${lang}`}>
          <span className='font-black text-xl'>QUBIT<span className="text-primary">.</span></span>
        </Link>
        <Card className="w-full max-w-md group  rounded-xl  overflow-hidden  transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-[#111114] overflow-hidden rounded-2xl relative z-10 shadow-xl dark:shadow-xl ">
          <div className="absolute w-[98%] h-[98%] top-[1%] left-[1%] overflow-hidden bg-white dark:bg-[#111114] rounded-xl " />

          <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '3s' }} />


          <div className="relative space-y-6">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight">{t.title}</CardTitle>
              <CardDescription className="text-zinc-500 font-medium">
                {t.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                    {t.password}
                  </Label>

                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 border-zinc-200 focus-visible:ring-primary rounded-xl"
                />

                <div className="flex justify-end">
                  <Link href={`/${lang}/forgot-password`} className="text-xs font-bold text-primary hover:underline">
                    {t.forgot}
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full h-12 bg-zinc-900 hover:bg-primary font-bold transition-all text-md  rounded-xl text-white">
                {t.button}
              </Button>
              <p className="text-sm text-center text-zinc-500 font-medium">
                {t.noAccount}{' '}
                <Link href={`/${lang}/signup`} className="text-primary font-bold hover:underline">
                  {t.action}
                </Link>
              </p>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
}