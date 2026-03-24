'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Added for active state
import { useTheme } from 'next-themes';
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    LogOut,
    Search,
    Bell,
    Plus,
    Zap,
    TrendingUp,
    BrainCircuit,
    Users, // For User Management
    Terminal, // For Logs
    Menu,
    X,
    Sun,
    Moon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SIDEBAR_LINKS = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin/dashboard' },
    { icon: BookOpen, label: 'Modules', href: '/admin/modules' },
    { icon: BrainCircuit, label: 'AI Tutor', href: '/admin/ai-tutor' },
    { icon: Users, label: 'User Management', href: '/admin/users' },
    { icon: Terminal, label: 'Audit Logs', href: '/admin/logs' },
    { icon: TrendingUp, label: 'Performance', href: '/admin/stats' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111114] border-r border-zinc-200 dark:border-zinc-800 transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-black text-2xl tracking-tighter">KYRIOS<span className="text-primary">.</span></span>
                    </Link>
                </div>

                <nav className="px-4 space-y-1 mt-4">
                    {SIDEBAR_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all group ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-zinc-500 hover:text-primary hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                    }`}
                            >
                                <link.icon size={20} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-8 left-0 w-full px-4 space-y-2">

                    <Button variant="ghost" className="w-full justify-start gap-3 font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
                        <LogOut size={20} />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 flex flex-col">
                {/* Top Navbar */}
                <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-[#09090b]/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden text-zinc-500 hover:text-primary transition-colors">
                            {isSidebarOpen ? <X /> : <Menu />}
                        </button>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 border border-transparent focus-within:border-primary/30 transition-all">
                            <Search size={16} />
                            <input type="text" placeholder="Search modules..." className="bg-transparent border-none outline-none text-xs w-64 placeholder:font-medium" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div>
                            {/* Theme Toggler */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="relative rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            >
                                {theme === 'dark' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-primary" />}

                            </Button>


                            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900">
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-zinc-900" />
                            </Button>
                        </div>
                        <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-xs font-black tracking-tight">Bernard N.</span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Administrator</span>
                            </div>
                            <Avatar className="w-10 h-10 border-2 border-primary/20 p-0.5">
                                <AvatarImage src="https://github.com/shadcn.png" className="rounded-full" />
                                <AvatarFallback className="font-black bg-primary text-white">BN</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                <div className="p-8 px-12 mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}