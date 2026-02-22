"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Lang } from '@/lib/dictionary/dictionary'
import LanguageSwitcher from './LanguageSwitcher'
import { Menu, X, ShoppingCart, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

interface HeaderProps {
  lang: Lang;
  t: {
    home: string;
    about: string;
    courses: string;
    contact: string;
    trial: string;
    faqs: string
  }
}

const Header = ({ lang, t }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
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

  // const navItems = [
  //   { label: t.home, href: `/${lang}` },
  //   { label: t.about, href: `/${lang}/about` },
  //   { label: t.courses, href: `/${lang}/courses` },
  //   { label: t.contact, href: `/${lang}/contact` },
  //   { label: t.faqs, href: `/${lang}/FAQs` },
  // ]

  const navItems = [
    { label: t.home, href: `/#` },
    { label: t.about, href: `/#` },
    { label: t.courses, href: `/#` },
    { label: t.contact, href: `/#` },
    { label: t.faqs, href: `/#` },
  ]


  return (
    <header
      className={`fixed w-full top-0 left-0 z-[1000] transition-all duration-500 ${mobileMenuOpen
        ? 'bg-background' // Use background variable for dark mode support
        : isScrolled
          ? 'bg-background/70 backdrop-blur-md shadow-sm border-b'
          : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto flex justify-between items-center p-5 py-3">
        <Link
          className="text-lg font-black tracking-tighter z-[1001]"
          href={`/${lang}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          CRESCA<span className="text-primary">.</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:block">
          <ul className={`flex gap-6 transition-colors duration-300 ${isScrolled ? 'text-foreground' : 'text-muted-foreground'}`}>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  className='text-[13px] font-bold hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors tracking-widest uppercase'
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex sm:gap-4 items-center">
          {/* Theme Switcher */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-8 h-8"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}


          <div className="">
            <LanguageSwitcher currentLang={lang} />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center md:gap-12 z-[1001]">




          <div className="flex items-center gap-6">
            {/* Cart Icon */}
            <Link href={`/${lang}/cart`} className="relative p-2 hover:text-primary transition-colors">
              <ShoppingCart size={20} />
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                0
              </span>
            </Link>


            <Button asChild size="sm" className="hidden sm:flex rounded-full font-bold px-4 bg-primary text-primary-foreground hover:opacity-90 transition-all text-xs tracking-wide shadow-lg">
              {/* <Link href={`/${lang}/login`}>{t.trial}</Link> */}
              <Link href={`/${lang}/#`}>{t.trial}</Link>

            </Button>

          </div>


          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden p-1 text-foreground focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`
        fixed inset-0 bg-background z-[999] transition-all duration-200 ease-in-out md:hidden
        ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
      `}>
        <nav className="flex flex-col justify-center items-center h-full w-full px-8">
          {/* Mobile Action Buttons */}
          <div className="flex gap-4 mb-12">
            <LanguageSwitcher currentLang={lang} />
            <Button asChild className="rounded-full px-6">{t.trial}</Button>
          </div>
          <ul className="space-y-8 text-center">
            {navItems.map((item, index) => (
              <li
                key={item.label}
                className={`transition-all duration-200 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link
                  className='text-xl font-bold text-foreground uppercase tracking-[0.2em] hover:text-primary transition-colors'
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