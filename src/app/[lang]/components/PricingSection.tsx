'use client';

import React from 'react';
import { Check, Clock, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { ENDPOINTS } from '@/lib/endpoints';
import { useRouter } from 'next/navigation';
import PackagesGrid from '../packages/PackagesGrid';
import { Lang } from '@/lib/dictionary/dictionary';


interface Package {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string;  // From serializer: str(package.price)
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

    // Content access
    is_unlimited: boolean;
    max_courses: number | null;
    max_students: number | null;

    // Features
    includes_certificate: boolean;
    can_download_materials: boolean;

    // Video
    includes_video_lessons: boolean;
    video_quality: string | null;

    // Audio
    text_to_audio: boolean;
    audio_to_text: boolean;
    audio_minutes_per_month: number | null;

    // AI
    ai_credits_per_month: number | null;
    ai_question_generation: boolean;
    ai_explanations: boolean;
    has_ai_access: boolean;

    is_active?: boolean; // Assuming from your filter
}

interface PricingSectionProps {
    lang: Lang;
    t?: {
        subtitle?: string;
        title?: string;
        titleAccent?: string;
        plans?: any[];
        buttonText?: string;
    };
    onSubscribe?: (packageId: string) => void;
}

const DEFAULT_CONTENT = {
    subtitle: "PRICING",
    title: "Choose Your",
    titleAccent: "Learning Path",
};

export default function PricingSection({ lang, t = DEFAULT_CONTENT, onSubscribe }: PricingSectionProps) {
    const [isSubscribing, setIsSubscribing] = React.useState<string | null>(null);
    const router = useRouter();


    return (
        <section className="bg-white dark:bg-[#18181b] py-42 overflow-hidden relative transition-colors duration-500">
            <div className="absolute bottom-[-35%] right-[-5%] w-[65%] h-[55%] bg-orange-500/25 dark:bg-orange-600/10 rounded-full blur-[130px] pointer-events-none z-0 animate-[pulse_10s_ease-in-out_infinite]" />
            <div className="absolute top-[-50%] left-[-15%] w-[70%] h-[60%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0 animate-[pulse_8s_ease-in-out_infinite]" />
            <div className="lg:container mx-auto px-6 relative z-10">
                <div className="max-w-xl space-y-4 mb-14">
                    <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-xs">{t.subtitle}</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        {t.title} <span className="text-orange-600 relative inline-block">
                            {t.titleAccent}
                            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-orange-600/0 via-orange-600/50 to-orange-600/0 blur-sm"></span>
                        </span>
                    </h3>
                </div>
                <PackagesGrid lang={lang} />
            </div>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 100% { transform: translateX(450%) skewX(-20deg); } }` }} />
        </section>

    );
}

