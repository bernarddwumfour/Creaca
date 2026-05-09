'use client'

import React from 'react';
import { Check, Clock, Loader2, Package as PackageIcon, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Package } from '../components/Package';
import { ENDPOINTS } from '@/lib/endpoints';



interface Package {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    original_price: string | null;
    currency: string;
    billing_cycle: 'monthly' | 'yearly' | 'one_time';
    trial_days: number | null;
    has_trial: boolean;
    has_discount: boolean;
    discount_percentage: number | null;
    is_featured: boolean;
    badge_text: string | null;
    display_order: number;
    is_unlimited: boolean;
    max_courses: number | null;
    max_students: number | null;
    includes_certificate: boolean;
    can_download_materials: boolean;
    includes_video_lessons: boolean;
    video_quality: string | null;
    text_to_audio: boolean;
    audio_to_text: boolean;
    audio_minutes_per_month: number | null;
    ai_credits_per_month: number | null;
    ai_question_generation: boolean;
    ai_explanations: boolean;
    has_ai_access: boolean;
}



export default function PackagesGrid() {

    const [isSubscribing, setIsSubscribing] = React.useState<string | null>(null);

    const { data: packagesResponse, isLoading, error } = useQuery({
        queryKey: ['packages'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.PACKAGES.LIST_PACKAGES, {
                params: { is_active: true }
            });
            return data;
        },
    });

    const packages = packagesResponse?.data?.results || packagesResponse?.data || packagesResponse || [];

    const handleSubscribe = async (packageId: string) => {
        setIsSubscribing(packageId);
        try {
            const response = await api.post(ENDPOINTS.SUBSCRIPTIONS.SUBSCRIBE, {
                package_id: packageId,
            });

            if (response.data?.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                toast.success("Subscription initiated! Please complete payment.");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to initiate subscription.";
            toast.error(errorMessage);
        } finally {
            setIsSubscribing(null);
        }

    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#18181b] flex items-center justify-center">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#18181b] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load packages.</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    return (


        <div className="container mx-auto relative z-10">

            {/* Packages Grid */}
            {packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {packages.map((pkg: Package) => (
                        <Package
                            key={pkg.id}
                            package={pkg}
                            isSubscribing={isSubscribing}
                            onSubscribe={handleSubscribe}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <PackageIcon className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                    <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">No packages available</h3>
                    <p className="text-sm text-zinc-500 mt-1">Check back later for subscription plans.</p>
                </div>
            )}
        </div>

    );
}