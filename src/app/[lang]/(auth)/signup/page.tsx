'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { Moon, Sun, Loader2, Eye, EyeOff, Venus, Mars } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Lang } from '@/lib/dictionary/dictionary';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

const signupDict = {
  en: {
    brandTagline: "Skills for the Digital Future",
    title: "Create Account",
    subtitle: "Join a global community building practical digital skills.",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    gender: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderPreferNot: "Prefer not to say",
    genderRequired: "Please select your gender",
    button: "Get Started",
    googleButton: "Continue with Google",
    hasAccount: "Already have an account?",
    action: "Log in",
    error: "Registration failed.",
  },
  fr: {
    brandTagline: "Des Compétences pour l’Avenir Numérique",
    title: "Créer un compte",
    subtitle: "Rejoignez la communauté mondiale.",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Adresse Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    gender: "Genre",
    genderMale: "Homme",
    genderFemale: "Femme",
    genderPreferNot: "Préfère ne pas dire",
    genderRequired: "Veuillez sélectionner votre genre",
    button: "Commencer",
    googleButton: "Continuer avec Google",
    hasAccount: "Déjà inscrit ?",
    action: "Se connecter",
    error: "Échec de l'inscription.",
  },
  es: {
    brandTagline: "Habilidades para el Futuro Digital",
    title: "Crear Cuenta",
    subtitle: "Únete a la comunidad global.",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    gender: "Género",
    genderMale: "Hombre",
    genderFemale: "Mujer",
    genderPreferNot: "Prefiero no decirlo",
    genderRequired: "Por favor seleccione su género",
    button: "Empezar",
    googleButton: "Continuar con Google",
    hasAccount: "¿Ya tienes cuenta?",
    action: "Inicia sesión",
    error: "Error al registrarse.",
  }
};

// Updated schema with gender as required
const signupSchema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
  gender: z.string().min(1, "Gender is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function SignupForm({ lang, t, redirectTo }: { lang: Lang, t: any, redirectTo: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: ""
    },
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
        gender: values.gender,
      });

      if (data.status === 'success') {
        // Pass the redirect parameter to login page
        const loginUrl = `/${lang}/login?registered=true${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`;
        router.push(loginUrl);
      }
    } catch (error: any) {
      const serverResponse = error.response?.data;

      if (serverResponse?.errors && Array.isArray(serverResponse.errors)) {
        serverResponse.errors.forEach((err: any) => {
          const field = err.field === 'first_name' ? 'firstName' :
            err.field === 'last_name' ? 'lastName' :
              err.field === 'gender' ? 'gender' : err.field;
          form.setError(field as any, { message: err.message });
        });
      }

      const globalMessage = serverResponse?.message || t.error;
      form.setError('root', { message: globalMessage });

    } finally {
      setIsLoading(false);
    }
  }

  // Google Sign-In handler
  const handleGoogleSignup = useCallback(() => {
    if (!scriptLoaded || !window.google) {
      console.error('Google script not loaded');
      return;
    }

    setIsGoogleLoading(true);

    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        ux_mode: 'popup',
        callback: async (response: any) => {
          if (response.code) {
            try {
              const { data } = await api.post(ENDPOINTS.AUTH.GOOGLE, {
                code: response.code
              });

              if (data.status === 'success') {
                login({
                  user: data.data.user,
                  tokens: data.data.tokens
                });
                // Redirect to the stored redirect URL or home
                router.push(redirectTo || '/');
              } else {
                form.setError('root', { message: data.message || 'Google signup failed' });
              }
            } catch (error: any) {
              const serverResponse = error.response?.data;
              form.setError('root', { message: serverResponse?.message || 'Google signup failed' });
            } finally {
              setIsGoogleLoading(false);
            }
          } else {
            setIsGoogleLoading(false);
            if (response.error) {
              console.error('Google auth error:', response.error);
            }
          }
        },
      });

      client.requestCode();
    } catch (error) {
      console.error('Google signup failed:', error);
      setIsGoogleLoading(false);
      form.setError('root', { message: 'Failed to initialize Google signup' });
    }
  }, [scriptLoaded, router, login, form, redirectTo]);

  // Load Google Identity Services script
  useEffect(() => {
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google script loaded');
      setScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
        {form.formState.errors.root && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20">
            {form.formState.errors.root.message}
          </div>
        )}
        <div className="flex gap-4 pt-4">

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
        </div>

        <FormField control={form.control} name="gender" render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
              {t.gender} <span className="text-red-500">*</span>
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-14 py-6 w-full border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-lg">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem className='py-3' value="male">
                  <div className="flex items-center gap-2">
                    <Mars size={14} />
                    {t.genderMale}
                  </div>
                </SelectItem>
                <SelectItem className='py-3' value="female">
                  <div className="flex items-center gap-2">
                    <Venus size={14} />
                    {t.genderFemale}
                  </div>
                </SelectItem>
                <SelectItem className='py-3' value="prefer_not_to_say">
                  {t.genderPreferNot}
                </SelectItem>
              </SelectContent>
            </Select>
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

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#111114] px-2 text-zinc-500">or</span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <Button
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading}
          variant={"ghost"}
          className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-3"
        >
          {isGoogleLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{t.googleButton}</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function SignupPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = React.use(params);
  const t = signupDict[lang] || signupDict.en;
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

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
          <p className="font-bold text-xl tracking-[0.3em] uppercase opacity-80">{t.brandTagline}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative">
        <Link href={`/${lang}`} className="mb-6"><span className='font-black text-xl'>KYRIOS<span className="text-primary">.</span></span></Link>
        <Card className="w-full max-w-md group rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 bg-white dark:bg-[#111114] relative z-10 shadow-2xl border-none">
          <div className="absolute w-[98%] h-[99%] top-[0.5%] left-[1%] bg-white dark:bg-[#111114] rounded-2xl z-0" />
          <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '4s' }} />
          <div className="relative p-2">
            <CardHeader><CardTitle className="text-3xl font-black">{t.title}</CardTitle><CardDescription>{t.subtitle}</CardDescription></CardHeader>
            <CardContent><SignupForm lang={lang} t={t} redirectTo={redirectTo} /></CardContent>
            <CardFooter className="justify-center border-t border-zinc-100 dark:border-zinc-800/50 mt-2 pt-2 text-sm text-zinc-500">
              {t.hasAccount} <Link href={`/${lang}/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-primary font-bold ml-1 hover:underline">{t.action}</Link>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
}
