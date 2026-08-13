// app/[lang]/courses/[id]/lessons/[moduleId]/page.tsx
import { Lang } from '@/lib/dictionary/dictionary';
import { getDictionary } from '@/lib/dictionary/get-dictionary';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import LessonDetailClient from './LessonDetailClient';

type PageProps = {
    params: Promise<{
        lang: Lang;
        id: string;
        moduleId: string;
    }>;
};

export default async function Page({ params }: PageProps) {
    const { lang, id, moduleId } = await params;
    const dictionary = getDictionary(lang);

    return (
        <>
            <Header lang={lang} t={dictionary.nav} />
            <LessonDetailClient courseId={id} moduleId={moduleId} lang={lang} />
            <Footer lang={lang} t={dictionary.footer} />
        </>
    );
}
