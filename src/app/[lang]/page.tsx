import { Lang } from "@/lib/dictionary/dictionary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { getDictionary } from "@/lib/dictionary/get-dictionary";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRightCircle, Check, Clock } from "lucide-react";
import CountUp from "./components/CountUp";
// import PricingCarousel from "./components/PricingCarousel";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import PricingSection from "./components/PricingSection";

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
      {/* We pass both aboutSection and tutorials to keep WhyChooseUs dynamic */}
      <AboutCresca t={home.aboutSection} aboutSection={home.aboutSection} />
      <HowItWorks t={home.tutorials} />
      {/* <PricingCarousel /> */}
      <PricingSection />
      <Testimonials t={home.testimonials} />
      <Footer lang={lang} t={t.footer} />
    </div>
  );
}

function Hero({ t, nav }: { t: any, nav: any }) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#18181b]">
      <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[60%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0 animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-35%] right-[-10%] w-[65%] h-[55%] bg-orange-500/25 dark:bg-orange-600/10 rounded-full blur-[130px] pointer-events-none z-0 animate-[pulse_10s_ease-in-out_infinite]" />

      <div className="flex flex-col-reverse md:flex-row lg:container mx-auto relative z-10">
        <div className="w-full md:w-3/5 flex items-center">
          <div className="p-6 md:p-12 py-12 md:py-64 relative z-10 md:w-11/12">
            <h1 className="text-3xl md:text-[2.5rem] leading-tight md:leading-18 font-extrabold">
              <span className="text-orange-600">{t.title}</span> {t.subtitle}
            </h1>
            <p className="py-4 md:py-6 max-w-[700px] text-gray-500 text-sm md:text-base">
              {t.desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <Button className="">{nav.trial}</Button>
              <Button variant="outline" className="w-full sm:w-auto font-bold">
                {nav.curriculum}
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/5 relative z-[2] min-h-[400px] md:min-h-full">
          <div className="w-full h-full md:h-4/6 absolute bottom-0 md:bottom-16 left-1/2 md:-left-1/5 -translate-x-1/2 md:translate-x-0 flex items-center justify-center scale-[65%] md:scale-[90%]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-[130%] aspect-square border border-dashed border-primary/20 rounded-full animate-[spin_30s_linear_infinite]" />
              <div className="absolute w-[100%] aspect-square border border-orange-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
            </div>

            {[
              { src: '/China.png', delay: '-4s', size: 'w-14 h-14', orbit: 'w-[130%]' },
              { src: '/Brazil.png', delay: '-11s', size: 'w-16 h-16', orbit: 'w-[130%]' },
              { src: '/Mexico.png', delay: '-17s', size: 'w-12 h-12', orbit: 'w-[130%]' },
              { src: '/Germany.png', delay: '-0s', size: 'w-16 h-16', orbit: 'w-[100%]' },
              { src: '/Israel.png', delay: '-7s', size: 'w-16 h-16', orbit: 'w-[100%]' },
              { src: '/UAE.png', delay: '-14s', size: 'w-16 h-16', orbit: 'w-[100%]' },
            ].map((flag, i) => (
              <div
                key={i}
                style={{ animationDelay: flag.delay }}
                className={`absolute aspect-square rounded-full animate-[spin_20s_linear_infinite] pointer-events-none ${flag.orbit}`}
              >
                <div style={{ animationDelay: flag.delay }} className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className={`relative rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden shadow-lg animate-[spin_20s_linear_infinite_reverse] ${flag.size}`}>
                    <Image src={flag.src} fill className="object-cover" alt="flag" />
                  </div>
                </div>
              </div>
            ))}

            <div className="relative z-10 w-full h-full">
              <Image src="/home3.png" fill className="scale-100 md:scale-130 transform-origin-bottom p-0 w-full object-contain object-bottom" alt="Students" priority />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-2 md:py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 py-6 md:py-10 gap-2 md:gap-6 justify-center mx-auto">
          {[
            { label: t.stats.active, value: 3000 },
            { label: t.stats.languages, value: 15 },
            { label: t.stats.tutors, value: 850 },
            { label: t.stats.boost, value: 99 },
          ].map((stat, i) => (
            <div key={i} className="flex justify-center p-2 md:p-6 py-4 md:py-8">
              <div className="space-y-1 md:space-y-4 text-center">
                <h4 className="text-3xl md:text-5xl font-bold text-orange-600">
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
    </div>
  )
}

const letters = [
  { char: 'K', img: '/home3.png' },
  { char: 'Y', img: '/home3.png' },
  { char: 'R', img: '/home3.png' },
  { char: 'I', img: '/home3.png' },
  { char: 'O', img: '/home3.png' },
  { char: 'S', img: '/home3.png' }
];

function AboutCresca({ t, aboutSection }: { t: any, aboutSection: any }) {
  return (
    <section className="relative py-20 bg-white dark:bg-[#18181b] overflow-hidden">
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="blob-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
            <feGaussianBlur in="blur1" stdDeviation="3" result="blur2" />
            <feColorMatrix in="blur2" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 25 -12" result="blob" />
            <feComposite in="SourceGraphic" in2="blob" operator="atop" />
          </filter>
          <filter id="extra-curly" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.02 0.03" numOctaves="3" result="turbulence" />
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="absolute top-[-30%] right-[-10%] w-[65%] h-[55%] bg-orange-500/25 dark:bg-orange-600/10 rounded-full blur-[130px] pointer-events-none z-0 animate-[pulse_10s_ease-in-out_infinite]" />

      <div className="lg:container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-xl space-y-4">
            <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-xs">About Kyrios</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {t.title} <span className="text-orange-600 relative inline-block">
                {t.titleAccent}
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-orange-600/0 via-orange-600/50 to-orange-600/0 blur-sm"></span>
              </span>
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 items-center justify-items-center">
          {letters.map((item, i) => (
            <div key={i} className="relative w-full aspect-square group" style={{ animation: 'letter-wave 3s ease-in-out infinite', animationDelay: `${i * 0.15}s` }}>
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-2" style={{ filter: 'drop-shadow(0 15px 45px rgba(0,0,0,0.35))' }}>
                <defs>
                  <pattern id={`img-${i}`} x="0" y="0" width="1" height="1" patternContentUnits="objectBoundingBox">
                    <image href={item.img} x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice" />
                  </pattern>
                  <mask id={`text-mask-${i}`}>
                    <rect width="200" height="200" fill="black" />
                    <text x="100" y="150" fontSize="190" fontWeight="950" textAnchor="middle" fill="white" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Arial Black', sans-serif" style={{ filter: 'url(#blob-filter)', letterSpacing: '-0.05em' }}>
                      {item.char}
                    </text>
                  </mask>
                  <radialGradient id={`gradient-${i}`}>
                    <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                    <stop offset="50%" stopColor="rgba(0,0,0,0.1)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
                  </radialGradient>
                  <pattern id={`texture-${i}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)" />
                  </pattern>
                  <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(249,115,22,0.6)" />
                    <stop offset="50%" stopColor="rgba(249,115,22,0.2)" />
                    <stop offset="100%" stopColor="rgba(249,115,22,0.6)" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill={`url(#img-${i})`} mask={`url(#text-mask-${i})`} style={{ filter: 'url(#blob-filter)' }} />
                <circle cx="100" cy="100" r="90" fill={`url(#gradient-${i})`} mask={`url(#text-mask-${i})`} style={{ filter: 'url(#blob-filter)' }} className="opacity-60 mix-blend-overlay" />
                <circle cx="100" cy="100" r="90" fill={`url(#texture-${i})`} mask={`url(#text-mask-${i})`} style={{ filter: 'url(#blob-filter)' }} className="opacity-30 mix-blend-soft-light" />
                <circle cx="100" cy="100" r="92" fill="none" stroke="url(#glow-gradient)" strokeWidth="4" mask={`url(#text-mask-${i})`} style={{ filter: 'url(#blob-filter)' }} className="opacity-40" />
              </svg>
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-orange-500/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-2xl" />
              <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-1 h-1 bg-orange-500 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                <div className="absolute bottom-1/4 right-0 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" style={{ animationDuration: '2.5s' }}></div>
                <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-yellow-500 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 pt-12">
          <p className="max-w-3xl text-gray-500 dark:text-gray-400 text-lg leading-relaxed pb-2">
            {t.desc}
          </p>
        </div>
        <div className="max-w-xl space-y-4 pb-4 relative z-10">
          <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-xs pt-12">{t.title} {t.titleAccent}</h2>
        </div>
        <WhyChooseUs t={t.reasons} />
        <div className="mt-20 h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes letter-wave { 0%, 30%, 100% { transform: translateY(0); } 15% { transform: translateY(-15px); } }` }} />
    </section>
  );
}

function WhyChooseUs({ t }: { t: any }) {
  return (
    <div className="relative">
      <div className="container mx-auto pb-9 md:pb-16 px-6 relative">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 py-8 md:py-16 gap-6 md:gap-10 justify-center mx-auto">
          {t.map((step: any, i: number) => (
            <div key={i} className="group relative flex flex-col p-6 py-10 rounded-lg overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-black/[0.03] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-primary">
              <div className="absolute -top-10 -left-10 w-44 h-44 bg-primary/30 dark:bg-primary/20 rounded-full blur-[60px] pointer-events-none z-0 transition-opacity duration-500 group-hover:opacity-0" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-orange-600/30 dark:bg-orange-600/20 rounded-full blur-[70px] pointer-events-none z-0 transition-opacity duration-500 group-hover:opacity-0" />
              <div className="space-y-4 relative z-10 h-full flex flex-col">
                <h4 className="text-4xl font-black text-primary/40 dark:text-primary/30 tracking-tighter transition-colors duration-500 group-hover:text-white/30">0{i + 1}</h4>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white transition-colors duration-500 group-hover:text-white">{step.title}</h4>
                <p className="text-[0.85rem] md:text-[0.9rem] font-medium text-slate-600 dark:text-zinc-400 leading-relaxed flex-grow transition-colors duration-500 group-hover:text-white/90">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

