import { Lang } from "@/lib/dictionary/dictionary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { getDictionary } from "@/lib/dictionary/get-dictionary";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRightCircle } from "lucide-react";
import CountUp from "./components/CountUp";
import PricingCarousel from "./components/PricingCarousel";

type PageProps = {
  params: {
    lang: Lang;
  };
};

export default async function Home({ params }: PageProps) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const home = t.pages.home;

  return (
    <div className="overflow-x-hidden">
      <Header lang={lang} t={t.nav} />
      <Hero t={home.hero} nav={t.nav} />
      <Stats t={home.stats} />
      <About t={home.aboutSection} />
      <Tutorials t={home.tutorials} />
      <Pricing t={home.pricing} />
      <Testimonials t={home.testimonials} />
      <Footer lang={lang} t={t.footer} />
    </div>
  );
}

function Hero({ t, nav }: { t: any, nav: any }) {
  return (
    <div className="bg-gradient-to-r from-white from-50% to-primary to-50%">
      <div className="flex flex-col-reverse md:flex-row lg:container mx-auto overflow-hidden">

        <div className="bg-white w-full md:w-3/5 flex items-center">
          {/* Reduced padding for mobile (py-12) vs original (py-64) */}
          <div className="p-6 md:p-12 py-12 md:py-64">
            {/* Font reduced from 2.5rem to 3xl on mobile */}
            <h1 className="text-3xl md:text-[2.5rem] leading-tight md:leading-18 font-extrabold">
              <span className="text-primary">{t.title}</span> {t.subtitle}
            </h1>
            <p className="py-4 md:py-6 max-w-[700px] text-gray-500 text-sm md:text-base">
              {t.desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <Button className="w-full sm:w-auto">{nav.trial}</Button>
              <Button variant={"outline"} className="w-full sm:w-auto">{nav.curriculum}</Button>
            </div>
          </div>
        </div>
        {/* Mobile image container height control */}
        <div className="bg-primary w-full md:w-2/5 relative z-[2] min-h-[400px] md:min-h-full">
          <div className="w-full h-full md:h-4/6 absolute bottom-0 md:bottom-16 left-1/2 md:-left-1/5 -translate-x-1/2 md:translate-x-0">
            <Image
              src="/home2.png"
              fill
              className="absolute scale-100 md:scale-130 transform-origin-bottom p-0 w-full object-contain object-bottom"
              alt="Students"
            />
          </div>
        </div>

        <div className="bg-primary h-24 md:hidden">

        </div>
      </div>
    </div>
  )
}

function Stats({ t }: { t: any }) {
  return (
    <section className="bg-slate-100/30">
      <div className="container mx-auto py-2 md:py-6">
        {/* Reduced gap and vertical padding for mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 py-6 md:py-10 gap-2 md:gap-6 justify-center mx-auto">
          {[
            { label: t.active, value: 3000 },
            { label: t.languages, value: 15 },
            { label: t.tutors, value: 850 },
            { label: t.boost, value: 99 },
          ].map((stat, i) => (
            <div key={i} className="flex justify-center p-2 md:p-6 py-4 md:py-8">
              <div className="space-y-1 md:space-y-4 text-center">
                {/* Font reduced from 5xl to 3xl on mobile */}
                <h4 className="text-3xl md:text-5xl font-bold text-primary">
                  <CountUp end={stat.value} />
                  {stat.label === t.boost && "%"}
                </h4>
                <p className="text-[0.7rem] md:text-[.85rem] font-semibold text-muted-foreground uppercase">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function About({ t }: { t: any }) {
  return (
    <section className="py-12 md:py-24 relative bg-primary/3">
      <div className="w-full container px-4 mx-auto">
        <div className="w-full justify-between items-center gap-8 md:gap-12 grid lg:grid-cols-2 grid-cols-1">

          {/* Image second on mobile */}
          <div className="w-full flex justify-center items-start relative ">
            <div className="relative w-full aspect-video md:h-[450px] scale-120">
              <Image fill className="rounded-xl object-contain scale-90" src="/about_image.png" alt="Students" />
            </div>
          </div>

          {/* Order adjustment: Text first on mobile */}
          <div className="w-full flex-col justify-center lg:items-start items-center gap-6 md:gap-10 inline-flex">
            <div className="w-full flex-col justify-center items-center lg:items-start gap-4 flex">
              <div className="space-y-2 md:space-y-4 pb-4 md:pb-6 text-center lg:text-left">
                {/* Font reduced from 4xl to 2xl on mobile */}
                <h3 className="text-2xl md:text-4xl font-bold max-w-[800px] leading-tight md:leading-12">
                  {t.title}
                </h3>
                <p className="text-sm md:text-base text-gray-500 max-w-[700px]">
                  {t.desc}
                </p>
              </div>
              <div className="w-full flex-col justify-start lg:items-start items-center flex">
                <h2 className="text-gray-900 text-2xl md:text-4xl font-bold leading-normal text-center lg:text-start">
                  Language Without Borders
                </h2>
                <p className="text-gray-500 text-sm md:text-base font-normal leading-relaxed text-center lg:text-start">
                  Whether you’re in Brazil, Vietnam, or Berlin, our platform feels like home.
                </p>
              </div>
              <div className="w-full lg:justify-start justify-center items-center gap-6 md:gap-10 inline-flex py-4">
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl md:text-4xl font-bold">190+</h3>
                  <h6 className="text-[10px] md:text-base text-gray-500">{t.stats[0]}</h6>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className="text-2xl md:text-4xl font-bold text-gray-900">∞</h4>
                  <h6 className="text-[10px] md:text-base text-gray-500">{t.stats[1]}</h6>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className="text-2xl md:text-4xl font-bold text-gray-900">0</h4>
                  <h6 className="text-[10px] md:text-base text-gray-500">{t.stats[2]}</h6>
                </div>
              </div>
            </div>
            <Button className="w-full sm:w-auto">
              Join Our Global Village <ArrowRightCircle className="ml-2" />
            </Button>
          </div>
          
        </div>
      </div>
    </section>
  )
}

function Tutorials({ t }: { t: any }) {
  return (
    <section>
      {/* Reduced py-24 to py-12 on mobile */}
      <div className="container mx-auto py-12 md:py-24 px-6">
        <div className="space-y-2 md:space-y-4 pb-4">
          <h3 className="text-2xl md:text-4xl font-bold max-w-[700px] leading-tight md:leading-12">
            {t.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-500">
            {t.subtitle}
          </p>
        </div>
        {/* Changed from 2 columns to 1 column on small mobile for better readability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 py-8 md:py-16 gap-6 md:gap-10 justify-center mx-auto">
          {t.steps.map((step: any, i: number) => (
            <div key={i} className="flex justify-center p-4 md:p-6 py-8 relative bg-gray-50/30 border-b-4 border-violet-600 rounded-md">
              <div className="space-y-2 md:space-y-4 w-full max-w-[250px] p-2 md:p-4">
                <h4 className="text-5xl md:text-7xl -z-1 font-extrabold absolute top-2 left-2 text-primary/30">
                  0{i + 1}
                </h4>
                <h4 className="text-xl md:text-2xl font-bold text-gray-800 relative z-10">
                  {step.title}
                </h4>
                <p className="text-[0.75rem] md:text-[.85rem] font-semibold text-muted-foreground relative z-10">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials({ t }: { t: any }) {
  return (
    <section className="flex flex-col items-start my-12 md:my-24 text-sm container mx-auto relative px-4">
      <div className="space-y-2 md:space-y-4 pb-4">
        <h3 className="text-2xl md:text-4xl font-bold max-w-[700px] leading-tight">
          {t.title}
        </h3>
        <p className="text-xs md:text-sm text-gray-500">
          {t.subtitle}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-10">
        {t.items.map((testimonial: any, index: number) => (
          <div
            key={index}
            className="border border-slate-200 p-4 md:p-6 rounded-lg hover:-translate-y-1 transition duration-500 bg-white"
          >
            <p className="text-sm md:text-base text-slate-500 leading-relaxed italic">
              "{testimonial.content}"
            </p>
            <div className="flex items-center gap-3 mt-6 md:mt-8">
              <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                  {testimonial.name[0]}
                </div>
              </div>
              <div>
                <h2 className="text-sm md:text-base text-gray-900 font-bold">
                  {testimonial.name}
                </h2>
                <p className="text-gray-500 text-[10px] md:text-xs">
                  {testimonial.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const Pricing = ({ t }: { t: any }) => {
  return (
    <section className="py-12 md:py-24 relative overflow-hidden bg-primary/3">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="container px-4 md:px-5 mx-auto">
        <div className="grid lg:grid-cols-5 grid-cols-1 gap-10 md:gap-16 items-center">
          <div className="flex flex-col items-start lg:col-span-2 gap-6 md:gap-8">
            <div className="space-y-2 md:space-y-4">
              <p className="text-primary font-bold tracking-widest uppercase text-[10px] md:text-sm">
                {t.subtitle}
              </p>
              <h2 className="text-gray-900 text-3xl md:text-5xl font-bold leading-tight">
                {t.title}
              </h2>
              <p className="text-muted-foreground text-sm md:text-lg leading-relaxed max-w-md">
                {t.desc}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-8 w-full py-4 border-y border-border">
              <div>
                <h4 className="text-2xl md:text-3xl font-bold text-foreground">100%</h4>
                <p className="text-[10px] md:text-sm text-muted-foreground">{t.stats[0]}</p>
              </div>
              <div>
                <h4 className="text-2xl md:text-3xl font-bold text-foreground">24/7</h4>
                <p className="text-[10px] md:text-sm text-muted-foreground">{t.stats[1]}</p>
              </div>
            </div>
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 md:py-6 rounded-full text-base md:text-lg">
              {t.button} <ArrowRightCircle className="ml-2" />
            </Button>
          </div>
          <PricingCarousel data={t.plans} />
        </div>
      </div>
    </section>
  );
};