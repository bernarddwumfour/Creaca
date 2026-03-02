import { Lang } from '@/lib/dictionary/dictionary';
import { getDictionary } from '@/lib/dictionary/get-dictionary';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CourseGrid from './CourseGrid';

type PageProps = {
    params: {
        lang: Lang;
    };
};

export default async function page({ params }: PageProps) {
    const { lang } = await params;
    const dictionary =  getDictionary(lang);
    const t = dictionary.pages.courses; 

    return (
        <>
            <Header lang={lang} t={dictionary.nav} />
            <main className="min-h-screen bg-white dark:bg-[#18181b] relative">
                

                {/* Hero Section */}
                {/* Reduced py-24 to py-12 on mobile */}
                <section className="py-6 md:py-8 relative overflow-hidden bg-primary/[0.02] dark:bg-[#18181b]">
                    <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[60%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0 animate-[pulse_8s_ease-in-out_infinite]" />
                    <div className="container mx-auto px-6 pt-12 md:pt-24">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl leading-tight font-extrabold text-zinc-900 dark:text-white max-w-full md:max-w-2/3">
                                {t.hero.title} <span className="text-primary">{t.hero.titleAccent}</span>
                            </h1>
                            <p className="py-4 md:py-6 max-w-[750px] text-gray-500 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                                {t.hero.description}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Courses Section */}
                {/* Scaled py-24 to py-12 for mobile */}
                <section className="py-4 md:py-8 pb-16 relative ">
                    <CourseGrid lang={lang}/>

                    <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="absolute top-[15%] left-[30%] w-24 h-24 bg-orange-500/20 rounded-full blur-3xl animate-float-slow" />
                        <div className="absolute top-[40%] right-[15%] w-36 h-36 bg-primary/20 rounded-full blur-3xl animate-float-medium" />
                        <div className="absolute bottom-[25%] left-[45%] w-48 h-48 bg-orange-600/15 rounded-full blur-3xl animate-float-fast" />
                        <div className="absolute top-[60%] left-[35%] w-20 h-20 bg-primary/25 rounded-full blur-2xl animate-float-slow-reverse" />
                        <div className="absolute bottom-[35%] right-[25%] w-32 h-32 bg-orange-500/20 rounded-full blur-3xl animate-float-medium" />
                        <div className="absolute top-[20%] right-[30%] w-16 h-16 bg-primary/30 rounded-full blur-2xl animate-ping-slow" />
                        <div className="absolute top-[25%] left-[30%] w-3 h-3 bg-orange-400 rounded-full animate-pulse-slow" />
                        <div className="absolute bottom-[40%] right-[10%] w-4 h-4 bg-primary-300 rounded-full animate-pulse-slower" />
                        <div className="absolute top-[70%] left-[40%] w-2 h-2 bg-orange-500 rounded-full animate-ping-slow" />
                    </div>

                    
                    
                </section>

               
            </main>
            <Footer lang={lang} t={dictionary.footer} />
        </>
    )
}

 {/* CTA Section */}
//  <section className="py-12 md:py-24 container mx-auto px-6">
//  {/* Reduced p-12 to p-8 on mobile */}
//  <div className="bg-primary rounded-xl p-8 md:p-20 relative overflow-hidden text-center">
//      <div className="relative z-10 space-y-4 md:space-y-6">
//          {/* Font reduced from 4xl to 2xl on mobile */}
//          <h2 className="text-white text-2xl md:text-4xl font-black max-w-2xl mx-auto leading-tight">
//              {t.cta.title}
//          </h2>
//          {/* Button full width on mobile */}
//          <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-zinc-100 rounded-full font-bold px-10 py-6 md:py-7 text-base md:text-lg shadow-xl">
//              {t.cta.button}
//          </Button>
//      </div>
//      {/* Shrunk watermark icons for mobile */}
//      <Globe2 className="absolute -bottom-10 -left-10 text-white/10 w-32 h-32 md:w-64 md:h-64" />
//      <BookOpen className="absolute -top-10 -right-10 text-white/10 w-32 h-32 md:w-64 md:h-64" />
//  </div>
// </section>