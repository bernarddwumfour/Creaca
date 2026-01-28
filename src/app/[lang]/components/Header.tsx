"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Lang } from '@/lib/dictionary'

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Use the dictionary values directly
  const navItems = [
    { label: t.home, href: `/${lang}` },
    { label: t.about, href: `/${lang}/about` },
    { label: t.courses, href: `/${lang}/courses` },
    { label: t.contact, href: `/${lang}/contact` },
  ]

  return (
    <div 
      className={`fixed w-full top-0 left-0 z-[1000] transition-all duration-300 ${
        isScrolled ? 'bg-white/60 backdrop-blur shadow-xs' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center p-4 pb-3">
        <Link className={`text-lg font-semibold ${isScrolled ? 'text-black' : 'text-gray-600'}`} href={`/${lang}`}>
          Cresca
        </Link>

        {/* Mapped Navigation */}
        <ul className={`flex gap-8 ${isScrolled ? 'text-black' : 'text-gray-600'}`}>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link className='text-sm font-medium hover:opacity-70 transition-opacity' href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {/* Language Switcher Buttons */}
          <div className="flex bg-gray-100/50 rounded-full p-1 border border-gray-200">
            {(['en', 'es', 'fr'] as const).map((l) => (
              <Link 
                key={l} 
                href={`/${l}`}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  lang === l 
                    ? 'bg-white text-black shadow-sm font-bold' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>

          <Button className={isScrolled ? 'text-white' : 'bg-black text-white hover:bg-black/80'}>
            {t.trial}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Header