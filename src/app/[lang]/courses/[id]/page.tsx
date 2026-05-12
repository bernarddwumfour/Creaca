// app/[lang]/courses/[id]/page.tsx
import { Lang } from '@/lib/dictionary/dictionary';
import { getDictionary } from '@/lib/dictionary/get-dictionary';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CourseDetailClient from './CourseDetailClient';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

type PageProps = {
    params: Promise<{
        lang: Lang;
        id: string;
    }>;
};

async function getCourseData(id: string) {
    try {
        const response = await api.get(ENDPOINTS.COURSES.COURSE_DETAIL.replace(':id', id));
        return response.data;
    } catch (error) {
        console.error('Error fetching course:', error);
        return null;
    }
}

export default async function Page({ params }: PageProps) {
    const { lang, id } = await params;
    const dictionary = getDictionary(lang);
    const courseData = await getCourseData(id);

    if (!courseData || courseData.status !== 'success') {
        return (
            <>
                <Header lang={lang} t={dictionary.nav} />
                <main className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
                        <p className="text-zinc-500">The course you're looking for doesn't exist or has been removed.</p>
                    </div>
                </main>
                <Footer lang={lang} t={dictionary.footer} />
            </>
        );
    }

    const course = courseData.data;

    return (
        <>
            <Header lang={lang} t={dictionary.nav} />
            <CourseDetailClient course={course} lang={lang} dictionary={dictionary} />
            <Footer lang={lang} t={dictionary.footer} />
        </>
    );
}