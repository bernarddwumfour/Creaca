import { dict, Lang } from "@/lib/dictionariy/dictionary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { getDictionary } from "@/lib/dictionariy/get-dictionary";
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

  // Point to the specific home page data
  const home = t.pages.home;

  return (
    <div>
      <Header lang={lang} t={t.nav}/>
      <Hero t={home.hero} nav={t.nav} />
      <Stats t={home.stats} />
      <About t={home.aboutSection} />
      <Tutorials t={home.tutorials} />
      <Pricing t={home.pricing}/>
      <Testimonials t={home.testimonials} />
      <Footer lang={lang} t={t.footer} />
    </div>
  );
}


function Hero({ t, nav }: { t: any, nav: any }) {
  return (
    <div className="bg-gradient-to-r from-white from-50% to-primary to-50%">
      <div className="flex lg:container mx-auto  overflow-hidden">
        <div className="bg-white w-3/5 flex items-center">
          <div className=" p-12 py-64 py-6">
            <h1 className="text-5xl leading-18 font-extrabold">
              <span className="text-primary">{t.title}</span> {t.subtitle}
            </h1>
            <p className="py-6 max-w-[700px] text-gray-500">
              {t.desc}
            </p>

            <div className="flex gap-6">
              <Button className="">{nav.trial}</Button>
              <Button variant={"outline"}>{nav.curriculum}</Button>
            </div>
          </div>
        </div>
        <div className="bg-primary w-2/5 relative z-[2]">
          <div className="w-5/6 h-4/6 absolute bottom-16  -left-1/5">
            <Image src="/home2.png"  fill className="absolute scale-130 transform-origin-bottom p-0 w-full  -left-[200px]" alt="Diverse students communicating" />
          </div>
        </div>
      </div>
    </div>
  )
}


function Stats({ t }: { t: any }) {
  return (
    <section className="bg-slate-100/30">
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 py-10 gap-6 justify-center mx-auto">
          {[
            { label: t.active, value: 3000 },
            { label: t.languages, value: 15 },
            { label: t.tutors, value: 850 },
            { label: t.boost, value: 99 },
          ].map((stat, i) => (
            <div key={i} className="flex justify-center p-6 py-8">
              <div className="space-y-4">
                <h4 className="text-5xl font-bold text-primary">
                  <CountUp end={stat.value} />
                  {stat.label === t.boost && "%"}
                </h4>
                <p className="text-[.85rem] font-semibold text-muted-foreground">
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
    <section className="py-24 relative bg-primary/3">
      <div className="w-full container px-4 md:px-5 lg:px-5 mx-auto">

        <div className="w-full justify-between items-center gap-12 grid lg:grid-cols-2 grid-cols-1">
          <div
            className="w-full justify-center items-start gap-6  lg:order-first order-last relative">
            <div className="pt-24 lg:justify-center sm:justify-end w-[95%] h-[700px] justify-start items-start gap-2.5 flex relative">
              <Image fill className=" rounded-xl object-cover scale-90" src="/about_image.png" alt="Students from diverse backgrounds collaborating" />
            </div>
          </div>
          <div className="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex">
            <div className="w-full flex-col justify-center items-start gap-4 flex">

              <div className="space-y-4 pb-6">
                <h3 className="text-4xl text-start font-bold max-w-[800px] leading-12">
                  {t.title}
                </h3>
                <p className="text-start text-sm text-gray-500 max-w-[700px]">
                  {t.desc}
                </p>
              </div>


              <div className="w-full flex-col justify-start lg:items-start items-center  flex">
                <h2
                  className="text-gray-900 text-4xl font-bold font-manrope leading-normal lg:text-start text-center">
                  Language Without Borders</h2>
                <p className="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                  Whether you’re dialing in from a bustling city in Brazil, a quiet town in Vietnam, or a tech hub in Berlin, our platform feels like home.
                </p>
              </div>
              <div className="w-full lg:justify-start justify-center items-center sm:gap-10 gap-5 inline-flex">
                <div className="flex-col justify-start items-start inline-flex">
                  <h3 className="text-gray-900 text-4xl font-bold font-manrope leading-normal">190+</h3>
                  <h6 className="text-gray-500 text-base font-normal leading-relaxed">{t.stats[0]}</h6>
                </div>
                <div className="flex-col justify-start items-start inline-flex">
                  <h4 className="text-gray-900 text-4xl font-bold font-manrope leading-normal">Unlimited</h4>
                  <h6 className="text-gray-500 text-base font-normal leading-relaxed">{t.stats[1]}</h6>
                </div>
                <div className="flex-col justify-start items-start inline-flex">
                  <h4 className="text-gray-900 text-4xl font-bold font-manrope leading-normal">Zero</h4>
                  <h6 className="text-gray-500 text-base font-normal leading-relaxed">{t.stats[2]}</h6>
                </div>
              </div>
            </div>
            <Button>
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
    <section className="">
      <div className="container mx-auto py-24">
        <div className="space-y-4 pb-4">
          <h3 className="text-4xl font-bold max-w-[700px] leading-12">
            {t.title}
          </h3>
          <p className="text-sm text-gray-500">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 py-16 gap-10 justify-center mx-auto">
          {t.steps.map((step: any, i: number) => (
            <div key={i} className="flex justify-center p-6 py-8 relative bg-gray-50/30 border-b-4 border-violet-600 rounded-md">
              <div className="space-y-4 w-full max-w-[250px] p-4">
                <h4 className="text-7xl -z-1 font-extrabold absolute top-2 left-2 text-primary/30">
                  0{i + 1}
                </h4>
                <h4 className="text-2xl font-bold text-gray-800">
                  {step.title}
                </h4>
                <p className="text-[.85rem] font-semibold text-muted-foreground">
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
    <section className="flex flex-col items-start my-24 text-sm container mx-auto relative px-4">
      <div className="space-y-4 pb-4">
        <h3 className="text-4xl font-bold max-w-[700px] leading-tight">
          {t.title}
        </h3>
        <p className="text-sm text-gray-500">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {t.items.map((testimonial: any, index: number) => (
          <div 
            key={index} 
            className="border border-slate-200 p-6 rounded-lg hover:-translate-y-1 hover:shadow-xl hover:border-transparent transition duration-500 bg-white"
          >
            <p className="text-base text-slate-500 leading-relaxed italic">
              "{testimonial.content}"
            </p>
            <div className="flex items-center gap-3 mt-8">
              <div className="relative w-12 h-12 flex-shrink-0">
                <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                  {testimonial.name[testimonial.name.length - 1]}
                </div>
              </div>
              <div>
                <h2 className="text-base text-gray-900 font-bold">
                  {testimonial.name}
                </h2>
                <p className="text-gray-500 text-xs">
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

interface PricingProps {
  t: {
    title: string;
    subtitle: string;
    desc: string;
    stats: string[];
    button: string;
    plans: any[];
  };
}

const Pricing = ({ t }: PricingProps) => {
  return (
    <section className="py-24 relative overflow-hidden bg-primary/3">
      {/* Background decoration */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />

      <div className="container px-4 md:px-5 mx-auto">
        <div className="grid lg:grid-cols-5 grid-cols-1 gap-16 items-center">

          {/* LEFT CONTENT COLUMN */}
          <div className="flex flex-col items-start lg:col-span-2 gap-8">
            <div className="space-y-4">
              <p className="text-primary font-bold tracking-widest uppercase text-sm">
                {t.subtitle}
              </p>
              <h2 className="text-gray-900 dark:text-white text-4xl md:text-5xl font-bold leading-tight">
                {t.title}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                {t.desc}
              </p>
            </div>

            {/* STATS FROM DICTIONARY */}
            <div className="grid grid-cols-2 gap-8 w-full py-4 border-y border-border">
              <div>
                <h4 className="text-3xl font-bold text-foreground">100%</h4>
                <p className="text-sm text-muted-foreground">{t.stats[0]}</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-foreground">24/7</h4>
                <p className="text-sm text-muted-foreground">{t.stats[1]}</p>
              </div>
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg">
              {t.button} <ArrowRightCircle className="ml-2" />
            </Button>
          </div>

          {/* RIGHT CAROUSEL COLUMN */}
          <PricingCarousel data={t.plans} />

        </div>
      </div>
    </section>
  );
};