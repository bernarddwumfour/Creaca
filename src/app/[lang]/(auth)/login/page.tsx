'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { Moon, Sun, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Lang } from '@/lib/dictionary/dictionary';

import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

const loginDict = {
  en: {
    title: "Welcome Back",
    subtitle: "Log in to continue your AI-guided math journey.",
    success: "Account created! You can now log in.",
    email: "Email Address",
    password: "Password",
    button: "Sign In",
    noAccount: "Don't have an account?",
    action: "Create one for free",
    forgot: "Forgot password?",
    error: "Invalid email or password"
  },
  fr: {
    title: "Bon retour",
    subtitle: "Connectez-vous pour continuer votre parcours.",
    success: "Compte créé ! Vous pouvez maintenant vous connecter.",
    email: "Adresse Email",
    password: "Mot de passe",
    button: "Se connecter",
    noAccount: "Pas de compte ?",
    action: "Créez-en un gratuitement",
    forgot: "Mot de passe oublié ?",
    error: "Email ou mot de passe incorrect"
  },
  es: {
    title: "Bienvenido",
    subtitle: "Inicia sesión para continuar tu camino.",
    success: "¡Cuenta creada! Ahora puedes iniciar sesión.",
    email: "Correo Electrónico",
    password: "Contraseña",
    button: "Entrar",
    noAccount: "¿No tienes cuenta?",
    action: "Crea una gratis",
    forgot: "¿Olvidaste tu contraseña?",
    error: "Correo o contraseña no válidos"
  }
};

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

function LoginForm({ lang, t }: { lang: Lang, t: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, values);

      // Explicitly check for success status before redirecting
      if (data.status === 'success') {
        localStorage.setItem('access_token', data.data.tokens.access);
        localStorage.setItem('refresh_token', data.data.tokens.refresh);
        // router.push(`/${lang}`);
      } else {
        // Handle 200 OK responses that contain a failure status
        form.setError('root', { message: data.message || t.error });
      }
    } catch (error: any) {
      // Handle actual error codes (401, 404, 500, etc.)
      const serverResponse = error.response?.data;
      const msg = serverResponse?.message || t.error;
      form.setError('root', { message: typeof msg === 'string' ? msg : t.error });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
        {/* Registration Success Message */}
        {isRegistered && !form.formState.errors.root && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={14} />
            {t.success}
          </div>
        )}

        {/* Global Error Message */}
        {form.formState.errors.root && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20">
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t.password}</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl pr-10"
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormMessage className="text-[10px]" />
              <div className="flex justify-end pt-1">
                <Link href={`/${lang}/forgot-password`} className="text-[11px] font-bold text-primary hover:underline uppercase tracking-tighter">
                  {t.forgot}
                </Link>
              </div>
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

export default function LoginPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = React.use(params);
  const t = loginDict[lang] || loginDict.en;
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex w-full bg-zinc-50 dark:bg-[#09090b] relative overflow-hidden">
      <div className="absolute !right-6 top-6 z-20 flex items-center">
        <Button
          variant="ghost" size="icon" className="rounded-full w-8 h-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <LanguageSwitcher currentLang={lang} />
      </div>

      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none select-none text-white font-serif italic">
          <span className="absolute top-[10%] left-[15%] text-6xl">π</span>
          <span className="absolute top-[25%] left-[70%] text-5xl">∑</span>
          <span className="absolute top-[45%] left-[10%] text-8xl">√x</span>
          <span className="absolute top-[15%] left-[85%] text-7xl">∞</span>
          <span className="absolute top-[60%] left-[75%] text-6xl">∫</span>
        </div>
        <div className="relative z-10 text-center text-white space-y-2">
          <h1 className="text-8xl font-black tracking-tighter">KYRIOS<span className="text-zinc-900">.</span></h1>
          <p className="text-white/90 font-medium text-lg tracking-widest uppercase">Intelligence in Mathematics</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col gap-6 items-center justify-center p-6 bg-white dark:bg-[#18181b] relative">
        <Link href={`/${lang}`}>
          <span className='font-black text-xl'>KYRIOS<span className="text-primary">.</span></span>
        </Link>
        <Card className="w-full max-w-md group rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-[#111114] relative z-10 shadow-xl border-none">
          <div className="absolute w-[98%] h-[98.5%] top-[0.75%] left-[1%] overflow-hidden bg-white dark:bg-[#111114] rounded-xl " />
          <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '3s' }} />

          <div className="relative space-y-6">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight">{t.title}</CardTitle>
              <CardDescription className="text-zinc-500 font-medium">{t.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Suspense wrapper here ensures useSearchParams works properly */}
              <React.Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>}>
                <LoginForm lang={lang} t={t} />
              </React.Suspense>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
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