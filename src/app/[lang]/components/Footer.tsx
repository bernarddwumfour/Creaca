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
                      href="#" 
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
                © 2026 QUBIT. {t.learners} {t.rights}
              </span>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 order-1 lg:order-2">
                <SocialLink href="#">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </SocialLink>
                <SocialLink href="#">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 2.487.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-2.488 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zM18.406 3.991a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>
                </SocialLink>
                <SocialLink href="#">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </SocialLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a 
        href={href} 
        className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex justify-center items-center hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all duration-300 text-white"
    >
        {children}
    </a>
);

export default Footer;