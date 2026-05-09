'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import {
    User, ShieldCheck, Camera, Palette, Target,
    BellRing, Eye, EyeOff, Loader2, Clock, Globe, Venus, Mars,
    Smartphone,
    ChevronRight,
    Key,
    CheckCircle2,
    Mail,
    Download,
    Copy,
    CreditCard,
    Calendar,
    Package as PackageIcon,
    AlertCircle,
    XCircle,
    Ban,
    ArrowRight,
    History,
    Zap,
    Check,
    Package
} from 'lucide-react';
import QRCode from 'react-qr-code';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomDialog } from '../../../../widgets/CustomDialog/CustomDialog';
import { ConfirmDialog } from '../../../../widgets/ConfirmDialog/ConfirmDialog';
import { AvatarBuilder } from './AvatarPicker';
import { generateAvatarFromUser } from './avatarHelpers';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';


const profileSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    phone_number: z.string().optional(),
    gender: z.string().optional(),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
});

// ====================== SUBSCRIPTION TYPES ======================

interface Subscription {
    id: string;
    package: {
        id: string;
        name: string;
        price: number;
        currency: string;
        billing_cycle: string;
        description: string;
    };
    status: 'active' | 'trial' | 'cancelled' | 'expired' | 'inactive';
    start_date: string;
    end_date: string | null;
    trial_ends_at: string | null;
    auto_renew: boolean;
    created_at: string;
    updated_at: string;
    cancelled_at?: string;
    cancellation_reason?: string;
}

// ====================== SUBSCRIPTION SECTION ======================

// ====================== SUBSCRIPTION SECTION ======================

// ====================== SUBSCRIPTION SECTION ======================

function SubscriptionSection() {
    const queryClient = useQueryClient();
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isPackagesModalOpen, setIsPackagesModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancellationNote, setCancellationNote] = useState('');
    const [isSubscribing, setIsSubscribing] = React.useState<string | null>(null);


    // Fetch current subscription
    const { data: currentSubscription, isLoading: isLoadingCurrent, refetch: refetchCurrent } = useQuery({
        queryKey: ['my-subscription'],
        queryFn: async () => {
            try {
                const response = await api.get(ENDPOINTS.SUBSCRIPTIONS.MY_SUBSCRIPTION);
                return response.data?.data || response.data;
            } catch (error: any) {
                if (error.response?.status === 400) {
                    return null; // No active subscription
                }
                throw error;
            }
        },
    });

    // Fetch available packages for browsing
    const { data: packagesResponse, isLoading: isLoadingPackages } = useQuery({
        queryKey: [ENDPOINTS.PACKAGES.LIST_PACKAGES],
        queryFn: async () => {
            const response = await api.get(ENDPOINTS.PACKAGES.LIST_PACKAGES, {
                params: { page_size: 50 }
            });
            return response.data?.data || response.data;
        },
    });

    // Fetch subscription history
    const { data: historyResponse, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['subscription-history'],
        queryFn: async () => {
            const response = await api.get(ENDPOINTS.SUBSCRIPTIONS.SUBSCRIPTION_HISTORY);
            return response.data?.data || response.data;
        },
    });

    const packages = packagesResponse?.results || [];
    const subscriptionHistory = historyResponse?.results || [];

    // Subscribe to package
    const handleSubscribe = async (packageId: string) => {
        setIsSubscribing(packageId);
        try {
            const response = await api.post(ENDPOINTS.SUBSCRIPTIONS.SUBSCRIBE, {
                package_id: packageId
            });
            toast.success(response.data?.message || "Successfully subscribed!");
            refetchCurrent();
            queryClient.invalidateQueries({ queryKey: [ENDPOINTS.PACKAGES.LIST_PACKAGES], exact: false })
            setIsPackagesModalOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to subscribe");
        } finally {
            setIsSubscribing(null);
        }
    };

    // Cancel subscription function
    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            const response = await api.post(ENDPOINTS.SUBSCRIPTIONS.CANCEL_SUBSCRIPTION, {
                reason: cancellationReason,
                note: cancellationNote
            });
            toast.success(response.data?.message || "Subscription cancelled successfully");
            refetchCurrent();
            queryClient.invalidateQueries({ queryKey: [ENDPOINTS.PACKAGES.LIST_PACKAGES], exact: false })
            setIsCancelModalOpen(false);
            setCancellationReason('');
            setCancellationNote('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel subscription");
        } finally {
            setIsCancelling(false);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-none">Active</Badge>;
            case 'trial':
                return <Badge className="bg-blue-500/10 text-blue-600 border-none">Trial</Badge>;
            case 'cancelled':
                return <Badge className="bg-rose-500/10 text-rose-600 border-none">Cancelled</Badge>;
            case 'expired':
                return <Badge className="bg-amber-500/10 text-amber-600 border-none">Expired</Badge>;
            default:
                return <Badge className="bg-zinc-500/10 text-zinc-600 border-none">{status}</Badge>;
        }
    };

    const getBillingLabel = (cycle: string) => {
        switch (cycle) {
            case 'monthly': return '/month';
            case 'yearly': return '/year';
            case 'quarterly': return '/quarter';
            case 'lifetime': return ' (Lifetime)';
            default: return '';
        }
    };

    const getDaysRemaining = (endDate: string | null) => {
        if (!endDate) return null;
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (isLoadingCurrent) {
        return (
            <Card className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-xl border-none bg-white dark:bg-[#111114]">
                <div className="absolute w-[calc(100%-4px)] h-[calc(100%-4px)] top-[2px] left-[2px] overflow-hidden bg-white dark:bg-[#111114] rounded-xl z-10" />
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none z-0" style={{ animationDuration: '3s' }} />
                <CardContent className="relative z-20 flex items-center justify-center min-h-[400px]">
                    <Loader2 className="animate-spin text-orange-600" size={32} />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Current Subscription Card */}
            <Card className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-xl border-none bg-white dark:bg-[#111114]">
                <div className="absolute w-[calc(100%-4px)] h-[calc(100%-4px)] top-[2px] left-[2px] overflow-hidden bg-white dark:bg-[#111114] rounded-xl z-10" />
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none z-0" style={{ animationDuration: '3s' }} />

                <div className="relative z-20">
                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-16">
                        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <CreditCard size={20} className="text-orange-600" />
                            Current Subscription
                        </CardTitle>
                        <CardDescription className="text-zinc-500 font-medium">
                            Your active plan and its details
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-8">
                        {currentSubscription ? (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                            <span className="text-sm font-medium text-zinc-500">Plan</span>
                                            <span className="font-bold text-lg">{currentSubscription.package?.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                            <span className="text-sm font-medium text-zinc-500">Price</span>
                                            <span className="font-bold">
                                                {formatPrice(currentSubscription.package?.price, currentSubscription.package?.currency)}
                                                {getBillingLabel(currentSubscription.package?.billing_cycle)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                            <span className="text-sm font-medium text-zinc-500">Status</span>
                                            {getStatusBadge(currentSubscription.status)}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                            <span className="text-sm font-medium text-zinc-500">Started</span>
                                            <span className="font-medium">{formatDate(currentSubscription.start_date)}</span>
                                        </div>
                                        {currentSubscription.trial_ends_at && (
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                                                <span className="text-sm font-medium text-blue-600">Trial Ends</span>
                                                <span className="font-medium text-blue-600">{formatDate(currentSubscription.trial_ends_at)}</span>
                                            </div>
                                        )}
                                        {currentSubscription.end_date && (
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                                                <span className="text-sm font-medium text-amber-600">Expires</span>
                                                <span className="font-medium text-amber-600">
                                                    {formatDate(currentSubscription.end_date)}
                                                    {getDaysRemaining(currentSubscription.end_date) !== null && getDaysRemaining(currentSubscription.end_date)! > 0 && (
                                                        <span className="ml-2 text-xs">
                                                            ({getDaysRemaining(currentSubscription.end_date)} days left)
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {currentSubscription.status === 'active' && (
                                    <div className="pt-4">
                                        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                            <AlertDescription className="text-sm text-amber-600">
                                                Auto-renewal is {currentSubscription.auto_renew ? 'enabled' : 'disabled'}.
                                                {currentSubscription.auto_renew && ' Your subscription will automatically renew at the end of the period.'}
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}

                                <Button
                                    variant="destructive"
                                    onClick={() => setIsCancelModalOpen(true)}
                                    className="w-full md:w-auto bg-rose-600 hover:bg-rose-700"
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? <Loader2 className="animate-spin mr-2" size={16} /> : <Ban size={16} className="mr-2" />}
                                    Cancel Subscription
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CreditCard className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                                <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No Active Subscription</h3>
                                <p className="text-sm text-zinc-500 mt-1">You don't have an active subscription.</p>

                                <Button
                                    asChild
                                    className="mt-4 bg-orange-600 hover:bg-orange-700"

                                ><Link href={'/en/packages'}>
                                        <Package className="mr-2 h-5 w-5" />
                                        Browse Packages
                                    </Link>


                                </Button>
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>

            {/* Subscription History Card */}
            {subscriptionHistory.length > 0 && (
                <Card className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-xl border-none bg-white dark:bg-[#111114]">
                    <div className="absolute w-[calc(100%-4px)] h-[calc(100%-4px)] top-[2px] left-[2px] overflow-hidden bg-white dark:bg-[#111114] rounded-xl z-10" />
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none z-0" style={{ animationDuration: '3s' }} />

                    <div className="relative z-20">
                        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-16">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <History size={20} className="text-orange-600" />
                                Subscription History
                            </CardTitle>
                            <CardDescription className="text-zinc-500 font-medium">
                                Your past subscriptions and plan changes
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-8">
                            <div className="space-y-3">
                                {subscriptionHistory.map((sub: Subscription) => (
                                    <div
                                        key={sub.id}
                                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <PackageIcon size={14} className="text-orange-500" />
                                                    <span className="font-bold text-sm">{sub.package?.name}</span>
                                                    {getStatusBadge(sub.status)}
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                    {formatPrice(sub.package?.price, sub.package?.currency)}
                                                    {getBillingLabel(sub.package?.billing_cycle)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-zinc-500">
                                                    {formatDate(sub.start_date)} → {formatDate(sub.end_date)}
                                                </div>
                                                {sub.cancelled_at && (
                                                    <div className="text-xs text-rose-500 mt-1">
                                                        Cancelled: {formatDate(sub.cancelled_at)}
                                                        {sub.cancellation_reason && ` (${sub.cancellation_reason})`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </div>
                </Card>
            )}

            <div className="text-center mt-12">

                <Button
                    asChild
                    variant="outline"
                    className="rounded-2xl px-8 py-6 text-base font-bold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all"
                ><Link href={'/en/packages'}>
                        <Package className="mr-2 h-5 w-5" />
                        Browse All Subscription Plans
                    </Link>


                </Button>
            </div>

            {/* Cancel Subscription Dialog */}
            <ConfirmDialog
                open={isCancelModalOpen}
                onOpenChange={setIsCancelModalOpen}
                title="Cancel Subscription"
                warning={`Are you sure you want to cancel your "${currentSubscription?.package?.name}" subscription? You will lose access to premium features at the end of your billing period.`}
                confirmText="Cancel Subscription"
                confirmIcon={Ban}
                onConfirm={handleCancelSubscription}
                variant="destructive"
            >
                <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Reason (Optional)</label>
                        <Select value={cancellationReason} onValueChange={setCancellationReason}>
                            <SelectTrigger className="h-12 border-zinc-200 dark:border-zinc-800 rounded-xl">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="too_expensive">Too expensive</SelectItem>
                                <SelectItem value="not_using">Not using enough</SelectItem>
                                <SelectItem value="switching_plan">Switching to another plan</SelectItem>
                                <SelectItem value="technical_issues">Technical issues</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Additional Notes (Optional)</label>
                        <Input
                            placeholder="Tell us how we can improve..."
                            value={cancellationNote}
                            onChange={(e) => setCancellationNote(e.target.value)}
                            className="h-12 border-zinc-200 dark:border-zinc-800 rounded-xl"
                        />
                    </div>
                </div>
            </ConfirmDialog>
        </div>
    );
}

export default function ProfileContent({ lang }: { lang: string }) {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);

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
                <div className={cn(
                    "shrink-0 transition-all duration-500 ease-in-out relative border-r border-zinc-100 dark:border-zinc-800/50",
                    isCollapsed ? "w-14" : "w-full md:w-64"
                )}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-10 z-50 w-6 h-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-orange-600 transition-all shadow-sm active:scale-90"
                    >
                        <ChevronRight className={cn("transition-transform duration-500", !isCollapsed && "rotate-180")} size={12} />
                    </button>

                    <TabsList className={cn(
                        "flex flex-col h-auto w-full bg-transparent space-y-1 p-0 justify-start items-start transition-all duration-500",
                        isCollapsed ? "items-center" : "items-start"
                    )}>

                        {/* Section: Account */}
                        <div className={cn("px-4 py-2 mb-1 transition-opacity duration-300", isCollapsed ? "opacity-0 h-8" : "opacity-100")}>
                            {!isCollapsed && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em] whitespace-nowrap">Account</p>}
                        </div>

                        <TabsTrigger
                            value="personal"
                            className={cn(
                                "gradient-tab w-full flex items-center px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900",
                                isCollapsed ? "justify-center py-6" : "justify-start gap-3"
                            )}
                        >
                            <User size={16} className="shrink-0" />
                            {!isCollapsed && <span className="truncate">Personal Info</span>}
                        </TabsTrigger>

                        <TabsTrigger
                            value="security"
                            className={cn(
                                "gradient-tab w-full flex items-center px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900",
                                isCollapsed ? "justify-center py-6" : "justify-start gap-3"
                            )}
                        >
                            <ShieldCheck size={16} className="shrink-0" />
                            {!isCollapsed && <span className="truncate">Security</span>}
                        </TabsTrigger>

                        {/* Section: Preferences */}
                        <div className={cn("px-4 py-2 mt-6 mb-1 transition-opacity duration-300", isCollapsed ? "opacity-0 h-8" : "opacity-100")}>
                            {!isCollapsed && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em] whitespace-nowrap">Preferences</p>}
                        </div>

                        <TabsTrigger
                            value="display"
                            className={cn(
                                "gradient-tab w-full flex items-center px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900",
                                isCollapsed ? "justify-center py-6" : "justify-start gap-3"
                            )}
                        >
                            <Palette size={16} className="shrink-0" />
                            {!isCollapsed && <span className="truncate">Appearance</span>}
                        </TabsTrigger>

                        <TabsTrigger
                            value="learning"
                            className={cn(
                                "gradient-tab w-full flex items-center px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900",
                                isCollapsed ? "justify-center py-6" : "justify-start gap-3"
                            )}
                        >
                            <Target size={16} className="shrink-0" />
                            {!isCollapsed && <span className="truncate">Study Goals</span>}
                        </TabsTrigger>

                        {/* Section: Billing */}
                        <div className={cn("px-4 py-2 mt-6 mb-1 transition-opacity duration-300", isCollapsed ? "opacity-0 h-8" : "opacity-100")}>
                            {!isCollapsed && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em] whitespace-nowrap">Billing</p>}
                        </div>

                        <TabsTrigger
                            value="subscription"
                            className={cn(
                                "gradient-tab w-full flex items-center px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:hover:bg-zinc-900",
                                isCollapsed ? "justify-center py-6" : "justify-start gap-3"
                            )}
                        >
                            <CreditCard size={16} className="shrink-0" />
                            {!isCollapsed && <span className="truncate">Subscription</span>}
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

                    <TabsContent value="subscription" className="mt-0 outline-none">
                        <SubscriptionSection />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}



function PersonalInfoSection() {
    const queryClient = useQueryClient();
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { updateUser } = useAuth(); // Get updateUser from auth context

    const { data: user, isLoading: isFetching, refetch } = useQuery({
        queryKey: [ENDPOINTS.AUTH.PROFILE],
        queryFn: async () => {
            const response = await api.get(ENDPOINTS.AUTH.PROFILE);
            return response.data?.data || response.data;
        },
    });

    // Generate avatar URL using the unified function
    const avatarUrl = useMemo(() => {
        if (user) {
            return generateAvatarFromUser(user);
        }
        return '';
    }, [user]);

    const updateMutation = useMutation({
        mutationFn: async (updateData: z.infer<typeof profileSchema>) => {
            const { data } = await api.post(ENDPOINTS.AUTH.UPDATE_PROFILE, {
                first_name: updateData.first_name,
                last_name: updateData.last_name,
                phone_number: updateData.phone_number,
                gender: updateData.gender,
            });
            return data;
        },
        onSuccess: (response) => {
            // Update React Query cache
            queryClient.invalidateQueries({ queryKey: [ENDPOINTS.AUTH.PROFILE] });

            // Update local auth context with new user data
            const updatedUserData = response.data?.data || response.data;
            if (updatedUserData) {
                updateUser({
                    first_name: updatedUserData.first_name,
                    last_name: updatedUserData.last_name,
                    phone_number: updatedUserData.phone_number,
                    gender: updatedUserData.gender,
                    avatar_config: updatedUserData.avatar_config,
                });
            }

            setSuccessMessage("Profile updated successfully!");
            setTimeout(() => setSuccessMessage(null), 4000);
        },
        onError: (error: any) => {
            const serverResponse = error.response?.data;
            const globalMessage = serverResponse?.message || "Failed to update profile. Please try again.";
            form.setError('root', { message: globalMessage });
        },
    });

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            phone_number: "",
            gender: "",
        },
    });

    // Reset form when user data loads
    useEffect(() => {
        if (user) {
            form.reset({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                phone_number: user.phone_number || "",
                gender: user.gender || "",
            });
        }
    }, [user, form]);

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
                    <CardDescription className="text-zinc-500 font-medium">Update your name, contact info, and profile photo.</CardDescription>
                </CardHeader>

                <CardContent className="pt-8 space-y-8">
                    <div className="flex items-center gap-6">
                        <div
                            className="relative group/avatar cursor-pointer"
                            onClick={() => setIsAvatarModalOpen(true)}
                        >
                            <Avatar className="w-20 h-20 border-2 border-zinc-100 dark:border-zinc-800 transition-transform active:scale-95">
                                <AvatarImage
                                    src={avatarUrl}
                                    alt="Avatar"
                                />
                                <AvatarFallback className="font-black bg-zinc-100 dark:bg-zinc-800">
                                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all backdrop-blur-[2px]">
                                <Camera className="text-white" size={20} />
                            </div>
                        </div>

                        <CustomDialog
                            title="Update Avatar"
                            description="Customize your avatar with different styles and colors."
                            open={isAvatarModalOpen}
                            onOpenChange={setIsAvatarModalOpen}
                            contentWidth='max-w-[1200px]'
                        >
                            <AvatarBuilder
                                user={user}
                                onSuccess={() => {
                                    setIsAvatarModalOpen(false);
                                    refetch(); // Refresh user data to get new avatar config
                                }}
                            />
                        </CustomDialog>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Email Address</p>
                            <p className="text-sm font-bold text-zinc-500 italic">{user?.email}</p>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center border border-emerald-500/20">
                            {successMessage}
                        </div>
                    )}

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

                            <FormField
                                control={form.control}
                                name="phone_number"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Phone Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Add Your Phone Number"
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
                                name="gender"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Gender</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            disabled={!!field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-xl">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="male">
                                                    <div className="flex items-center gap-2">
                                                        <Mars size={14} />
                                                        Male
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="female">
                                                    <div className="flex items-center gap-2">
                                                        <Venus size={14} />
                                                        Female
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="prefer_not_to_say">
                                                    Prefer not to say
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

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

export function SecuritySection() {
    const { user, updateUser } = useAuth();
    const queryClient = useQueryClient();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 2FA States
    const [twoFactorMethod, setTwoFactorMethod] = useState<'app' | 'email'>('app');
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [setupStep, setSetupStep] = useState<'select' | 'verify'>('select');
    const [verificationCode, setVerificationCode] = useState('');
    const [qrCodeUri, setQrCodeUri] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');

    // Fetch MFA status using React Query
    const { data: mfaData, isLoading: isFetchingMfa } = useQuery({
        queryKey: ['mfa-status'],
        queryFn: async () => {
            const response = await api.get(ENDPOINTS.AUTH.MFA_STATUS);
            return response.data?.data || response.data;
        },
    });

    const is2FAEnabled = mfaData?.mfa_enabled || false;
    const currentMethod = mfaData?.mfa_method;

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
    });

    const newPassword = form.watch("new_password");

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

    const handleUpdatePassword = async (data: z.infer<typeof passwordSchema>) => {
        setIsLoading(true);
        setSuccessMessage(null);
        try {
            await api.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                current_password: data.current_password,
                new_password: data.new_password,
            });
            form.reset();
            setSuccessMessage("Credentials updated successfully.");
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error: any) {
            form.setError('root', { message: error.response?.data?.message || "Update failed." });
        } finally {
            setIsLoading(false);
        }
    };

    // MFA Setup Mutation
    const setupMFAMutation = useMutation({
        mutationFn: async (method: 'app' | 'email') => {
            const response = await api.post(ENDPOINTS.AUTH.MFA_SETUP, { method });
            return response.data?.data || response.data;
        },
        onSuccess: (data) => {
            if (twoFactorMethod === 'app') {
                setQrCodeUri(data.otp_uri);
                setSecretKey(data.secret);
            }
            setSetupStep('verify');
            toast.success(data.message || "Setup initiated. Please verify your code.");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to setup MFA");
        },
    });

    // MFA Verify Mutation
    const verifyMFAMutation = useMutation({
        mutationFn: async (code: string) => {
            const response = await api.post(ENDPOINTS.AUTH.MFA_VERIFY, { code });
            return response.data?.data || response.data;
        },
        onSuccess: (data) => {
            if (data.backup_codes) {
                setBackupCodes(data.backup_codes);
            }

            // Invalidate and refetch MFA status
            queryClient.invalidateQueries({ queryKey: ['mfa-status'] });

            setIsSetupModalOpen(false);
            setSetupStep('select');
            setVerificationCode('');

            // Update user context
            updateUser({
                mfa_enabled: true,
                mfa_method: twoFactorMethod
            });

            if (data.backup_codes) {
                toast.success("MFA enabled! Save your backup codes.", {
                    duration: 10000,
                });
            } else {
                toast.success("MFA enabled successfully!");
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Invalid verification code");
        },
    });

    // MFA Disable Mutation
    const disableMFAMutation = useMutation({
        mutationFn: async (password: string) => {
            const response = await api.post(ENDPOINTS.AUTH.MFA_DISABLE, { password });
            return response.data?.data || response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch MFA status
            queryClient.invalidateQueries({ queryKey: ['mfa-status'] });

            setIsDisableModalOpen(false);
            setDisablePassword('');

            // Update user context
            updateUser({
                mfa_enabled: false,
                mfa_method: undefined
            });

            toast.success("MFA disabled successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to disable MFA");
        },
    });

    const handleSetupMFA = () => {
        setupMFAMutation.mutate(twoFactorMethod);
    };

    const handleVerifyMFA = () => {
        if (!verificationCode) {
            toast.error("Please enter verification code");
            return;
        }
        verifyMFAMutation.mutate(verificationCode);
    };

    const handleDisableMFA = () => {
        if (!disablePassword) {
            toast.error("Please enter your password");
            return;
        }
        disableMFAMutation.mutate(disablePassword);
    };

    const copyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        toast.success("Backup codes copied to clipboard");
    };

    const downloadBackupCodes = () => {
        const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kyrios-backup-codes.txt';
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Backup codes downloaded");
    };

    const handleToggle2FA = (enabled: boolean) => {
        if (enabled) {
            setIsSetupModalOpen(true);
        } else {
            setIsDisableModalOpen(true);
        }
    };

    if (isFetchingMfa) {
        return (
            <Card className="group relative overflow-hidden transition-all duration-500 shadow-xl border-none bg-white dark:bg-[#111114]">
                <CardContent className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="animate-spin text-orange-600" size={32} />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="group relative overflow-hidden transition-all duration-500 shadow-xl border-none bg-white dark:bg-[#111114]">
                <div className="absolute w-[calc(100%-4px)] h-[calc(100%-4px)] top-[2px] left-[2px] overflow-hidden bg-white dark:bg-[#111114] rounded-xl z-10" />
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none z-0" style={{ animationDuration: '3s' }} />

                <div className="relative z-20">
                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-8">
                        <CardTitle className="text-xl font-black tracking-tight">Security</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium">Protect your workspace with advanced access controls.</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-10 flex flex-col lg:flex-row gap-8 lg:gap-12">

                        {/* LEFT: 2FA CONTROL */}
                        <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="text-orange-600" size={16} />
                                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Multi-Factor Auth</span>
                                </div>

                                <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold">2FA Authorization</h4>
                                            <p className="text-[11px] text-zinc-500 leading-relaxed">
                                                {is2FAEnabled
                                                    ? `Your account is protected with 2-factor authentication using ${currentMethod === 'app' ? 'Authenticator App' : 'Email'}.`
                                                    : "Enable an additional layer of verification to access your account."}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={is2FAEnabled}
                                            onCheckedChange={handleToggle2FA}
                                            className="data-[state=checked]:bg-orange-600"
                                        />
                                    </div>

                                    {!is2FAEnabled && (
                                        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Select Method</span>
                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    onClick={() => setTwoFactorMethod('app')}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                                        twoFactorMethod === 'app'
                                                            ? "bg-white dark:bg-zinc-800 border-orange-600 shadow-sm ring-1 ring-orange-600"
                                                            : "bg-transparent border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", twoFactorMethod === 'app' ? "bg-orange-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500")}>
                                                        <Smartphone size={16} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[11px] font-bold">Authenticator App</p>
                                                        <p className="text-[9px] text-zinc-500">Google Auth, Authy, etc.</p>
                                                    </div>
                                                    {twoFactorMethod === 'app' && <CheckCircle2 size={14} className="text-orange-600" />}
                                                </button>

                                                <button
                                                    onClick={() => setTwoFactorMethod('email')}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                                        twoFactorMethod === 'email'
                                                            ? "bg-white dark:bg-zinc-800 border-orange-600 shadow-sm ring-1 ring-orange-600"
                                                            : "bg-transparent border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", twoFactorMethod === 'email' ? "bg-orange-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500")}>
                                                        <Mail size={16} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[11px] font-bold">Email Code</p>
                                                        <p className="text-[9px] text-zinc-500">Sent to {user?.email?.replace(/(.{2})(.*)(@)/, '$1***$3')}</p>
                                                    </div>
                                                    {twoFactorMethod === 'email' && <CheckCircle2 size={14} className="text-orange-600" />}
                                                </button>
                                            </div>

                                            <Button
                                                onClick={handleSetupMFA}
                                                disabled={setupMFAMutation.isPending}
                                                className="w-full mt-2 h-10 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl"
                                            >
                                                {setupMFAMutation.isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : "Enable 2FA"}
                                            </Button>
                                        </div>
                                    )}

                                    {is2FAEnabled && (
                                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                            <Alert className="bg-emerald-500/10 border-emerald-500/20">
                                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                                <AlertDescription className="text-[11px] text-emerald-600">
                                                    2FA is active using {currentMethod === 'app' ? 'Authenticator App' : 'Email'} method.
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Safety Guidelines</span>
                                <ul className="space-y-2">
                                    {[
                                        "App-based TOTP is recommended over Email.",
                                        "Codes expire after 30 seconds for security.",
                                        "Never share your 2FA codes with anyone.",
                                        is2FAEnabled && "Keep your backup codes in a safe place."
                                    ].filter(Boolean).map((tip, i) => (
                                        <li key={i} className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                                            <ChevronRight size={10} className="text-orange-600" /> {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* RIGHT: PASSWORD CHANGE */}
                        <div className="flex-[1.2] lg:border-l lg:border-zinc-100 lg:dark:border-zinc-800/50 lg:pl-12">
                            <div className="flex items-center gap-2 mb-6">
                                <Key className="text-orange-600" size={16} />
                                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Update Credentials</span>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleUpdatePassword)} className="space-y-5">
                                    {successMessage && (
                                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black text-center border border-emerald-500/20 uppercase tracking-widest">
                                            {successMessage}
                                        </div>
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="current_password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Current Password</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input type={showCurrentPassword ? "text" : "password"} {...field} className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-orange-600 rounded-xl pr-10" />
                                                    </FormControl>
                                                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-3.5 text-zinc-400 hover:text-orange-600 transition-colors">
                                                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="new_password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <div className="flex justify-between items-end">
                                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">New Password</FormLabel>
                                                    {newPassword && <span className="text-[9px] font-black uppercase text-orange-600">{strengthLabel}</span>}
                                                </div>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input type={showNewPassword ? "text" : "password"} {...field} className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-orange-600 rounded-xl pr-10" />
                                                    </FormControl>
                                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3.5 text-zinc-400 hover:text-orange-600 transition-colors">
                                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {newPassword && (
                                                    <div className="flex gap-1 h-1 mt-2">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <div key={s} className={`h-full flex-1 rounded-full transition-all duration-500 ${strength >= s ? strengthColor : "bg-zinc-100 dark:bg-zinc-800"}`} />
                                                        ))}
                                                    </div>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirm_password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type={showNewPassword ? "text" : "password"} {...field} className="h-12 border-zinc-200 dark:border-zinc-800 focus-visible:ring-orange-600 rounded-xl" />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" disabled={isLoading} className="h-14 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 font-black uppercase tracking-[0.3em] text-[10px] rounded-xl w-full hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-lg shadow-zinc-900/10">
                                        {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : "Authorize Update"}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </CardContent>
                </div>
            </Card>

            {/* MFA Setup Modal - Using CustomDialog */}
            <CustomDialog
                title={setupStep === 'select' ? "Enable 2FA" : "Verify Setup"}
                description={setupStep === 'select'
                    ? "Choose your preferred method for two-factor authentication."
                    : "Enter the verification code to complete setup."}
                open={isSetupModalOpen}
                onOpenChange={setIsSetupModalOpen}
                contentWidth="max-w-md"
            >
                {setupStep === 'select' && (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setTwoFactorMethod('app')}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all text-center",
                                    twoFactorMethod === 'app'
                                        ? "border-orange-600 bg-orange-50 dark:bg-orange-950/20"
                                        : "border-zinc-200 dark:border-zinc-800"
                                )}
                            >
                                <Smartphone className="mx-auto mb-2" size={24} />
                                <p className="text-sm font-bold">App</p>
                                <p className="text-[10px] text-zinc-500">Authenticator</p>
                            </button>
                            <button
                                onClick={() => setTwoFactorMethod('email')}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all text-center",
                                    twoFactorMethod === 'email'
                                        ? "border-orange-600 bg-orange-50 dark:bg-orange-950/20"
                                        : "border-zinc-200 dark:border-zinc-800"
                                )}
                            >
                                <Mail className="mx-auto mb-2" size={24} />
                                <p className="text-sm font-bold">Email</p>
                                <p className="text-[10px] text-zinc-500">Verification Code</p>
                            </button>
                        </div>
                        <Button onClick={handleSetupMFA} disabled={setupMFAMutation.isPending} className="w-full bg-orange-600 hover:bg-orange-700">
                            {setupMFAMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : "Continue"}
                        </Button>
                    </div>
                )}

                {setupStep === 'verify' && twoFactorMethod === 'app' && (
                    <div className="space-y-4 py-4">
                        <div className="flex justify-center">
                            {qrCodeUri && (
                                <div className="p-4 bg-white rounded-xl">
                                    <QRCode value={qrCodeUri} size={200} />
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-zinc-500 mb-2">Or enter this code manually:</p>
                            <code className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono">
                                {secretKey}
                            </code>
                        </div>
                        <Input
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="text-center text-lg font-mono"
                            maxLength={6}
                        />
                        <Button onClick={handleVerifyMFA} disabled={verifyMFAMutation.isPending} className="w-full bg-orange-600 hover:bg-orange-700">
                            {verifyMFAMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : "Verify & Enable"}
                        </Button>
                    </div>
                )}

                {setupStep === 'verify' && twoFactorMethod === 'email' && (
                    <div className="space-y-4 py-4">
                        <Alert>
                            <Mail className="h-4 w-4" />
                            <AlertDescription>
                                A verification code has been sent to {user?.email}
                            </AlertDescription>
                        </Alert>
                        <Input
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="text-center text-lg font-mono"
                            maxLength={6}
                        />
                        <Button onClick={handleVerifyMFA} disabled={verifyMFAMutation.isPending} className="w-full bg-orange-600 hover:bg-orange-700">
                            {verifyMFAMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : "Verify & Enable"}
                        </Button>
                    </div>
                )}

                {backupCodes.length > 0 && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-sm font-bold mb-2">⚠️ Save your backup codes</p>
                        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                            {backupCodes.map((code, i) => (
                                <div key={i} className="bg-white dark:bg-zinc-900 p-2 rounded text-center">
                                    {code}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm" onClick={copyBackupCodes} className="flex-1">
                                <Copy size={14} className="mr-2" /> Copy
                            </Button>
                            <Button variant="outline" size="sm" onClick={downloadBackupCodes} className="flex-1">
                                <Download size={14} className="mr-2" /> Download
                            </Button>
                        </div>
                    </div>
                )}
            </CustomDialog>

            {/* Disable MFA Modal - Using CustomDialog */}
            <CustomDialog
                title="Disable 2FA"
                description="Enter your password to confirm disabling two-factor authentication."
                open={isDisableModalOpen}
                onOpenChange={setIsDisableModalOpen}
                contentWidth="max-w-md"
            >
                <div className="space-y-4 py-4">
                    <Input
                        type="password"
                        placeholder="Enter your password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        className="h-12"
                    />
                    <Button
                        onClick={handleDisableMFA}
                        disabled={disableMFAMutation.isPending}
                        variant="destructive"
                        className="w-full"
                    >
                        {disableMFAMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : "Disable 2FA"}
                    </Button>
                </div>
            </CustomDialog>
        </>
    );
}

function AppearanceSection({ lang, theme, setTheme }: {
    lang: string;
    theme: string | undefined;
    setTheme: (theme: string) => void;
}) {
    return (
        <Card className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-xl border-none bg-white dark:bg-[#111114]">
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
