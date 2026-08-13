import { Lang } from '@/lib/dictionary/dictionary';
import { getDictionary } from '@/lib/dictionary/get-dictionary';
import React from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowRightCircle, Globe2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type PageProps = {
    params: {
        lang: Lang;
    };
};

const learningOrbitImages = [
    { src: '/how-it-works-goal.png', alt: 'Learner choosing a digital-skills goal', className: 'top-[1%] left-[40%] w-[19%]' },
    { src: '/how-it-works-ai-support.png', alt: 'Learner receiving AI guidance', className: 'top-[21%] left-[1%] w-[21%]' },
    { src: '/how-it-works-portfolio.png', alt: 'Learner presenting a digital portfolio', className: 'top-[25%] right-[1%] w-[21%]' },
    { src: '/step1.png', alt: 'Interactive digital learning experience', className: 'bottom-[2%] left-[8%] w-[20%]' },
    { src: '/step4.png', alt: 'Learner celebrating completed skills', className: 'bottom-[1%] right-[9%] w-[20%]' },
];

async function page({ params }: PageProps) {
    const { lang } = await params;
    const t = getDictionary(lang);
    const about = t.pages.about;

    return (
        <>
            <Header lang={lang} t={t.nav} />

            <main className="min-h-screen bg-white dark:bg-[#18181b]">
                {/* Hero Section */}
                {/* Reduced py-16 to py-12 for mobile */}
                <section className="py-12 md:py-16 relative overflow-hidden">
                    <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[60%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0 animate-[pulse_8s_ease-in-out_infinite]" />
                    <div className="container mx-auto px-6 pt-12">
                        <div className="space-y-2">
                            {/* Reduced text-4xl to text-3xl for mobile */}
                            <h1 className="text-3xl md:text-4xl leading-tight font-extrabold text-zinc-900 dark:text-white max-w-full md:max-w-2/3">
                                {about.hero.title.split(' ')[0]} <span className="text-primary">{about.hero.title.split(' ').slice(1).join(' ')}</span>
                            </h1>

                            <p className="py-4 md:py-6 max-w-[750px] text-gray-500 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                                {about.hero.subtitle}
                            </p>
                        </div>
                    </div>

                </section>

                {/* Learning Experience Section */}
                {/* Reduced py-24 to py-12 for mobile */}
                <section className="py-12 md:py-24 relative">
                    <div className="w-full container px-4 md:px-5 lg:px-5 mx-auto">
                        <div className="w-full justify-between items-center gap-8 md:gap-12 grid lg:grid-cols-2 grid-cols-1">
                            <div className="w-full justify-center items-start gap-6 lg:order-first order-last relative">
                                <div className="relative w-full max-w-[620px] mx-auto aspect-square">
                                    <div className="absolute inset-[8%] rounded-full border-2 border-dashed border-zinc-300/70 dark:border-zinc-700/70" />
                                    <div className="absolute inset-[25%] rounded-full border-2 border-dashed border-primary/30" />

                                    <div className="absolute z-20 left-1/2 top-1/2 w-[45%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-[6px] border-white dark:border-zinc-900 shadow-2xl">
                                        <Image
                                            fill
                                            className="object-cover"
                                            src="/how-it-works-build.png"
                                            alt="Learner building a responsive digital project"
                                            quality={95}
                                            sizes="(max-width: 1023px) 42vw, 20vw"
                                        />
                                    </div>

                                    {learningOrbitImages.map((item) => (
                                        <div
                                            key={item.src}
                                            className={`absolute z-30 aspect-square rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 shadow-xl ${item.className}`}
                                        >
                                            <Image
                                                fill
                                                className="object-cover transition-transform duration-500 hover:scale-110"
                                                src={item.src}
                                                alt={item.alt}
                                                quality={90}
                                                sizes="(max-width: 1023px) 20vw, 10vw"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full flex-col justify-center lg:items-start items-center gap-6 md:gap-10 inline-flex">
                                <div className="w-full flex-col justify-center items-start gap-6 md:gap-8 flex">
                                    <div className="space-y-3 md:space-y-4">
                                        <h3 className="text-2xl md:text-4xl text-start font-bold max-w-[800px] leading-tight ">
                                            {about.community.title}
                                        </h3>
                                        <p className="text-start text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-[700px] leading-relaxed">
                                            {about.community.desc}
                                        </p>
                                    </div>

                                    <div className="w-full space-y-3 md:space-y-4 border-l-4 border-primary pl-4 md:pl-6 py-2 bg-primary/[0.02] rounded-r-xl">
                                        <h2 className="text-xl md:text-2xl font-bold leading-normal text-left">
                                            {about.community.foundedTitle}
                                        </h2>
                                        <p className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-400 text-sm md:text-base font-normal leading-relaxed text-left">
                                            {about.community.foundedDesc}
                                        </p>
                                    </div>

                                    <div className="w-full flex-col justify-start lg:items-start items-center flex">
                                        <h2 className="text-zinc-900 dark:text-white text-xl md:text-2xl font-bold leading-normal text-left">
                                            {about.community.philosophyTitle}
                                        </h2>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-normal leading-relaxed text-left max-w-[650px]">
                                            {about.community.philosophyDesc}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 md:pt-4 w-full md:w-auto">
                                    <Button size="lg" className="w-full md:w-auto rounded-full font-bold px-8 py-5 md:py-6 text-base md:text-lg shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                        {about.community.button} <ArrowRightCircle className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                {/* Reduced py-20 to py-12 for mobile */}
                <section className="py-12 md:py-20 relative overflow-hidden ">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start relative">
                            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-zinc-200 to-transparent shadow-[0_0_15px_rgba(0,0,0,0.05)] backdrop-blur-sm" />

                            <div className="space-y-4 md:space-y-6 relative">
                                <div className="flex items-center gap-3 text-primary">
                                    <Users size={18} strokeWidth={2.5} />
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">{about.missionVision.missionLabel}</span>
                                </div>
                                <h4 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                                    {about.missionVision.missionTitle.split(' ').slice(0, -2).join(' ')} <span className="text-primary">{about.missionVision.missionTitle.split(' ').slice(-2).join(' ')}</span>
                                </h4>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">
                                    {about.missionVision.missionDesc}
                                </p>
                            </div>

                            <div className="space-y-4 md:space-y-6 relative md:pl-12">
                                <div className="flex items-center gap-3 text-primary">
                                    <Globe2 size={18} strokeWidth={2.5} />
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">{about.missionVision.visionLabel}</span>
                                </div>
                                <h4 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                                    {about.missionVision.visionTitle.split(' ').slice(0, -2).join(' ')} <span className="text-primary">{about.missionVision.visionTitle.split(' ').slice(-2).join(' ')}</span>
                                </h4>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">
                                    {about.missionVision.visionDesc}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <Footer lang={lang} t={t.footer} />
        </>
    )
}

export default page;
