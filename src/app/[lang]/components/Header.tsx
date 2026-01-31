"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Lang } from '@/lib/dictionary/dictionary'
import LanguageSwitcher from './LanguageSwitcher'
import { Menu, X } from 'lucide-react'

interface HeaderProps {
  lang: Lang;
  t: {
    home: string;
    about: string;
    courses: string;
    contact: string;
    trial: string;
  }
}

const Header = ({ lang, t }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Glass effect kicks in after 20px of scrolling
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const navItems = [
    { label: t.home, href: `/${lang}` },
    { label: t.about, href: `/${lang}/about` },
    { label: t.courses, href: `/${lang}/courses` },
    { label: t.contact, href: `/${lang}/contact` },
  ]

  return (
    <header
      className={`fixed w-full top-0 left-0 z-[1000] transition-all duration-500 ${
        mobileMenuOpen 
          ? 'bg-white' // Solid white when mobile menu is open
          : isScrolled 
            ? 'bg-white/70 backdrop-blur-md shadow-sm' // Glass effect
            : 'bg-transparent' // Initial state
      }`}
    >
      <div className="container mx-auto flex justify-between items-center p-5 py-3">
        {/* LOGO */}
        <Link 
          className="text-lg font-black tracking-tighter z-[1001]" 
          href={`/${lang}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          QUBIT<span className="text-primary">.</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:block">
          <ul className={`flex gap-6 transition-colors duration-300 ${isScrolled ? 'text-black' : 'text-zinc-600'}`}>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link 
                  className='text-[13px] font-bold hover:text-primary transition-colors tracking-widest uppercase' 
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 z-[1001]">
          <div className="block">
            <LanguageSwitcher currentLang={lang} />
          </div>

          <Button asChild size="sm" className="flex rounded-full font-bold px-5 bg-black text-white hover:bg-primary transition-all text-xs tracking-wide shadow-lg shadow-black/5">
            <Link href={`/${lang}/login`}>{t.trial}</Link>
          </Button>

          {/* MOBILE TOGGLE */}
          <button 
            className="md:hidden p-1 text-zinc-900 focus:outline-none" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* FULL SCREEN MOBILE MENU */}
      <div className={`
        fixed inset-0 bg-white z-[999] transition-all duration-500 ease-in-out md:hidden
        ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
      `}>
        <nav className="flex flex-col justify-center items-center h-full w-full px-8">
          <ul className="space-y-8 text-center">
            {navItems.map((item, index) => (
              <li 
                key={item.label} 
                className={`transition-all duration-500 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link 
                  className='text-xl font-bold text-zinc-900 uppercase tracking-[0.2em] hover:text-primary transition-colors' 
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header