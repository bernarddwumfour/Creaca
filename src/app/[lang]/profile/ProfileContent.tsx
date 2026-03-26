"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import {
    User, ShieldCheck, Camera, Palette, Target,
    BellRing, Eye, EyeOff, Loader2, Clock, Globe
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ====================== SCHEMAS ======================
const profileSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
});

// ====================== SUB-COMPONENTS ======================

function PersonalInfoSection() {
    const queryClient = useQueryClient();   // For invalidation after update

    const { data: user, isLoading: isFetching } = useQuery({
        queryKey: [ENDPOINTS.AUTH.PROFILE],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.AUTH.PROFILE); // Adjust endpoint as needed
            return data?.data || data;           // Adjust based on your API response structure
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (updateData: z.infer<typeof profileSchema>) => {
            const { data } = await api.post(ENDPOINTS.AUTH.UPDATE_PROFILE, {
                first_name: updateData.first_name,
                last_name: updateData.last_name,
            });
            return data;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [ENDPOINTS.AUTH.PROFILE] });


            setSuccessMessage("Profile updated successfully!");
            setTimeout(() => setSuccessMessage(null), 4000);
        },
        onError: (error: any) => {
            const serverResponse = error.response?.data;

            if (serverResponse?.errors && Array.isArray(serverResponse.errors)) {
                serverResponse.errors.forEach((err: any) => {
                    const field = err.field === 'first_name' ? 'first_name' :
                        err.field === 'last_name' ? 'last_name' : null;
                    if (field) {
                        form.setError(field as any, { message: err.message });
                    }
                });
            }

            const globalMessage = serverResponse?.message || "Failed to update profile. Please try again.";
            form.setError('root', { message: globalMessage });
        },
    });

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
        },
    });

    // Reset form when user data loads
    React.useEffect(() => {
        if (user) {
            form.reset({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
            });
        }
    }, [user, form]);

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const onSubmit = (data: z.infer<typeof profileSchema>) => {
        updateMutation.mutate(data);
    };

    return (
        <Card className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-xl border-none bg-white dark:bg-[#111114]">
            <div className="absolute w-[calc(100%-4px)] h-[calc(100%-4px)] top-[2px] left-[2px] overflow-hidden bg-white dark:bg-[#111114] rounded-xl z-10" />
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none z-0"
                style={{ animationDuration: '3s' }} />

            <div className="relative z-20">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-16">
                    <CardTitle className="text-xl font-black tracking-tight">Personal Information</CardTitle>
                    <CardDescription className="text-zinc-500 font-medium">Update your name and profile photo.</CardDescription>
                </CardHeader>

                <CardContent className="pt-8 space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="relative group/avatar cursor-pointer">
                            <Avatar className="w-20 h-20 border-2 border-zinc-100 dark:border-zinc-800">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                <AvatarFallback className="font-black">
                                    {user?.first_name?.[0]}{user?.last_name?.[0] || "BN"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all backdrop-blur-[2px]">
                                <Camera className="text-white" size={20} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Email Address</p>
                            <p className="text-sm font-bold text-zinc-500 italic">{user?.email}</p>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center border border-emerald-500/20">
                            {successMessage}
                        </div>
                    )}

                    {/* Global Error */}
                    {form.formState.errors.root && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">First Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isFetching}
                                                    className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Last Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isFetching}
                                                    className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={updateMutation.isPending || isFetching}
                                className="w-full md:w-auto h-12 px-10 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 font-bold rounded-xl text-white"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} />
                                        Saving Changes...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </div>
        </Card>
    );
}

function SecuritySection() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);   // ← New state

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
    });

    const newPassword = form.watch("new_password");

    // Password Strength Calculator (Same as Signup)
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

    const strength = getStrength(newPassword);
    const strengthColor = ["bg-zinc-200", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"][strength];
    const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong", "Excellent"][strength];

    // Handle Password Update
    const handleUpdatePassword = async (data: z.infer<typeof passwordSchema>) => {
        setIsLoading(true);
        setSuccessMessage(null);        // Clear previous success message

        try {
            const response = await api.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                current_password: data.current_password,
                new_password: data.new_password,
            });

            console.log("Password updated successfully", response.data);

            // Success handling
            form.reset();
            setShowCurrentPassword(false);
            setShowNewPassword(false);

            setSuccessMessage("Password updated successfully!");   // ← Show success

            // Optional: Auto-hide success message after 4 seconds
            setTimeout(() => setSuccessMessage(null), 4000);

        } catch (error: any) {
            const serverResponse = error.response?.data;

            if (serverResponse?.errors && Array.isArray(serverResponse.errors)) {
                serverResponse.errors.forEach((err: any) => {
                    const fieldMap: Record<string, string> = {
                        current_password: "current_password",
                        new_password: "new_password",
                        confirm_password: "confirm_password"
                    };
                    const field = fieldMap[err.field];
                    if (field) {
                        form.setError(field as any, { message: err.message });
                    }
                });
            }

            const globalMessage = serverResponse?.message || "Failed to update password. Please try again.";
            form.setError('root', { message: globalMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-xl border-none bg-white dark:bg-[#111114]">
            <div className="absolute w-[calc(100%-4px)] h-[calc(100%-4px)] top-[2px] left-[2px] overflow-hidden bg-white dark:bg-[#111114] rounded-xl z-10" />
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none z-0"
                style={{ animationDuration: '3s' }} />

            <div className="relative z-20">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-16">
                    <CardTitle className="text-xl font-black tracking-tight">Security Settings</CardTitle>
                    <CardDescription className="text-zinc-500 font-medium">Update your password to keep your account safe.</CardDescription>
                </CardHeader>

                <CardContent className="pt-8 space-y-6 max-w-md">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleUpdatePassword)} className="space-y-6">

                            {/* SUCCESS MESSAGE - New */}
                            {successMessage && (
                                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center border border-emerald-500/20">
                                    {successMessage}
                                </div>
                            )}

                            {/* Global Error Message */}
                            {form.formState.errors.root && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20">
                                    {form.formState.errors.root.message}
                                </div>
                            )}

                            {/* Current Password */}
                            <FormField
                                control={form.control}
                                name="current_password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                            Current Password
                                        </FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    {...field}
                                                    className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl pr-10"
                                                />
                                            </FormControl>
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
                                            >
                                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            {/* New Password with Strength */}
                            <FormField
                                control={form.control}
                                name="new_password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <div className="flex justify-between items-end">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                                New Password
                                            </FormLabel>
                                            {newPassword && (
                                                <span className="text-[9px] font-black uppercase opacity-60">
                                                    {strengthLabel}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    {...field}
                                                    className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl pr-10"
                                                />
                                            </FormControl>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>

                                        {newPassword && (
                                            <div className="flex gap-1 h-1 mt-2">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <div
                                                        key={s}
                                                        className={`h-full flex-1 rounded-full transition-all duration-500 ${strength >= s ? strengthColor : "bg-zinc-100 dark:bg-zinc-800"}`}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            {/* Confirm New Password */}
                            <FormField
                                control={form.control}
                                name="confirm_password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                            Confirm New Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                                className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl pr-10"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-12 px-10 font-bold rounded-xl w-full md:w-auto bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-primary transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} />
                                        Updating Password...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </div>
        </Card>
    );
}


function AppearanceSection({ lang, theme, setTheme }: {
    lang: string;
    theme: string | undefined;
    setTheme: (theme: string) => void;
}) {
    return (
        <Card className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-xl border-none bg-white dark:bg-[#111114]">
            {/* Same animated overlay as above */}
            <div className="absolute w-[calc(100%-4px)] h-[calc(100%-4px)] top-[2px] left-[2px] overflow-hidden bg-white dark:bg-[#111114] rounded-xl z-10" />
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none z-0"
                style={{ animationDuration: '3s' }} />

            <div className="relative z-20">
                <CardHeader className="mb-12">
                    <CardTitle className="text-xl font-black tracking-tight">Appearance</CardTitle>
                    <CardDescription>Customize how Kyrios looks on your device.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                        <div className="space-y-1">
                            <p className="text-sm font-bold tracking-tight">Theme Mode</p>
                            <p className="text-xs text-zinc-500">Switch between light and dark UI.</p>
                        </div>
                        <Tabs value={theme} onValueChange={setTheme} className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                            <TabsList className="bg-transparent h-auto p-0 gap-1">
                                <TabsTrigger value="light" className="gradient-tab rounded-lg text-[10px] font-black h-8 px-4 border-none shadow-none">LIGHT</TabsTrigger>
                                <TabsTrigger value="dark" className="gradient-tab rounded-lg text-[10px] font-black h-8 px-4 border-none shadow-none">DARK</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                        <div className="space-y-1">
                            <p className="text-sm font-bold tracking-tight">Preferred Language</p>
                            <p className="text-xs text-zinc-500">The language used for UI and AI tutoring.</p>
                        </div>
                        <Select defaultValue={lang}>
                            <SelectTrigger className="w-40 h-11 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English (US)</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

// 4. Study Goals Component
function StudyGoalsSection() {
    return (
        <Card className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-xl border-none bg-white dark:bg-[#111114]">
            <div className="absolute w-[calc(100%-4px)] h-[calc(100%-4px)] top-[2px] left-[2px] overflow-hidden bg-white dark:bg-[#111114] rounded-xl z-10" />
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none z-0"
                style={{ animationDuration: '3s' }} />

            <div className="relative z-20">
                <CardHeader className="mb-12">
                    <CardTitle className="text-xl font-black tracking-tight">Study Commitment</CardTitle>
                    <CardDescription>Set targets to help the AI tailor your experience.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                <Clock size={12} /> Daily Study Goal
                            </label>
                            <div className="flex items-center gap-3">
                                <Input type="number" defaultValue="2" className="w-24 h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl font-black text-center" />
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Hrs</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                <BellRing size={12} /> Reminder Time
                            </label>
                            <Input type="time" defaultValue="19:00" className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl px-4 font-bold" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Proficiency Level</label>
                        <Select defaultValue="intermediate">
                            <SelectTrigger className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Undergraduate</SelectItem>
                                <SelectItem value="intermediate">Postgraduate</SelectItem>
                                <SelectItem value="advanced">Research Professional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

// ====================== MAIN COMPONENT ======================
export default function ProfileContent({ lang }: { lang: string }) {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();

    // API handlers (implement these with your actual API calls)
    const handleUpdateProfile = async (data: z.infer<typeof profileSchema>) => {
        console.log("Updating profile:", data);
        // TODO: Call your update profile API here
        // Example: await api.patch('/user/profile', data);
    };

    const handleUpdatePassword = async (data: z.infer<typeof passwordSchema>) => {
        console.log("Updating password:", data);
        // TODO: Call your update password API here
        // Example: await api.post('/auth/change-password', data);
    };

    return (
        <div className="w-full mx-auto">
            <style jsx global>{`
                .gradient-tab[data-state=active] {
                    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%) !important;
                    color: white !important;
                }
            `}</style>

            <Tabs defaultValue="personal" className="flex flex-col md:!flex-row gap-8 items-start">
                {/* NAVIGATION SIDEBAR */}
                <div className="w-full md:w-64 shrink-0">
                    <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1 p-0 justify-start items-start">
                        <div className="px-4 py-2 mb-1">
                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">Account</p>
                        </div>
                        <TabsTrigger value="personal" className="gradient-tab w-full justify-start gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900">
                            <User size={16} /> Personal Info
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gradient-tab w-full justify-start gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900">
                            <ShieldCheck size={16} /> Security
                        </TabsTrigger>

                        <div className="px-4 py-2 mt-6 mb-1">
                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">Preferences</p>
                        </div>
                        <TabsTrigger value="display" className="gradient-tab w-full justify-start gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900">
                            <Palette size={16} /> Appearance
                        </TabsTrigger>
                        <TabsTrigger value="learning" className="gradient-tab w-full justify-start gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900">
                            <Target size={16} /> Study Goals
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 w-full">
                    <TabsContent value="personal" className="mt-0 outline-none">
                        <PersonalInfoSection />
                    </TabsContent>

                    <TabsContent value="security" className="mt-0 outline-none">
                        <SecuritySection />
                    </TabsContent>

                    <TabsContent value="display" className="mt-0 outline-none">
                        <AppearanceSection lang={lang} theme={theme} setTheme={setTheme} />
                    </TabsContent>

                    <TabsContent value="learning" className="mt-0 outline-none">
                        <StudyGoalsSection />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}