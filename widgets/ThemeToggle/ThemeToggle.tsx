'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeOption = 'light' | 'dark' | 'system';

type ThemeToggleProps = {
  /** Optional localized labels for the three options. */
  labels?: Partial<Record<ThemeOption, string>>;
  /** Accessible label / tooltip text for the trigger button. */
  srLabel?: string;
  /** Dropdown alignment relative to the trigger. */
  align?: 'start' | 'center' | 'end';
  /** Override the trigger button classes to fit different surfaces. */
  className?: string;
};

const DEFAULT_LABELS: Record<ThemeOption, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const ICONS: Record<ThemeOption, React.ComponentType<{ size?: number | string; className?: string }>> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle({
  labels,
  srLabel = 'Toggle theme',
  align = 'end',
  className = 'rounded-full w-8 h-8',
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes only knows the real value on the client; wait for mount to
  // avoid a hydration mismatch on the trigger icon.
  useEffect(() => setMounted(true), []);

  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const current = (mounted ? theme : 'system') as ThemeOption;
  const options: ThemeOption[] = ['light', 'dark', 'system'];
  const TriggerIcon = ICONS[current] ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <TriggerIcon size={18} />
          <span className="sr-only">{srLabel}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className="min-w-[150px] p-1 rounded-xl shadow-xl z-[1001] bg-white dark:bg-black border-zinc-100 dark:border-[#18181b] mt-2"
      >
        {options.map((option) => {
          const Icon = ICONS[option];
          const active = current === option;
          return (
            <DropdownMenuItem
              key={option}
              onClick={() => setTheme(option)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                active
                  ? 'bg-primary/5 text-primary font-bold'
                  : 'text-zinc-600 dark:text-gray-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-medium'
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{resolvedLabels[option]}</span>
              {active && <Check size={14} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
