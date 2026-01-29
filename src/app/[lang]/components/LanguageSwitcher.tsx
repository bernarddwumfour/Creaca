'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lang } from '@/lib/dictionariy/dictionary';

interface LanguageSwitcherProps {
  currentLang: Lang;
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const pathname = usePathname();

  const getLocalizedPath = (targetLang: string) => {
    if (!pathname) return `/${targetLang}`;
    const segments = pathname.split('/');
    segments[1] = targetLang; 
    return segments.join('/');
  };

  return (
    <div className="flex bg-gray-100/50 rounded-full p-1 border border-gray-200">
      {(['en', 'es', 'fr'] as const).map((l) => (
        <Link
          key={l}
          href={getLocalizedPath(l)}
          className={`px-3 py-1 text-xs rounded-full transition-all ${
            currentLang === l
              ? 'bg-white text-black shadow-sm font-bold'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}