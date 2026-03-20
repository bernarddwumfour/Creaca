import { Lang } from '@/lib/dictionary/dictionary';
import { getDictionary } from '@/lib/dictionary/get-dictionary';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Button } from '@/components/ui/button';
import {
    Clock,
    Zap,
    Star,
    PlayCircle,
    CheckCircle2,
    Globe2,
    Layout
} from 'lucide-react';
import Image from 'next/image';
import CourseContent from './CourseContent';
import { LESSON_MODULES, COURSE_CONTENT } from './courseData';

type PageProps = {
    params: Promise<{
        lang: Lang;
        id: string;
    }>;
};

const getCourseDetail = (id: string, lang: Lang) => {
    const title = decodeURIComponent(id);
    const langSet = COURSE_CONTENT[lang] || COURSE_CONTENT.en;
    const courseInfo = langSet.data[title] || Object.values(langSet.data)[0];

    const isAdvanced = title.toLowerCase().includes("calculus") ||
        title.toLowerCase().includes("algebra") ||
        title.toLowerCase().includes("calcul") ||
        title.toLowerCase().includes("álgebra");
    const localizedLevel = isAdvanced ? langSet.levels.advanced : langSet.levels.intermediate;

    const description = `${langSet.descPrefix} ${courseInfo.category} ${langSet.descMid} ${title} ${langSet.descSuffix}`;

    return {
        title: langSet.data[title] ? title : Object.keys(langSet.data)[0],
        ...courseInfo,
        labels: langSet,
        description,
        rating: 4.9,
        duration: langSet.durationLabel,
        level: localizedLevel,
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800",
    };
};

export default async function Page({ params }: PageProps) {
    const { lang, id } = await params;
    const dictionary = getDictionary(lang);
    const course = getCourseDetail(id, lang);

    return (
        <>
            <Header lang={lang} t={dictionary.nav} />
            <main className="min-h-screen bg-white dark:bg-[#09090b] relative">
                {/* Hero Section */}
                <section className="bg-zinc-50 dark:bg-zinc-900 pt-28 pb-12 md:pt-40 md:pb-32 text-zinc-900 dark:text-white relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full translate-x-1/2 pointer-events-none" />
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-12">
                            <div className="lg:w-2/3 space-y-5">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">
                                        {course.category}
                                    </span>
                                    <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-bold">
                                        <Star size={14} fill="currentColor" />
                                        {course.rating} <span className="text-zinc-400 font-medium">({course.labels.ratingLabel})</span>
                                    </div>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.15] text-zinc-900 dark:text-zinc-50">
                                    {course.title}
                                </h1>
                                <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed">
                                    {course.description}
                                </p>
                                <div className="flex flex-wrap gap-5 pt-2 text-xs md:text-sm font-bold text-zinc-500 dark:text-zinc-400">
                                    <div className="flex items-center gap-2"><Clock className="text-primary" size={16} />{course.duration}</div>
                                    <div className="flex items-center gap-2"><Zap className="text-primary" size={16} />{course.level}</div>
                                    <div className="flex items-center gap-2"><Globe2 className="text-primary" size={16} />{course.labels.nativeSupport}</div>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="lg:w-1/3 relative lg:-mb-56 z-20">
                                <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden sticky top-0">
                                    <div className="relative aspect-video group cursor-pointer">
                                        <Image src={course.image} fill alt="Preview" className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                            <PlayCircle className="text-white w-14 h-14" />
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8 space-y-6">
                                        <div className="space-y-3">
                                            <Button className="w-full py-6 md:py-7 rounded-xl font-bold text-base md:text-lg shadow-lg">
                                                {course.labels.enroll}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Course Content Section */}
                <section className="py-20 md:py-32 container mx-auto px-6">
                    <div className="space-y-16 grid md:grid-cols-3 gap-6 md:gap-12">
                        {/* Curriculum */}
                        <div className="space-y-8 md:col-span-2">
                            <div className="flex justify-between items-end">
                                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white">{course.labels.curriculumTitle}</h2>
                                <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">
                                    {course.lessons?.length || 0} {course.labels.unitsLabel}
                                </p>
                            </div>

                            {/* Client Component for Interactive Lessons */}
                            <CourseContent
                                lessons={course.lessons || []}
                                lessonModules={LESSON_MODULES}
                            />
                        </div>

                        {/* Learning Outcomes */}
                        <div className="space-y-8">
                            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <Layout className="text-primary" size={28} />
                                {course.labels.outcomesTitle}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.outcomes?.map((outcome: string, idx: number) => (
                                    <div key={idx} className="flex gap-3 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                        <CheckCircle2 className="text-primary shrink-0" size={18} />
                                        <span className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">{outcome}</span>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </section>
            </main>
            <Footer lang={lang} t={dictionary.footer} />
        </>
    );
}