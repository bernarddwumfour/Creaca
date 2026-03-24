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

                {/* Community Section */}
                {/* Reduced py-24 to py-12 for mobile */}
                <section className="py-12 md:py-24 relative">
                    <div className="w-full container px-4 md:px-5 lg:px-5 mx-auto">
                        <div className="w-full justify-between items-center gap-8 md:gap-12 grid lg:grid-cols-2 grid-cols-1">
                            <div className="w-full justify-center items-start gap-6 lg:order-first order-last relative">
                                {/* Adjusted pt-24 to pt-12 and fixed height for mobile */}
                                <div className="pt-12 md:pt-24 lg:justify-center sm:justify-end w-full md:w-[95%] h-[350px] md:h-[calc(450px+5vw)] justify-start items-start gap-2.5 flex relative">
                                    <Image
                                        fill
                                        className="rounded-xl object-contain scale-90"
                                        src="/about_image.png"
                                        alt="Students from diverse backgrounds"
                                    />
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

                {/* Founders Section */}
                <section className="py-12 md:py-24 relative px-6 overflow-hidden">
                    <div className="space-y-3 md:space-y-4 container mx-auto pb-4">
                        <h3 className="text-2xl md:text-4xl text-start font-bold max-w-[800px] leading-tight md:leading-12 text-zinc-900 dark:text-white">
                            Meet Our <span className="text-primary">Founders</span>
                        </h3>
                        <p className="text-start text-xs md:text-sm text-gray-500 max-w-[700px]">
                            The two educators behind the vision of Kyrios, dedicated to bridging the gap in global communication.
                        </p>
                    </div>

                    <div className="container mx-auto z-1 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mt-6">
                            <div className="w-full col-span-1 md:col-span-2 flex-col justify-center lg:items-start items-center gap-6 md:gap-10 inline-flex">
                                <div className="w-full flex-col justify-center items-start gap-4 flex">
                                    <div className="space-y-3 md:space-y-4 pb-2">
                                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                            <span>{about.founders.storyLabel}</span>
                                        </div>
                                        <h3 className="text-2xl md:text-4xl text-start font-bold max-w-[800px] leading-tight md:leading-12 text-zinc-900 dark:text-white">
                                            {about.founders.storyTitle}
                                        </h3>
                                        <p className="text-start text-xs md:text-sm text-zinc-500 dark:text-zinc-400 max-w-[700px] leading-relaxed">
                                            {about.founders.storyDesc}
                                        </p>
                                    </div>
                                    <div className="w-full py-6 md:py-8 border-t border-zinc-100 mt-4">
                                        <h4 className="text-primary font-bold text-xs uppercase tracking-tighter mb-4">{about.founders.creatorsLabel}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                                            <div className="space-y-4">
                                                <p className="text-zinc-700 dark:text-zinc-400 text-base md:text-lg italic leading-relaxed font-medium">
                                                    &quot;{about.founders.quote}&quot;
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-3">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white bg-zinc-200 shadow-sm" />
                                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white bg-zinc-300 shadow-sm" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs md:text-sm font-black text-zinc-900 dark:text-white leading-none">{about.founders.foundersLabel}</span>
                                                        <span className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 font-medium">{about.founders.foundersSublabel}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-zinc-50 p-4 md:p-6 rounded-2xl border border-zinc-100">
                                                <p className="text-zinc-600 text-xs md:text-sm leading-relaxed">
                                                    {about.founders.biography}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Adjusted height from 600px to auto for mobile, 600px for desktop */}
                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 md:h-[600px] items-center">
                                {about.founders.members.map((member: any, i: number) => (
                                    <div key={i} className={`flex flex-col items-start ${i === 1 ? 'md:self-end' : 'md:self-start'} hover:-translate-y-2 transition-all duration-500 group`}>
                                        <div className="w-full h-[350px] md:h-[450px] relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-xl">
                                            <Image
                                                fill
                                                src={i === 0 ? "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=600" : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=600"}
                                                alt={member.name}
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="mt-4 md:mt-6 px-4">
                                            <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">{member.name}</h3>
                                            <p className="text-primary font-bold tracking-widest uppercase text-[10px] md:text-xs">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-2/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2 z-0" />
                </section>
            </main>

            <Footer lang={lang} t={t.footer} />
        </>
    )
}

export default page;