'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { Moon, Sun, Loader2, CheckCircle2, Eye, EyeOff, ShieldCheck, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Lang } from '@/lib/dictionary/dictionary';

import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { CustomDialog } from '../../../../../widgets/CustomDialog/CustomDialog';

declare global {
  interface Window {
    google: any;
  }
}

const loginDict = {
  en: {
    title: "Welcome Back",
    subtitle: "Log in to continue your AI-guided math journey.",
    success: "Account created! You can now log in.",
    email: "Email Address",
    password: "Password",
    button: "Sign In",
    googleButton: "Sign in with Google",
    noAccount: "Don't have an account?",
    action: "Create one for free",
    forgot: "Forgot password?",
    error: "Invalid email or password",
    mfaTitle: "Two-Factor Authentication",
    mfaDescription: "Enter the verification code from your authenticator app or email.",
    mfaCode: "Verification Code",
    mfaButton: "Verify",
    mfaResend: "Resend Code",
    mfaError: "Invalid verification code",
    mfaSendError: "Failed to send verification code",
    emailNotVerified: "Email Not Verified",
    emailNotVerifiedDesc: "Please verify your email address to continue. Check your inbox for the verification link.",
    resendVerification: "Resend Verification Email",
    verificationSent: "Verification email sent! Please check your inbox.",
    resendError: "Failed to resend verification email",
    checkSpam: "Didn't receive the email? Check your spam folder or request a new one.",
    verifyLater: "Verify Later"
  },
  fr: {
    title: "Bon retour",
    subtitle: "Connectez-vous pour continuer votre parcours.",
    success: "Compte créé ! Vous pouvez maintenant vous connecter.",
    email: "Adresse Email",
    password: "Mot de passe",
    button: "Se connecter",
    googleButton: "Se connecter avec Google",
    noAccount: "Pas de compte ?",
    action: "Créez-en un gratuitement",
    forgot: "Mot de passe oublié ?",
    error: "Email ou mot de passe incorrect",
    mfaTitle: "Authentification à deux facteurs",
    mfaDescription: "Entrez le code de vérification de votre application d'authentification ou email.",
    mfaCode: "Code de vérification",
    mfaButton: "Vérifier",
    mfaResend: "Renvoyer le code",
    mfaError: "Code de vérification invalide",
    mfaSendError: "Échec de l'envoi du code de vérification",
    emailNotVerified: "Email non vérifié",
    emailNotVerifiedDesc: "Veuillez vérifier votre adresse email pour continuer. Vérifiez votre boîte de réception pour le lien de vérification.",
    resendVerification: "Renvoyer l'email de vérification",
    verificationSent: "Email de vérification envoyé ! Veuillez vérifier votre boîte de réception.",
    resendError: "Échec de l'envoi de l'email de vérification",
    checkSpam: "Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam ou demandez un nouveau lien.",
    verifyLater: "Vérifier plus tard"
  },
  es: {
    title: "Bienvenido",
    subtitle: "Inicia sesión para continuar tu camino.",
    success: "¡Cuenta creada! Ahora puedes iniciar sesión.",
    email: "Correo Electrónico",
    password: "Contraseña",
    button: "Entrar",
    googleButton: "Iniciar sesión con Google",
    noAccount: "¿No tienes cuenta?",
    action: "Crea una gratis",
    forgot: "¿Olvidaste tu contraseña?",
    error: "Correo o contraseña no válidos",
    mfaTitle: "Autenticación de dos factores",
    mfaDescription: "Ingresa el código de verificación de tu aplicación de autenticación o correo electrónico.",
    mfaCode: "Código de verificación",
    mfaButton: "Verificar",
    mfaResend: "Reenviar código",
    mfaError: "Código de verificación inválido",
    mfaSendError: "Error al enviar el código de verificación",
    emailNotVerified: "Correo no verificado",
    emailNotVerifiedDesc: "Por favor verifica tu correo electrónico para continuar. Revisa tu bandeja de entrada para el enlace de verificación.",
    resendVerification: "Reenviar correo de verificación",
    verificationSent: "¡Correo de verificación enviado! Revisa tu bandeja de entrada.",
    resendError: "Error al reenviar el correo de verificación",
    checkSpam: "¿No recibiste el correo? Revisa tu carpeta de spam o solicita uno nuevo.",
    verifyLater: "Verificar después"
  }
};

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const mfaSchema = z.object({
  code: z.string().min(6, "Code must be 6 digits").max(6, "Code must be 6 digits"),
});

function LoginForm({ lang, t }: { lang: Lang, t: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMFARequired, setIsMFARequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState<number | null>(null);
  const [mfaMethod, setMfaMethod] = useState<'app' | 'email'>('app');
  const [isMfaLoading, setIsMfaLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Email verification states
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  const { login } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mfaForm = useForm<z.infer<typeof mfaSchema>>({
    resolver: zodResolver(mfaSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    setResendSuccess(false);
    setResendError('');

    try {
      const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, values);

      if (data.status === 'success') {
        const isNotVerified = data.data?.email_verified === false || data.data?.user?.email_verified === false;

        if (data.data?.requires_mfa) {
          setIsMFARequired(true);
          setMfaUserId(data.data.user_id);
          setMfaMethod(data.data.mfa_method);

          if (data.data.mfa_method === 'email') {
            await sendMfaCode(data.data.user_id);
          }
          setIsLoading(false);
          return;
        }

        if (isNotVerified) {
          setUnverifiedEmail(values.email);
          setShowVerificationPrompt(true);
          setIsLoading(false);
          return;
        }

        login({
          user: data.data.user,
          tokens: data.data.tokens
        });
        router.push('/');
      } else {
        form.setError('root', { message: data.message || t.error });
      }
    } catch (error: any) {
      const serverResponse = error.response?.data;
      const msg = serverResponse?.message || "Failed to login";
      form.setError('root', { message: typeof msg === 'string' ? msg : "Failed to login" });
    } finally {
      setIsLoading(false);
    }
  }

  // FIXED: Google login using authorization code flow
  const handleGoogleLogin = useCallback(() => {
    if (!scriptLoaded || !window.google) {
      console.error('Google script not loaded');
      return;
    }

    setIsGoogleLoading(true);

    try {
      // Use the authorization code flow (not ID token)
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        ux_mode: 'popup',
        callback: async (response: any) => {
          if (response.code) {
            // Send the authorization code to your backend
            try {
              const { data } = await api.post(ENDPOINTS.AUTH.GOOGLE, {
                code: response.code
              });

              if (data.status === 'success') {
                const isNotVerified = data.data?.email_verified === false || data.data?.user?.email_verified === false;

                if (isNotVerified) {
                  setUnverifiedEmail(data.data.user.email);
                  setShowVerificationPrompt(true);
                  setIsGoogleLoading(false);
                  return;
                }

                login({
                  user: data.data.user,
                  tokens: data.data.tokens
                });
                router.push('/');
              } else {
                form.setError('root', { message: data.message || t.error });
              }
            } catch (error: any) {
              const serverResponse = error.response?.data;
              const msg = serverResponse?.message || "Google login failed";
              form.setError('root', { message: msg });
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
      console.error('Google login failed:', error);
      setIsGoogleLoading(false);
      form.setError('root', { message: 'Failed to initialize Google login' });
    }
  }, [scriptLoaded, router, login, form, t.error]);

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setResendError('');
    try {
      await api.post(ENDPOINTS.AUTH.RESEND_VERIFICATION, { email: unverifiedEmail });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      const serverResponse = error.response?.data;
      setResendError(serverResponse?.message || t.resendError);
      setTimeout(() => setResendError(''), 5000);
    } finally {
      setResendLoading(false);
    }
  };

  const sendMfaCode = async (userId: number) => {
    setResendLoading(true);
    try {
      await api.post(ENDPOINTS.AUTH.MFA_SEND_EMAIL_CODE, { user_id: userId });
    } catch (error: any) {
      console.error('Failed to send MFA code:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const handleMfaVerify = async (values: z.infer<typeof mfaSchema>) => {
    if (!mfaUserId) return;
    setIsMfaLoading(true);
    setMfaError(null);
    try {
      const { data } = await api.post(ENDPOINTS.AUTH.MFA_VERIFY_LOGIN, {
        user_id: mfaUserId,
        code: values.code
      });
      if (data.status === 'success') {
        login({
          user: data.data.user,
          tokens: data.data.tokens
        });
        router.push('/');
      } else {
        setMfaError(data.message || t.mfaError);
        mfaForm.setError('code', { message: data.message || t.mfaError });
      }
    } catch (error: any) {
      const serverResponse = error.response?.data;
      const msg = serverResponse?.message || t.mfaError;
      setMfaError(msg);
      mfaForm.setError('code', { message: msg });
    } finally {
      setIsMfaLoading(false);
    }
  };

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

  // Debug: Check if client ID is set
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in environment variables');
    } else {
      console.log('Google Client ID is set');
    }
  }, []);

  return (
    <>
      {/* EMAIL VERIFICATION MODAL */}
      <CustomDialog
        title={t.emailNotVerified}
        description={t.emailNotVerifiedDesc}
        open={showVerificationPrompt}
        onOpenChange={setShowVerificationPrompt}
        contentWidth="max-w-md"
      >
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Mail className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="w-full space-y-3">
            {resendSuccess && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  {t.verificationSent}
                </AlertDescription>
              </Alert>
            )}

            {resendError && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                <AlertDescription className="text-xs">{resendError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="w-full h-12 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 font-bold rounded-xl"
            >
              {resendLoading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" size={16} />}
              {t.resendVerification}
            </Button>

            <Button asChild variant="ghost" className="w-full font-bold">
              <Link href={"/"}>
                {t.verifyLater}
              </Link>
            </Button>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-tight">
            {t.checkSpam}
          </p>
        </div>
      </CustomDialog>

      {/* MFA MODAL */}
      <CustomDialog
        title={t.mfaTitle}
        description={t.mfaDescription}
        open={isMFARequired}
        onOpenChange={() => { }}
        contentWidth="max-w-md"
      >
        <Form {...mfaForm}>
          <form onSubmit={mfaForm.handleSubmit(handleMfaVerify)} className="space-y-4 py-4">
            {mfaError && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription className="text-xs">{mfaError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={mfaForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t.mfaCode}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="000000" className="h-12 text-center text-lg font-mono tracking-widest" maxLength={6} autoFocus />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            {mfaMethod === 'email' && (
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={async () => await sendMfaCode(mfaUserId!)} disabled={resendLoading} className="text-xs">
                  {resendLoading ? <Loader2 className="animate-spin mr-1" size={12} /> : t.mfaResend}
                </Button>
              </div>
            )}
            <Button type="submit" disabled={isMfaLoading} className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl">
              {isMfaLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : t.mfaButton}
            </Button>
          </form>
        </Form>
      </CustomDialog>

      {/* MAIN LOGIN FORM */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
          {isRegistered && !form.formState.errors.root && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> {t.success}
            </div>
          )}
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
                    <Input {...field} type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl pr-10" />
                  </FormControl>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage className="text-[10px]" />
                <div className="flex justify-end pt-1">
                  <Link href={`/${lang}/forgot-password`} className="text-[11px] font-bold text-primary hover:underline uppercase tracking-tighter">{t.forgot}</Link>
                </div>
              </FormItem>
            )}
          />
          <Button disabled={isLoading} className="w-full h-12 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-primary dark:hover:bg-primary font-bold transition-all text-md rounded-xl text-white">
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

          {/* Google Sign-In Button - Manual Button */}
          <Button
            onClick={handleGoogleLogin}
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
    </>
  );
}

export default function LoginPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = React.use(params);
  const t = loginDict[lang] || loginDict.en;
  const { theme, setTheme } = useTheme();

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
        <Link href={`/${lang}`}><span className='font-black text-xl'>KYRIOS<span className="text-primary">.</span></span></Link>
        <Card className="w-full max-w-md group rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-[#111114] relative z-10 shadow-xl border-none">
          <div className="absolute w-[98%] h-[98.5%] top-[0.75%] left-[1%] overflow-hidden bg-white dark:bg-[#111114] rounded-xl " />
          <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '3s' }} />
          <div className="relative space-y-6">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight">{t.title}</CardTitle>
              <CardDescription className="text-zinc-500 font-medium">{t.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <React.Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>}>
                <LoginForm lang={lang} t={t} />
              </React.Suspense>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-center text-zinc-500 font-medium">
                {t.noAccount}{' '}
                <Link href={`/${lang}/signup`} className="text-primary font-bold hover:underline">{t.action}</Link>
              </p>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
}