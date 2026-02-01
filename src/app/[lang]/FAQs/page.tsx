import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Lang } from '@/lib/dictionary/dictionary';
import { HelpCircle, MessageCircle, Sparkles, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FAQAccordion from './FAQAccordion';
import { getDictionary } from '@/lib/dictionary/get-dictionary';

type PageProps = {
    params: Promise<{
        lang: Lang;
    }>;
};

export default async function FAQPage({ params }: PageProps) {
    const { lang } = await params;
     const dictionary =  getDictionary(lang);
        const t = dictionary.pages.faqs; 

    return (
        <>
            <Header lang={lang} t={dictionary.nav} />

            <main className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="py-12 md:py-16 pt-24 md:pt-32 relative overflow-hidden bg-primary/[0.02]">
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">
                                {t.hero.badge}
                            </div>
                            <h1 className="text-3xl md:text-4xl leading-tight font-extrabold text-zinc-900 max-w-full md:max-w-2/3">
                                {t.hero.title} <span className="text-primary">{t.hero.titleAccent}</span>
                            </h1>
                            <p className="py-4 md:py-6 max-w-[750px] text-gray-500 leading-relaxed text-base md:text-lg">
                                {t.hero.description}
                            </p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/3 pointer-events-none" />
                </section>

                {/* FAQ Content Section */}
                <section className="py-12 md:py-24 relative ">
                    <div className="container mx-auto px-6 relative z-10">
                        {/* Interactive Client Component */}
                        <FAQAccordion items={t.items} />
                    </div>
                    <div className="absolute top-1/2 left-0 w-3/4 h-full bg-primary/5 -skew-x-12 -translate-x-1/2 pointer-events-none" />
                </section>

                {/* Bottom CTA */}
                <section className="py-12 md:py-24 container mx-auto px-6">
                    <div className="bg-zinc-900 rounded-[2rem] p-8 md:p-20 relative overflow-hidden text-center">
                        <div className="relative z-10 space-y-6 md:space-y-8">
                            <div className="space-y-3">
                                <h2 className="text-white text-2xl md:text-4xl font-black max-w-2xl mx-auto leading-tight">
                                    {t.cta.title}
                                </h2>
                                <p className="text-zinc-400 text-sm md:text-lg max-w-md mx-auto">
                                    {t.cta.subtitle}
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button size="lg" className="w-full sm:w-auto rounded-full font-bold px-10 py-6 md:py-8 text-base md:text-lg shadow-xl shadow-primary/20">
                                    {t.cta.primaryButton} <ArrowRightCircle className="ml-2" size={20} />
                                </Button>
                                {/* <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full font-bold px-10 py-6 md:py-8 text-base md:text-lg border-zinc-700 text-white hover:bg-zinc-800 transition-colors">
                                    <MessageCircle className="mr-2" size={20} />
                                    {t.cta.secondaryButton}
                                </Button> */}
                            </div>
                        </div>
                        
                        <HelpCircle className="absolute -bottom-10 -left-10 text-white/[0.03] w-48 h-48 md:w-80 md:h-80" />
                        <Sparkles className="absolute -top-10 -right-10 text-white/[0.03] w-48 h-48 md:w-80 md:h-80" />
                    </div>
                </section>
            </main>

            <Footer lang={lang} t={dictionary.footer} />
        </>
    );
}