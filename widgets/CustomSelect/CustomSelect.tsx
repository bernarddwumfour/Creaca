'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Option {
    label: string;
    value: string;
}

interface CustomSelectProps {
    options: Option[];
    placeholder?: string;
    value?: string | string[]; // String for single, Array for multiple
    onChange: (value: any) => void;
    multiple?: boolean;
    className?: string;
}

export function CustomSelect({
    options,
    placeholder = "Select option...",
    value,
    onChange,
    multiple = false,
    className,
}: CustomSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (item: string) => {
        if (Array.isArray(value)) {
            onChange(value.filter((i) => i !== item));
        }
    };

    const handleSelect = (currentValue: string) => {
        if (multiple) {
            const newValue = Array.isArray(value) ? [...value] : [];
            if (newValue.includes(currentValue)) {
                onChange(newValue.filter((v) => v !== currentValue));
            } else {
                onChange([...newValue, currentValue]);
            }
        } else {
            onChange(currentValue);
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all px-3 py-2",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1 items-center">
                        {multiple && Array.isArray(value) && value.length > 0 ? (
                            value.map((val) => {
                                const option = options.find((o) => o.value === val);
                                return (
                                    <Badge
                                        key={val}
                                        variant="secondary"
                                        className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg flex items-center gap-1"
                                    >
                                        {option?.label}
                                        <button
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onKeyDown={(e) => { if (e.key === "Enter") handleUnselect(val); }}
                                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                            onClick={() => handleUnselect(val)}
                                        >
                                            <X className="h-3 w-3 text-primary hover:text-orange-600" />
                                        </button>
                                    </Badge>
                                );
                            })
                        ) : !multiple && value ? (
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-tight">
                                {options.find((o) => o.value === value)?.label}
                            </span>
                        ) : (
                            <span className="text-xs font-medium text-zinc-500">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-105">
                <Command className="dark:bg-[#111114]">
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="h-10 text-xs font-medium" />
                    <CommandList>
                        <CommandEmpty className="py-4 text-center text-xs text-zinc-500 font-bold uppercase tracking-widest">
                            No results found.
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        handleSelect(option.value);
                                    }}
                                    className="flex items-center justify-between py-3 px-4 cursor-pointer text-xs font-bold uppercase tracking-tight hover:bg-primary/10 transition-colors"
                                >
                                    {option.label}
                                    <Check
                                        className={cn(
                                            "h-4 w-4 text-primary",
                                            (multiple && Array.isArray(value) && value.includes(option.value)) ||
                                                (!multiple && value === option.value)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}