'use client';

import { useState } from 'react';
import { Check, Clock, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { CustomDialog } from '../../../../widgets/CustomDialog/CustomDialog';

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
    max_difficulty: string;
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

interface PackageCardProps {
    package: Package;
    isSubscribing: string | null;
    onSubscribe: (packageId: string) => void;
}

export function Package({ package: pkg, isSubscribing, onSubscribe }: PackageCardProps) {
    const { user } = useAuth();
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const handleSubscribeClick = () => {
        if (!user) {
            setShowLoginDialog(true);
        } else {
            onSubscribe(pkg.id);
        }
    };

    return (
        <>
            <div className="group relative p-[2px] rounded-3xl transition-all duration-700 hover:-translate-y-2 overflow-hidden bg-slate-100/50 dark:bg-zinc-900 shadow-xs hover:shadow-sm">
                {/* Featured badge */}
                {pkg.badge_text && (
                    <div className="absolute top-4 right-4 z-20">
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-primary text-white rounded-full shadow-lg">
                            {pkg.badge_text}
                        </span>
                    </div>
                )}

                <div className="absolute w-[95%] h-[95%] top-[2.5%] left-[2.5%] z-1 bg-slate-100 dark:bg-zinc-900 rounded-3xl" />
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none" style={{ animationDuration: '3s' }} />

                <div className="relative h-full flex flex-col p-8 rounded-3xl bg-white/50 dark:bg-[#111114]/80 backdrop-blur-2xl z-10 border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-20 bg-gradient-to-r from-transparent via-white/2 to-transparent animate-[shimmer_3s_infinite]" />

                    <div className="mt-0 mb-5">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">{pkg.name}</h4>
                        <p className="text-slate-500 dark:text-zinc-400 text-[13px] font-medium leading-relaxed line-clamp-2">
                            {pkg.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 text-xs font-bold mb-6">
                        <Clock className="w-4 h-4 text-orange-600" />
                        {pkg.billing_cycle === 'yearly' ? 'Yearly' : pkg.billing_cycle === 'one_time' ? 'One Time' : 'Monthly'}
                    </div>

                    <div className="space-y-4 mb-10 flex-grow">
                        {pkg.max_courses && (
                            <div className="flex items-start gap-3 text-[13px] font-bold text-slate-700 dark:text-zinc-300">
                                <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                <span className="leading-tight">{pkg.max_courses} Courses Included</span>
                            </div>
                        )}
                        {pkg.max_difficulty && (
                            <div className="flex items-start gap-3 text-[13px] font-bold text-slate-700 dark:text-zinc-300">
                                <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                <span className="leading-tight">Enroll in courses up to {pkg.max_difficulty}</span>
                            </div>
                        )}
                        {/* {pkg.max_students && (
                            <div className="flex items-start gap-3 text-[13px] font-bold text-slate-700 dark:text-zinc-300">
                                <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                <span className="leading-tight">Up to {pkg.max_students} Students</span>
                            </div>
                        )} */}
                        {pkg.includes_certificate && (
                            <div className="flex items-start gap-3 text-[13px] font-bold text-slate-700 dark:text-zinc-300">
                                <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                <span className="leading-tight">Certificate of Completion</span>
                            </div>
                        )}
                        {pkg.can_download_materials && (
                            <div className="flex items-start gap-3 text-[13px] font-bold text-slate-700 dark:text-zinc-300">
                                <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                <span className="leading-tight">Download Materials</span>
                            </div>
                        )}
                        {pkg.includes_video_lessons && (
                            <div className="flex items-start gap-3 text-[13px] font-bold text-slate-700 dark:text-zinc-300">
                                <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                <span className="leading-tight">{pkg.video_quality || 'HD'} Video Lessons</span>
                            </div>
                        )}
                        {pkg.ai_credits_per_month ? (
                            <div className="flex items-start gap-3 text-[13px] font-bold text-slate-700 dark:text-zinc-300">
                                <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                <span className="leading-tight">{pkg.ai_credits_per_month} AI Credits/Month</span>
                            </div>
                        ) : ""}
                        {pkg.has_ai_access && (
                            <div className="flex items-start gap-3 text-[13px] font-bold text-slate-700 dark:text-zinc-300">
                                <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                <span className="leading-tight">AI-Powered Learning</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-white/10 mb-6">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            {pkg.has_discount && pkg.original_price && (
                                <span className="text-lg font-medium text-zinc-400 line-through">${pkg.original_price}</span>
                            )}
                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                ${pkg.price}
                            </span>
                            {pkg.has_trial && pkg.trial_days && pkg.trial_days > 0 && (
                                <span className="text-xs font-bold text-emerald-600 ml-2">
                                    {pkg.trial_days}-day trial
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={handleSubscribeClick}
                        disabled={!!isSubscribing}
                        className="rounded-[2rem] disabled:opacity-50 w-full"
                    >
                        {isSubscribing === pkg.id ? <Loader2 className="animate-spin h-4 w-4" /> : "Subscribe Now"}
                    </Button>
                </div>
            </div>

            {/* Login Dialog for Unauthenticated Users */}
            <CustomDialog
                title="Authentication Required"
                description="Please log in or create an account to subscribe to this plan."
                open={showLoginDialog}
                onOpenChange={setShowLoginDialog}
            >
                <div className="space-y-4 py-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        You need to be logged in to subscribe to a subscription plan.
                        Please choose an option below to continue.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            asChild
                            className="flex-1 bg-primary hover:bg-orange-600"
                            onClick={() => setShowLoginDialog(false)}
                        >
                            <Link href={`/en/login/?redirect=/packages`}>
                                Log In
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowLoginDialog(false)}
                        >
                            <Link href={`/en/register?redirect=/packages`}>
                                Create Account
                            </Link>
                        </Button>
                    </div>
                </div>
            </CustomDialog>
        </>
    );
}