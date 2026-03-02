'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' }
  ];

  const handleLanguageChange = (newLang: string) => {
    if (!pathname) return;
    const segments = pathname.split('/');
    segments[1] = newLang;
    const newPath = segments.join('/') || '/';
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-3 gap-2 rounded-full hover:bg-zinc-100 transition-colors group"
        >
          <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary transition-colors" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
            {currentLang}
          </span>
          <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400 group-hover:text-zinc-600 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="min-w-[120px] p-1 rounded-xl shadow-xl z-100 bg-white dark:bg-black dark:border-[#18181b] border-zinc-100 mt-2"
      >
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code} 
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all
              ${currentLang === lang.code 
                ? 'bg-primary/5 text-primary font-bold' 
                : 'text-zinc-600 dark:text-gray-300 hover:bg-zinc-50 font-medium'}
            `}
          >
            <span className="text-xs">{lang.label}</span>
            {currentLang === lang.code && <div className="w-1 h-1 rounded-full bg-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}