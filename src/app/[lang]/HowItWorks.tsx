"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks({ t }: { t: any }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [percentage, setPercentage] = useState(0);

    const images = [
        "/how-it-works-goal.png",
        "/how-it-works-build.png",
        "/how-it-works-ai-support.png",
        "/how-it-works-portfolio.png",
    ];
    
    const steps = t.steps.map((step: any, i: number) => ({
        ...step,
        img: images[i] || "/home1.png"
    }));

    useGSAP(() => {
        const totalPanels = steps.length;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                pin: true,
                scrub: 0,
                invalidateOnRefresh: true,
                snap: {
                    snapTo: 1 / (totalPanels - 1),
                    duration: 0.2,
                    delay: 0,
                    ease: "none"
                },
                end: () => "+=" + (window.innerWidth * 3),
                onUpdate: (self) => {
                    setPercentage(Math.round(self.progress * 100));
                    setCurrentStep(Math.round(self.progress * (totalPanels - 1)) + 1);
                }
            }
        });

        tl.to(sliderRef.current, {
            x: () => -(sliderRef.current!.scrollWidth - window.innerWidth),
            ease: "none",
        });

    }, { scope: containerRef, dependencies: [steps.length] });

    return (
        <div ref={containerRef} className="relative overflow-hidden bg-white dark:bg-[#18181b]">

            {/* --- DECORATIVE BUBBLES (UNTOUCHED STYLING) --- */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[15%] left-[10%] w-24 h-24 bg-orange-500/20 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute top-[40%] right-[15%] w-36 h-36 bg-primary/20 rounded-full blur-3xl animate-float-medium" />
                <div className="absolute bottom-[25%] left-[20%] w-48 h-48 bg-orange-600/15 rounded-full blur-3xl animate-float-fast" />
                <div className="absolute top-[60%] left-[5%] w-20 h-20 bg-primary/25 rounded-full blur-2xl animate-float-slow-reverse" />
                <div className="absolute bottom-[35%] right-[25%] w-32 h-32 bg-orange-500/20 rounded-full blur-3xl animate-float-medium" />
                <div className="absolute top-[20%] right-[30%] w-16 h-16 bg-primary/30 rounded-full blur-2xl animate-ping-slow" />
                <div className="absolute top-[25%] left-[30%] w-3 h-3 bg-orange-400 rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[40%] right-[10%] w-4 h-4 bg-primary-300 rounded-full animate-pulse-slower" />
                <div className="absolute top-[70%] left-[40%] w-2 h-2 bg-orange-500 rounded-full animate-ping-slow" />
            </div>

            <div className="absolute bottom-[-50%] left-[-15%] w-[70%] h-[60%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0 animate-[pulse_8s_ease-in-out_infinite]" />
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute bottom-[-50%] left-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-[pulse_6s_infinite]" />
            </div>

            {/* --- HEADER (DICTIONARY IMPLEMENTED) --- */}
            <div className="absolute top-10 left-0 w-full z-50 pt-16">
                <div className="lg:container mx-auto px-6 flex justify-between items-start">
                    <div className="space-y-4 relative z-10">
                        <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-xs">{t.title}</h2>
                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            {t.subtitle} <span className="text-orange-600 relative inline-block">
                                {/* Use dictionary value for success or accent word */}
                                {t.subtitleAccent || "success."}
                                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-orange-600/0 via-orange-600/50 to-orange-600/0 blur-sm"></span>
                            </span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-slate-200 dark:border-zinc-700">
                        <span className="text-xs font-bold text-primary tabular-nums">{currentStep}</span>
                        <span className="opacity-30 text-xs">/</span>
                        <span className="text-xs opacity-50 text-slate-500 font-medium">{steps.length}</span>
                    </div>
                </div>
            </div>

            {/* --- HORIZONTAL TRACK --- */}
            <div ref={sliderRef} className="flex flex-nowrap h-screen relative items-center will-change-transform">
                {steps.map((step: any, i: number) => (
                    <section key={i} className="w-screen h-screen flex-shrink-0 flex items-center justify-center relative z-10 px-6">
                        <div className="lg:container mx-auto w-full flex justify-between items-center relative">

                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 z-10">
                                {/* IMAGE BOX */}
                                <div className="relative shrink-0 w-56 h-56 md:w-80 md:h-80 lg:w-[380px] lg:h-[380px]">
                                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full" />
                                    <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden  border border-white/20">
                                        <Image
                                            src={step.img}
                                            alt={step.title}
                                            fill
                                            className="object-cover"
                                            priority={i === 0}
                                        />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold shadow-lg text-sm border-2 border-white dark:border-[#18181b]">
                                        0{i + 1}
                                    </div>
                                </div>

                                {/* TYPOGRAPHY (DICTIONARY IMPLEMENTED) */}
                                <div className="max-w-xl space-y-4 text-center md:text-left">
                                    <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-xs">
                                        {/* Dynamic "Phase" word from dictionary */}
                                        {t.phaseLabel || "Phase"} 0{i + 1}
                                    </h2>
                                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                        <span className="relative inline-block">
                                            {step.title}
                                            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-orange-600/0 via-orange-600/50 to-orange-600/0 blur-sm"></span>
                                        </span>
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg max-w-md leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>

                            {/* LARGE BACKGROUND INDICATOR */}
                            <h1 className="hidden lg:block absolute right-0 text-[15rem] lg:text-[18rem] font-black text-orange-600 dark:text-orange-500 opacity-10 select-none pointer-events-none">
                                {i + 1}
                            </h1>
                        </div>
                    </section>
                ))}
            </div>

            {/* --- PROGRESS FOOTER --- */}
            <div className="absolute bottom-10 left-0 w-full z-50">
                <div className="lg:container mx-auto px-6 md:px-12 flex items-center gap-6">
                    <div className="flex gap-1.5">
                        {steps.map((_: any, idx: number) => (
                            <div
                                key={idx}
                                className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep >= idx + 1 ? "bg-primary scale-110" : "bg-slate-200 dark:bg-zinc-800"}`}
                            />
                        ))}
                    </div>
                    <div className="h-[2px] flex-1 bg-slate-100 dark:bg-zinc-800/50 relative rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-orange-500 to-red-600 transition-all duration-75"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-primary w-10 text-right tabular-nums">{percentage}%</span>
                </div>
            </div>
        </div>
    );
}
