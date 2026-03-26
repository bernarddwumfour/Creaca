'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { Moon, Sun, Loader2, Eye, EyeOff } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Lang } from '@/lib/dictionary/dictionary';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

const signupDict = {
  en: {
    title: "Create Account",
    subtitle: "Join the global community of AI math learners.",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    button: "Get Started",
    hasAccount: "Already have an account?",
    action: "Log in",
    error: "Registration failed.",
  },
  fr: {
    title: "Créer un compte",
    subtitle: "Rejoignez la communauté mondiale.",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Adresse Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    button: "Commencer",
    hasAccount: "Déjà inscrit ?",
    action: "Se connecter",
    error: "Échec de l'inscription.",
  },
  es: {
    title: "Crear Cuenta",
    subtitle: "Únete a la comunidad global.",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    button: "Empezar",
    hasAccount: "¿Ya tienes cuenta?",
    action: "Inicia sesión",
    error: "Error al registrarse.",
  }
};

const signupSchema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function SignupForm({ lang, t }: { lang: Lang, t: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
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

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsLoading(true);
    try {
      const { data } = await api.post(ENDPOINTS.AUTH.REGISTER, {
        email: values.email,
        password: values.password,
        first_name: values.firstName,
        last_name: values.lastName,
      });

      if (data.status === 'success') {
        router.push(`/${lang}/login?registered=true`);
      }
    } catch (error: any) {
      const serverResponse = error.response?.data;

      // 1. Map specific field errors (errors array)
      if (serverResponse?.errors && Array.isArray(serverResponse.errors)) {
        serverResponse.errors.forEach((err: any) => {
          const field = err.field === 'first_name' ? 'firstName' : err.field === 'last_name' ? 'lastName' : err.field;
          form.setError(field as any, { message: err.message });
        });
      }

      // 2. Map global message (e.g., "Validation failed" or custom server message)
      const globalMessage = serverResponse?.message || t.error;
      form.setError('root', { message: globalMessage });

    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
        {form.formState.errors.root && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField control={form.control} name="firstName" render={({ field }) => (
          <FormItem className="space-y-1 pt-3">
            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t.firstName}</FormLabel>
            <FormControl><Input {...field} className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl pr-10" /></FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />
        <FormField control={form.control} name="lastName" render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t.lastName}</FormLabel>
            <FormControl><Input {...field} className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl pr-10" /></FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t.email}</FormLabel>
            <FormControl><Input {...field} type="email" className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl pr-10" /></FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem className="space-y-1">
            <div className="flex justify-between items-end">
              <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t.password}</FormLabel>
              {password && <span className="text-[9px] font-black uppercase opacity-40">{["Weak", "Weak", "Fair", "Good", "Strong", "Excellent"][strength]}</span>}
            </div>
            <div className="relative">
              <FormControl><Input {...field} type={showPass ? "text" : "password"} className="h-11 rounded-xl pr-10 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary " /></FormControl>
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-zinc-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex gap-1 h-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`h-full flex-1 rounded-full transition-all duration-500 ${strength >= s ? strengthColor : "bg-zinc-100 dark:bg-zinc-800"}`} />
              ))}
            </div>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t.confirmPassword}</FormLabel>
            <FormControl><Input {...field} type={showPass ? "text" : "password"} className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl pr-10" /></FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        <Button disabled={isLoading} className="w-full h-12 mt-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-primary dark:hover:bg-primary dark:hover:text-white font-bold rounded-xl transition-all">
          {isLoading ? <Loader2 className="animate-spin" /> : t.button}
        </Button>
      </form>
    </Form>
  );
}

export default function SignupPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = React.use(params);
  const t = signupDict[lang] || signupDict.en;
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex w-full bg-zinc-50 dark:bg-[#09090b] relative overflow-hidden">
      <div className="absolute !right-6 top-6 z-20 flex items-center">
        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <LanguageSwitcher currentLang={lang} />
      </div>

      <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none text-white italic">
          <span className="absolute top-[10%] left-[10%] text-6xl">α</span>
          <span className="absolute bottom-[10%] right-[10%] text-6xl">Ω</span>
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-8xl font-black tracking-tighter">KYRIOS<span className="text-zinc-900">.</span></h1>
          <p className="font-bold text-xl tracking-[0.3em] uppercase opacity-80">Solve the Futures</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative">
        <Link href={`/${lang}`} className="mb-6"><span className='font-black text-xl'>KYRIOS<span className="text-primary">.</span></span></Link>
        <Card className="w-full max-w-md group rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 bg-white dark:bg-[#111114] relative z-10 shadow-2xl border-none">
          <div className="absolute w-[98%] h-[99%] top-[0.5%] left-[1%] bg-white dark:bg-[#111114] rounded-2xl z-0" />
          <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '4s' }} />
          <div className="relative p-2">
            <CardHeader><CardTitle className="text-3xl font-black">{t.title}</CardTitle><CardDescription>{t.subtitle}</CardDescription></CardHeader>
            <CardContent><SignupForm lang={lang} t={t} /></CardContent>
            <CardFooter className="justify-center border-t border-zinc-100 dark:border-zinc-800/50 mt-4 pt-6 text-sm text-zinc-500">
              {t.hasAccount} <Link href={`/${lang}/login`} className="text-primary font-bold ml-1 hover:underline">{t.action}</Link>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
}