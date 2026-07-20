"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Lang } from '@/lib/dictionary/dictionary'
import LanguageSwitcher from './LanguageSwitcher'
import {
  Menu, X, Sun, Moon, LayoutDashboard, LogOut,
  Settings, ChevronDown, Bell, CheckCircle2
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateAvatarFromUser } from '../profile/avatarHelpers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { ENDPOINTS } from '@/lib/endpoints'
import { learnerDict } from '@/lib/dictionary/learner'

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
  const labels = learnerDict[lang in learnerDict ? lang : 'en'].header
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get(ENDPOINTS.PLATFORM.NOTIFICATIONS, { params: { page_size: 5 } })).data.data,
    enabled: !!user,
  })
  const markRead = useMutation({
    mutationFn: async (id: string) => api.patch(ENDPOINTS.PLATFORM.MARK_NOTIFICATION_READ.replace(':id', id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

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

  const avatarUrl = useMemo(() => {
    return generateAvatarFromUser(user);
  }, [user]);


  const navItems = [
    { label: t.home, href: `/${lang}` },
    { label: t.about, href: `/${lang}/about` },
    { label: t.courses, href: `/${lang}/courses` },
    { label: t.contact, href: `/${lang}/contact` },
  ]

  const dashboardPath = user?.role === 'ADMIN' || user?.role === 'STAFF' ? `/admin` : `/${lang}/dashboard`;

  return (
    <header
      className={`fixed w-full top-0 left-0 z-[100] transition-all duration-500 ${mobileMenuOpen
        ? 'bg-background'
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
          KYRIOS<span className="text-primary">.</span>
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

        {/* ACTIONS */}
        <div className="flex items-center md:gap-12 z-[1001]">
          <div className="flex items-center gap-6">
            <div className="flex sm:gap-4 items-center">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  <span className="sr-only">{labels.theme}</span>
                </Button>
              )}

              <div>
                <LanguageSwitcher currentLang={lang} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>

                  <Button asChild size="sm" variant="outline" className="hidden sm:flex rounded-full font-bold px-4 border-primary/20 hover:bg-primary/5 text-primary transition-all text-xs tracking-wide">
                    <Link href={dashboardPath} className="flex items-center gap-2">
                      <LayoutDashboard size={14} />
                      {labels.dashboard}
                    </Link>
                  </Button>


                  {/* Notifications Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900">
                        <Bell size={20} />
                        {!!notificationData?.unread_count && <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-120 mt-2 rounded-2xl p-0 dark:bg-[#111114] border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
                      <DropdownMenuLabel className="p-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                        <span className="text-sm font-black tracking-tight">{labels.notifications}</span>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">{notificationData?.unread_count || 0} {labels.newLabel}</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="m-0" />
                      <ScrollArea className="h-80">
                        {(notificationData?.results || []).map((note: any) => (
                          <DropdownMenuItem key={note.id} onClick={() => !note.is_read && markRead.mutate(note.id)} className="p-4 focus:bg-zinc-50 dark:focus:bg-zinc-900 cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                            <div className="flex gap-4">
                              <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-emerald-500/10">
                                <CheckCircle2 size={18} className="text-emerald-500" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[11px] font-medium text-zinc-500 leading-tight line-clamp-2">
                                  {note.message}
                                </p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                                  {new Date(note.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </ScrollArea>
                      <DropdownMenuSeparator className="m-0" />
                      <Link href={`/${lang}/notifications`}>
                        <div className="p-3 text-center text-[10px] font-black uppercase text-primary hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                          {labels.viewAll}
                        </div>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 outline-none group">
                        <Avatar className="w-8 h-8 border-2 border-primary/20 p-0.5 transition-transform group-hover:scale-105">
                          <AvatarImage
                            src={avatarUrl}
                            alt={user?.first_name || 'Avatar'}
                          />
                          <AvatarFallback className="bg-primary text-white text-[10px] font-black">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <ChevronDown size={14} className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 dark:bg-[#111114] border-zinc-200 dark:border-zinc-800 shadow-xl">
                      <DropdownMenuLabel className="p-3">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-black">{user.first_name} {user.last_name}</p>
                          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">{user.role}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={dashboardPath} className="flex items-center gap-2 p-2.5 py-3 text-xs font-bold rounded-xl cursor-pointer">
                          <LayoutDashboard size={16} /> {labels.dashboard}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/${lang}/profile`} className="flex items-center gap-2 p-2.5 py-3 text-xs font-bold rounded-xl cursor-pointer">
                          <Settings size={16} /> {labels.profile}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={logout}
                        className="flex items-center gap-2 p-2.5 text-xs font-bold rounded-xl cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
                      >
                        <LogOut size={16} /> {labels.signOut}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button asChild size="sm" className="hidden sm:flex rounded-full font-bold px-4 bg-primary text-primary-foreground hover:opacity-90 transition-all text-xs tracking-wide shadow-lg">
                  <Link href={`/${lang}/login`}>{t.trial}</Link>
                </Button>
              )}
            </div>
          </div>

          <button
            className="md:hidden ms-4 p-1 text-foreground focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={labels.menu}
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
          <div className="flex flex-col items-center gap-4 mb-12">
            <LanguageSwitcher currentLang={lang} />
            {user ? (
              <Button asChild className="rounded-full px-8 font-bold" onClick={() => setMobileMenuOpen(false)}>
                <Link href={dashboardPath}>{labels.goToDashboard}</Link>
              </Button>
            ) : (
              <Button asChild className="rounded-full px-8 font-bold" onClick={() => setMobileMenuOpen(false)}>
                <Link href={`/${lang}/login`}>{t.trial}</Link>
              </Button>
            )}
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
            {user && (
              <li onClick={logout}>
                <span className="text-xl font-bold text-red-500 uppercase tracking-[0.2em]">{labels.signOut}</span>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
