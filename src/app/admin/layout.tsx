'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    LogOut,
    Search,
    Bell,
    TrendingUp,
    Users,
    Terminal,
    Menu,
    X,
    Sun,
    Moon,
    UserCircle,
    ChevronDown,
    ChevronRight,
    Library,
    BookMarked,
    GraduationCap,
    UserCog,
    Columns3Cog,
    ShieldCheck
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from '@/context/AuthContext';

const SIDEBAR_LINKS = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin/dashboard' },
    {
        icon: Library,
        label: 'Subjects',
        isCollapsible: true,
        children: [
            { icon: Library, label: 'Manage Subjects', href: '/admin/subjects' },
            { icon: BookMarked, label: 'Manage Courses', href: '/admin/subjects/courses' },
            { icon: BookOpen, label: 'Manage Modules', href: '/admin/subjects/modules' },
        ]
    },
    {
        icon: Users, label: 'User Management', isCollapsible: true, children: [
            { icon: Users, label: 'Users', href: '/admin/users' },
            { icon: GraduationCap, label: 'Staff/Admins', href: '/admin/users/staff' },
        ]
    },
    {
        icon: Terminal, label: 'Audit Logs', isCollapsible: true, children:
            [
                { icon: UserCog, label: 'User Logs', href: '/admin/logs/users' },
                { icon: Columns3Cog, label: 'Subject Logs', href: '/admin/logs/subjects' },
                { icon: Terminal, label: 'System Logs', href: '/admin/logs' },
            ]
    },
    { icon: TrendingUp, label: 'Performance', href: '/admin/stats' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // --- States ---
    const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop
    const [openMenus, setOpenMenus] = useState<string[]>(['Subjects']);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // --- 1. Navigation Search Logic ---
    const flatLinks = useMemo(() => {
        const links: { label: string; href: string; icon: any; parent?: string }[] = [];
        SIDEBAR_LINKS.forEach(link => {
            if (link.children) {
                link.children.forEach(child => {
                    links.push({ label: child.label, href: child.href, icon: child.icon, parent: link.label });
                });
            } else {
                links.push({ label: link.label, href: link.href as string, icon: link.icon });
            }
        });
        return links;
    }, []);

    const filteredNavLinks = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return flatLinks.filter(link =>
            link.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (link.parent && link.parent.toLowerCase().includes(searchQuery.toLowerCase()))
        ).slice(0, 5);
    }, [searchQuery, flatLinks]);

    // --- 2. MFA Global Status (React Query) ---
    const { data: mfaData } = useQuery({
        queryKey: ['mfa-status'],
        queryFn: async () => {
            // Replace with your actual api instance and endpoints
            const response = await fetch('/api/auth/mfa-status');
            return response.json();
        },
        refetchOnWindowFocus: false
    });

    // --- Helpers ---
    const toggleMenu = (label: string) => {
        if (isCollapsed) setIsCollapsed(false);
        setOpenMenus(prev =>
            prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
        );
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] || 'U'}${lastName?.[0] || ''}`.toUpperCase();
    };

    // Close search on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex">
            {/* SIDEBAR */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#111114] border-r border-zinc-200 dark:border-zinc-800 transition-all duration-500 ease-in-out lg:translate-x-0",
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                isCollapsed ? "w-20" : "w-64"
            )}>
                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full items-center justify-center text-zinc-400 hover:text-orange-600 transition-all shadow-sm"
                >
                    <ChevronRight className={cn("transition-transform duration-500", !isCollapsed && "rotate-180")} size={12} />
                </button>

                <div className={cn("p-6 transition-all duration-500", isCollapsed ? "px-0 flex justify-center" : "px-6")}>
                    <Link href="/" className="flex items-center gap-2">
                        <span className={cn("font-black text-2xl tracking-tighter transition-all duration-300", isCollapsed ? "scale-75" : "")}>
                            K{!isCollapsed && "YRIOS"}<span className="text-orange-600">.</span>
                        </span>
                    </Link>
                </div>

                <nav className={cn("px-4 space-y-1 mt-4 transition-all duration-500", isCollapsed ? "px-2" : "px-4")}>
                    {SIDEBAR_LINKS.map((link) => {
                        const hasChildren = link.isCollapsible && link.children;
                        const isOpen = openMenus.includes(link.label);
                        const isActive = pathname === link.href;

                        if (hasChildren) {
                            return (
                                <div key={link.label} className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(link.label)}
                                        className={cn(
                                            "w-full flex items-center text-sm font-bold rounded-lg transition-all group py-2.5",
                                            isOpen && !isCollapsed ? 'bg-zinc-50 dark:bg-white/5 text-orange-600' : 'text-zinc-500 hover:text-orange-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/50',
                                            isCollapsed ? "justify-center px-0" : "justify-between px-4"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <link.icon size={18} />
                                            {!isCollapsed && <span>{link.label}</span>}
                                        </div>
                                        {!isCollapsed && <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen ? 'rotate-180' : '')} />}
                                    </button>

                                    {isOpen && !isCollapsed && (
                                        <div className="ml-4 pl-4 border-l border-zinc-100 dark:border-zinc-800 space-y-1 mt-1 animate-in fade-in slide-in-from-top-1">
                                            {link.children?.map((child) => (
                                                <Link
                                                    key={child.label}
                                                    href={child.href}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                                        pathname === child.href ? 'text-orange-600 bg-orange-600/5' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                                    )}
                                                >
                                                    <child.icon size={14} />
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={link.label}
                                href={link.href as string}
                                className={cn(
                                    "flex items-center text-sm font-bold rounded-lg transition-all group py-2.5",
                                    isActive ? 'bg-orange-600/10 text-orange-600' : 'text-zinc-500 hover:text-orange-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/50',
                                    isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-4"
                                )}
                            >
                                <link.icon size={18} />
                                {!isCollapsed && <span>{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className={cn(
                "flex-1 flex flex-col transition-all duration-500 ease-in-out",
                isCollapsed ? "lg:ml-20" : "lg:ml-64"
            )}>
                {/* HEADER */}
                <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden text-zinc-500 hover:text-orange-600">
                            {isSidebarOpen ? <X /> : <Menu />}
                        </button>

                        {/* NAV SEARCH */}
                        <div className="relative" ref={searchRef}>
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 border border-transparent focus-within:border-orange-600/30 transition-all w-80 shadow-sm">
                                <Search size={14} className={searchQuery ? "text-orange-600" : ""} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                                    onFocus={() => setShowSearchResults(true)}
                                    placeholder="Jump to module..."
                                    className="bg-transparent border-none outline-none text-[11px] font-bold w-full placeholder:text-zinc-500"
                                />
                            </div>

                            {showSearchResults && filteredNavLinks.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                                    <div className="p-2 space-y-1">
                                        {filteredNavLinks.map((result) => (
                                            <Link
                                                key={result.href}
                                                href={result.href}
                                                onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-orange-600">
                                                    <result.icon size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold">{result.label}</p>
                                                    {result.parent && <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">In {result.parent}</p>}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost" size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        >
                            {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-orange-600" />}
                        </Button>

                        <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2" />

                        {/* USER DROPDOWN */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-3 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all outline-none">
                                    <div className="hidden sm:flex flex-col items-start mr-1 text-left">
                                        <span className="text-xs font-black tracking-tight leading-none">{user?.first_name} {user?.last_name?.[0]}.</span>
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{user?.role || 'Admin'}</span>
                                    </div>
                                    <Avatar className="w-9 h-9 border-2 border-orange-600/20 p-0.5">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                        <AvatarFallback className="bg-orange-600 text-white text-[10px]">{getInitials(user?.first_name, user?.last_name)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2 border-none shadow-2xl rounded-2xl p-2 dark:bg-[#111114]">
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/profile" className="flex items-center gap-3 p-3 py-3.5 text-xs font-bold rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                        <UserCircle size={18} className="text-zinc-500" /> Profile Settings
                                    </Link>
                                </DropdownMenuItem>
                                {mfaData?.mfa_enabled && (
                                    <DropdownMenuItem className="flex items-center gap-3 p-3 py-3.5 text-xs font-bold text-emerald-600">
                                        <ShieldCheck size={18} /> 2FA Active
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="flex items-center gap-3 p-3 py-3.5 text-xs font-bold text-red-500 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20">
                                    <LogOut size={18} /> Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className={`p-8 px-10 mx-auto w-full relative ${isCollapsed ? " max-w-[calc(100vw-100px)]" : " max-w-[calc(100vw-300px)]"}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}