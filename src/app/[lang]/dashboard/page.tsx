import { Lang } from '@/lib/dictionary/dictionary';
import { getDictionary } from '@/lib/dictionary/get-dictionary';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardContent from './DashboardContent';

type PageProps = {
    params: {
        lang: Lang;
    };
};

export default async function DashboardPage({ params }: PageProps) {
    const { lang } = await params;
    const dictionary = getDictionary(lang);

    return (
        <>
            <Header lang={lang} t={dictionary.nav} />
            <main className="min-h-screen bg-zinc-50 dark:bg-[#09090b] pt-24 pb-16 relative overflow-hidden">
                {/* Background Decorations - Matching Profile exactly */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="mx-auto space-y-8">
                        <div className='pt-10'>
                            <h1 className="text-3xl md:text-3xl font-black tracking-tighter">
                                Student <span className="text-primary">Workspace.</span>
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">
                                Track your progress and continue your mathematical journey.
                            </p>
                        </div>

                        <DashboardContent lang={lang} />
                    </div>
                </div>
            </main>
            <Footer lang={lang} t={dictionary.footer} />
        </>
    );
}