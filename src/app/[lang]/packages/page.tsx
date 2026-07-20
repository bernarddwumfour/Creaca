import { getDictionary } from "@/lib/dictionary/get-dictionary";
import PackagesGrid from "./PackagesGrid";
import { Lang } from "@/lib/dictionary/dictionary";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";

type PageProps = {
    params: Promise<{
        lang: Lang;
    }>;
};


export default async function PackagesPage({ params }: PageProps) {
    const { lang } = await params;
    const dictionary = getDictionary(lang);


    return (
        <>
            <Header lang={lang} t={dictionary.nav} />

            <div className="min-h-screen bg-white dark:bg-[#18181b] py-12 px-4 md:px-20 relative overflow-hidden transition-colors duration-500">
                {/* Background Effects */}
                <div className="absolute bottom-[-35%] right-[-5%] w-[65%] h-[55%] bg-orange-500/25 dark:bg-orange-600/10 rounded-full blur-[130px] pointer-events-none z-0 animate-[pulse_10s_ease-in-out_infinite]" />
                <div className="absolute top-[-50%] left-[-15%] w-[70%] h-[60%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0 animate-[pulse_8s_ease-in-out_infinite]" />

                <div className="">
                    {/* <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 -ml-2 text-zinc-600 dark:text-zinc-400 hover:text-primary"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button> */}


                </div>

                <div className="container mx-auto mt-24">
                    <h1 className="text-3xl md:text-4xl leading-tight font-extrabold max-w-full md:max-w-2/3">
                        {dictionary.pages.learner.packages.title} <span className="text-orange-600">{dictionary.pages.learner.packages.titleAccent}</span>
                    </h1>
                    <p className="py-4 md:py-6 max-w-[750px] text-gray-500 leading-relaxed text-base md:text-lg">
                        {dictionary.pages.learner.packages.subtitle}
                    </p>
                </div>

                <PackagesGrid lang={lang} />
            </div>
            <Footer lang={lang} t={dictionary.footer} />
        </>
    );
}
