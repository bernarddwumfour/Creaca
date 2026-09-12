// app/[lang]/courses/[slug]/lessons/[moduleSlug]/page.tsx
import { Lang } from '@/lib/dictionary/dictionary';
import { getDictionary } from '@/lib/dictionary/get-dictionary';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import LessonDetailClient from './LessonDetailClient';

type PageProps = {
    params: Promise<{
        lang: Lang;
        slug: string;
        moduleSlug: string;
    }>;
};

export default async function Page({ params }: PageProps) {
    const { lang, slug, moduleSlug } = await params;
    const dictionary = getDictionary(lang);

    return (
        <>
            <Header lang={lang} t={dictionary.nav} />
            <LessonDetailClient courseSlug={slug} moduleSlug={moduleSlug} lang={lang} />
            <Footer lang={lang} t={dictionary.footer} />
        </>
    );
}
