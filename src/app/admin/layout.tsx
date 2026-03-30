'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    LogOut,
    Search,
    Bell,
    TrendingUp,
    BrainCircuit,
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
    Layers,
    BookMarked,
    GraduationCap,
    UserCog,
    Columns3Cog
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

// Updated structure: Subjects is the Parent, with 3 CRUD submenus
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
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<string[]>(['Subjects']); // Keep Subjects open by default for Admin
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
        );
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] || 'U'}${lastName?.[0] || ''}`.toUpperCase();
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex">
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111114] border-r border-zinc-200 dark:border-zinc-800 transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-black text-2xl tracking-tighter">KYRIOS<span className="text-primary">.</span></span>
                    </Link>
                </div>

                <nav className="px-4 space-y-1 mt-4">
                    {SIDEBAR_LINKS.map((link) => {
                        const hasChildren = link.isCollapsible && link.children;
                        const isOpen = openMenus.includes(link.label);
                        const isActive = pathname === link.href;

                        if (hasChildren) {
                            return (
                                <div key={link.label} className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(link.label)}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm font-bold rounded-lg transition-all group ${isOpen ? 'bg-white/5' : 'text-zinc-500 hover:text-primary hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <link.icon size={20} className={isOpen ? 'text-primary' : 'group-hover:text-primary'} />
                                            {link.label}
                                        </div>
                                        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isOpen && (
                                        <div className="ml-4 pl-4 border-l border-zinc-100 dark:border-zinc-800 space-y-1 mt-1">
                                            {link.children?.map((child) => {
                                                const isChildActive = pathname === child.href;
                                                return (
                                                    <Link
                                                        key={child.label}
                                                        href={child.href}
                                                        className={`flex items-center gap-3 px-3 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${isChildActive
                                                            ? 'text-primary bg-primary/5'
                                                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                                            }`}
                                                    >
                                                        <child.icon size={14} className={isChildActive ? 'text-primary' : 'text-zinc-400'} />
                                                        {child.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={link.label}
                                href={(link.href) as string}
                                className={`flex items-center gap-3 px-4 py-2 text-sm font-bold rounded-lg transition-all group ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-zinc-500 hover:text-primary hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                    }`}
                            >
                                <link.icon size={20} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 flex flex-col">
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

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            >
                                {theme === 'dark' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-primary" />}
                            </Button>

                            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900">
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-zinc-900" />
                            </Button>
                        </div>

                        <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2" />

                        {/* User Dropdown Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-3 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all outline-none">
                                    <div className="hidden sm:flex flex-col items-start mr-1">
                                        <span className="text-xs font-black tracking-tight leading-none">
                                            {user?.first_name} {user?.last_name?.[0]}.
                                        </span>
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                            {user?.role || 'User'}
                                        </span>
                                    </div>
                                    <Avatar className="w-9 h-9 border-2 border-primary/20 p-0.5">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} className="rounded-full" />
                                        <AvatarFallback className="font-black bg-primary text-white text-[10px]">
                                            {getInitials(user?.first_name, user?.last_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown size={14} className="text-zinc-400 mr-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2 border-none shadow-2xl rounded-2xl p-2 dark:bg-[#111114]">
                                <DropdownMenuLabel className="p-3">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-black leading-none">{user?.first_name} {user?.last_name}</p>
                                        <p className="text-[10px] font-medium leading-none text-zinc-500">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />

                                <DropdownMenuItem asChild>
                                    <Link href="/admin/profile" className="flex items-center gap-3 p-3 py-3.5 text-xs font-bold rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                        <UserCircle size={18} className="text-zinc-500" />
                                        Profile Settings
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href="/admin/settings" className="flex items-center gap-3 p-3 py-3.5 text-xs font-bold rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                        <Settings size={18} className="text-zinc-500" />
                                        System Preferences
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />

                                <DropdownMenuItem
                                    onClick={logout}
                                    className="flex items-center gap-3 p-3 text-xs font-bold rounded-xl cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 focus:text-red-600 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="p-8 px-12 mx-auto w-full relative">
                    {children}
                </div>
            </main>
        </div>
    );
}