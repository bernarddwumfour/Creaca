import { Lang } from '@/lib/dictionariy/dictionary';
import { getDictionary } from '@/lib/dictionariy/get-dictionary';
import React from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';



type PageProps = {
    params: {
        lang: Lang;
    };
};

async function page({ params }: PageProps) {
    const { lang } = await params;
    const t = getDictionary(lang);

    return (
        <>
            <Header lang={lang} t={t.nav} />
            <main className="min-h-screen py-24">
                Contact us
            </main>
            <Footer lang={lang} t={t.footer} />
        </>
    )
}

export default page