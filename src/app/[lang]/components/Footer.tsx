"use client";
import { Globe } from "lucide-react";
import Link from "next/link";
import { Lang } from "@/lib/dictionary/dictionary";

interface FooterProps {
  lang: Lang;
  t: any;
}

const Footer = ({ lang, t }: FooterProps) => {
  const langNames: Record<string, string> = {
    en: "English",
    es: "Español",
    fr: "Français",
  };
  const destinations = [
    [`/${lang}/courses`, `/${lang}/courses`, `/${lang}/courses`, `/${lang}/courses`],
    [`/${lang}/FAQs`, `/${lang}/contact`, `/${lang}/FAQs`, `/${lang}/about`],
    [`/${lang}/about`, `/${lang}/contact`, `/${lang}/login`, `/${lang}/contact`],
    [`/${lang}/FAQs`, `/${lang}/FAQs`, `/${lang}/about`, `/${lang}/contact`],
  ];

  return (
    <footer className="w-full bg-[#18181b] text-white border-t border-zinc-800/50">
      <div className="mx-auto container px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-12 py-16 md:py-24">

          {/* Brand Section - Takes full width on mobile, 2 columns on desktop */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-6 text-center lg:text-left">
            <Link href={`/${lang}`} className="flex justify-center lg:justify-start items-center gap-2 group">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center font-black text-lg text-white group-hover:scale-110 transition-transform">
                Q
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">KYRIOS<span className="text-primary">.</span></span>
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto lg:mx-0">
              {t.mission}
            </p>

            {/* Language Indicator */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-zinc-500 hover:text-white transition-colors cursor-default text-[11px] font-bold uppercase tracking-widest">
              <Globe size={14} className="text-primary" />
              <span>{langNames[lang]}</span>
            </div>

            <div className="pt-2">
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center justify-center h-11 px-8 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 shadow-xl shadow-black/20"
              >
                {t.contactBtn}
              </Link>
            </div>
          </div>

          {/* Dynamic Navigation Sections */}
          {t.sections.map((section: any, idx: number) => (
            <div key={idx} className="text-center sm:text-left">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100 mb-6">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((linkText: string, linkIdx: number) => (
                  <li key={linkIdx}>
                    <Link
                      href={destinations[idx]?.[linkIdx] ?? `/${lang}`}
                      className="text-sm text-zinc-500 hover:text-primary transition-colors duration-200"
                    >
                      {linkText}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-10 border-t border-zinc-800/50">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
                © 2026 KYRIOS. {t.learners} {t.rights}
              </span>
              <div className="mt-3 flex justify-center gap-4 text-xs text-zinc-500 lg:justify-start">
                <Link href={`/${lang}/privacy`} className="hover:text-white">Privacy</Link>
                <Link href={`/${lang}/terms`} className="hover:text-white">Terms & refunds</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
