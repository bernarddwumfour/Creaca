import { Lang } from '@/lib/dictionariy/dictionary';
import { getDictionary } from '@/lib/dictionariy/get-dictionary';
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

            <main className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="py-16 relative bg-primary/[0.03] overflow-hidden">
                    <div className="container mx-auto px-6 pt-12">
                        <div className="space-y-2">
                            <h1 className="text-4xl leading-18 font-extrabold text-zinc-900 max-w-2/3">
                                {about.hero.title.split(' ')[0]} <span className="text-primary">{about.hero.title.split(' ').slice(1).join(' ')}</span>
                            </h1>

                            <p className="py-6 max-w-[750px] text-gray-500 leading-relaxed">
                                {about.hero.subtitle}
                            </p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-primary translate-x-1/2" />
                </section>

                {/* Community Section */}
                <section className="py-24 relative">
                    <div className="w-full container px-4 md:px-5 lg:px-5 mx-auto">
                        <div className="w-full justify-between items-center gap-12 grid lg:grid-cols-2 grid-cols-1">
                            <div className="w-full justify-center items-start gap-6 lg:order-first order-last relative">
                                <div className="pt-24 lg:justify-center sm:justify-end w-[95%] h-[700px] justify-start items-start gap-2.5 flex relative">
                                    <Image
                                        fill
                                        className="rounded-xl object-cover scale-90"
                                        src="/about_image.png"
                                        alt="Students from diverse backgrounds"
                                    />
                                </div>
                            </div>

                            <div className="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex">
                                <div className="w-full flex-col justify-center items-start gap-8 flex">
                                    <div className="space-y-4">
                                        <h3 className="text-4xl text-start font-bold max-w-[800px] leading-tight text-zinc-900">
                                            {about.community.title}
                                        </h3>
                                        <p className="text-start text-base text-zinc-500 max-w-[700px] leading-relaxed">
                                            {about.community.desc}
                                        </p>
                                    </div>

                                    <div className="w-full space-y-4 border-l-4 border-primary pl-6 py-2 bg-primary/[0.02] rounded-r-xl">
                                        <h2 className="text-zinc-900 text-2xl font-bold leading-normal lg:text-start text-center">
                                            {about.community.foundedTitle}
                                        </h2>
                                        <p className="text-zinc-500 text-base font-normal leading-relaxed lg:text-start text-center">
                                            {about.community.foundedDesc}
                                        </p>
                                    </div>

                                    <div className="w-full flex-col justify-start lg:items-start items-center flex">
                                        <h2 className="text-zinc-900 text-2xl font-bold leading-normal lg:text-start text-center">
                                            {about.community.philosophyTitle}
                                        </h2>
                                        <p className="text-zinc-500 text-base font-normal leading-relaxed lg:text-start text-center max-w-[650px]">
                                            {about.community.philosophyDesc}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button size="lg" className="rounded-full font-bold px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                        {about.community.button} <ArrowRightCircle className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-20 relative overflow-hidden bg-white">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start relative">
                            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-zinc-200 to-transparent shadow-[0_0_15px_rgba(0,0,0,0.05)] backdrop-blur-sm" />

                            <div className="space-y-6 relative">
                                <div className="flex items-center gap-3 text-primary">
                                    <Users size={20} strokeWidth={2.5} />
                                    <span className="text-xs font-black uppercase tracking-[0.3em]">{about.missionVision.missionLabel}</span>
                                </div>
                                <h4 className="text-3xl font-extrabold text-zinc-900 leading-tight">
                                    {about.missionVision.missionTitle.split(' ').slice(0, -2).join(' ')} <span className="text-primary">{about.missionVision.missionTitle.split(' ').slice(-2).join(' ')}</span>
                                </h4>
                                <p className="text-zinc-500 leading-relaxed max-w-md">
                                    {about.missionVision.missionDesc}
                                </p>
                            </div>

                            <div className="space-y-6 relative md:pl-12">
                                <div className="flex items-center gap-3 text-primary">
                                    <Globe2 size={20} strokeWidth={2.5} />
                                    <span className="text-xs font-black uppercase tracking-[0.3em]">{about.missionVision.visionLabel}</span>
                                </div>
                                <h4 className="text-3xl font-extrabold text-zinc-900 leading-tight">
                                    {about.missionVision.visionTitle.split(' ').slice(0, -2).join(' ')} <span className="text-primary">{about.missionVision.visionTitle.split(' ').slice(-2).join(' ')}</span>
                                </h4>
                                <p className="text-zinc-500 leading-relaxed max-w-md">
                                    {about.missionVision.visionDesc}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Founders Section */}
                <section className="py-24 relative bg-primary/[0.03] overflow-hidden">
                    <div className="space-y-4 container mx-auto pb-4">
                        <h3 className="text-4xl text-start font-bold max-w-[800px] leading-12 text-zinc-900">
                            Meet Our <span className="text-primary">Founders</span>
                        </h3>
                        <p className="text-start text-sm text-gray-500 max-w-[700px]">
                            The two educators behind the vision of Cresca, dedicated to bridging the gap in global communication.
                        </p>
                    </div>

                    <div className="container mx-auto z-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mt-6">
                            <div className="w-full col-span-2 flex-col justify-center lg:items-start items-center gap-10 inline-flex">
                                <div className="w-full flex-col justify-center items-start gap-4 flex">
                                    <div className="space-y-4 pb-2">
                                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                            <span>{about.founders.storyLabel}</span>
                                        </div>
                                        <h3 className="text-4xl text-start font-bold max-w-[800px] leading-12 text-zinc-900">
                                            {about.founders.storyTitle}
                                        </h3>
                                        <p className="text-start text-sm text-zinc-500 max-w-[700px] leading-relaxed">
                                            {about.founders.storyDesc}
                                        </p>
                                    </div>
                                    <div className="w-full py-8 border-t border-zinc-100 mt-4">
                                        <h4 className="text-primary font-bold text-sm uppercase tracking-tighter mb-4">{about.founders.creatorsLabel}</h4>
                                        <div className="grid sm:grid-cols-2 gap-8 items-center">
                                            <div className="space-y-4">
                                                <p className="text-zinc-700 text-lg italic leading-relaxed font-medium">
                                                    &quot;{about.founders.quote}&quot;
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-3">
                                                        <div className="w-12 h-12 rounded-full border-4 border-white bg-zinc-200 shadow-sm" />
                                                        <div className="w-12 h-12 rounded-full border-4 border-white bg-zinc-300 shadow-sm" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-zinc-900 leading-none">{about.founders.foundersLabel}</span>
                                                        <span className="text-xs text-zinc-500 font-medium">{about.founders.foundersSublabel}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                                <p className="text-zinc-600 text-sm leading-relaxed">
                                                    {about.founders.biography}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className=" col-span-2 grid grid-cols-2 gap-8 h-[600px] items-center">
                                {about.founders.members.map((member: any, i: number) => (
                                    <div key={i} className={`flex flex-col items-start ${i === 1 ? 'self-end' : 'self-start'} hover:-translate-y-2 transition-all duration-500 group`}>
                                        <div className="w-full h-[450px] relative overflow-hidden rounded-[3rem] shadow-xl">
                                            <Image
                                                fill
                                                src={i === 0 ? "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=600" : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=600"}
                                                alt={member.name}
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="mt-6 px-4">
                                            <h3 className="text-2xl font-black text-zinc-900">{member.name}</h3>
                                            <p className="text-primary font-bold tracking-widest uppercase text-xs">{member.role}</p>
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