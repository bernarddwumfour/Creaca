import { Lang } from '@/lib/dictionary/dictionary';
import { getDictionary } from '@/lib/dictionary/get-dictionary';
import React from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Globe2, BookOpen, GraduationCap, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CourseGrid from './CourseGrid';

type PageProps = {
    params: {
        lang: Lang;
    };
};

export default async function page({ params }: PageProps) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);
    const t = dictionary.pages.courses; // Assuming it's nested under 'courses' in your getDictionary

    return (
        <>
            <Header lang={lang} t={dictionary.nav} />
            <main className="min-h-screen bg-white">

                <section className="py-24 relative overflow-hidden bg-zinc-50">
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="space-y-2">
                            <h1 className="text-4xl leading-tight font-extrabold text-zinc-900 max-w-2/3">
                                {t.hero.title} <span className="text-primary">{t.hero.titleAccent}</span>
                            </h1>
                            <p className="py-6 max-w-[750px] text-gray-500 leading-relaxed text-lg">
                                {t.hero.description}
                            </p>
                        </div>
                    </div>

                     {/* Background decorative element - matching your Founders section */}
                     <div className="absolute top-0 -left-90 w-3/4 h-full bg-primary/5 -skew-x-12 " />
                    <div className="absolute -top-4 -left-90 w-3/4 h-full bg-primary/7 -skew-x-12 " />

                    {/* Decorative Background Icons - Static Watermark Pattern */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]">
                        {/* Top Group */}
                        <Globe2 className="absolute top-8 right-[15%] text-primary w-24 h-24 -rotate-12" />
                        <Zap className="absolute top-20 right-[5%] text-primary w-12 h-12 rotate-12" />

                        {/* Middle Group */}
                        <GraduationCap className="absolute top-1/2 right-[25%] text-primary w-20 h-20 -rotate-45" />
                        <BookOpen className="absolute top-1/3 right-[10%] text-primary w-28 h-28 rotate-6" />
                    </div>
                </section>

                <section className="py-24 relative">
                    <CourseGrid lang={lang}/>
                    <div className="absolute top-1/2 left-0 w-full h-full bg-primary/[0.02] -skew-y-6 -z-10" />
                </section>

                {/* CTA Section */}
                <section className="py-24 container mx-auto px-6">
                    <div className="bg-primary rounded-xl p-12 md:p-20 relative overflow-hidden text-center">
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-white text-4xl font-black max-w-2xl mx-auto leading-tight">
                                {t.cta.title}
                            </h2>
                            <Button size="lg" className="bg-white text-primary hover:bg-zinc-100 rounded-full font-bold px-10 py-7 text-lg shadow-xl">
                                {t.cta.button}
                            </Button>
                        </div>
                        <Globe2 className="absolute -bottom-10 -left-10 text-white/10 w-64 h-64" />
                        <BookOpen className="absolute -top-10 -right-10 text-white/10 w-64 h-64" />
                    </div>
                </section>
            </main>
            <Footer lang={lang} t={dictionary.footer} />
        </>
    )
}