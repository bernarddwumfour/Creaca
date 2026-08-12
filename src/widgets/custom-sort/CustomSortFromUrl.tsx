// Ported from myUpskill/estore's app/components/ui/CustomSortFromUrl.tsx
// — adapted import paths and colors only.
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CustomDialog } from '../../../widgets/CustomDialog/CustomDialog';

export interface SortOption {
    value: string;
    label: string;
}

export interface SortConfig {
    options: SortOption[];
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    urlParamPrefix?: string; // Prefix for URL params to avoid conflicts
}

interface CustomSortFromUrlProps {
    config: SortConfig;
    onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    className?: string;
}

function CustomSortFromUrlContent({
    config,
    onSortChange,
    className,
}: CustomSortFromUrlProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const getSortFromUrl = () => {
        const sortByParam = config.urlParamPrefix
            ? `${config.urlParamPrefix}_sort_by`
            : 'sort_by';
        const sortOrderParam = config.urlParamPrefix
            ? `${config.urlParamPrefix}_sort_order`
            : 'sort_order';

        const sortBy = searchParams.get(sortByParam) || config.defaultSortBy || config.options[0]?.value || '';
        const sortOrder = (searchParams.get(sortOrderParam) as 'asc' | 'desc') || config.defaultSortOrder || 'desc';

        return { sortBy, sortOrder };
    };

    const [tempSortBy, setTempSortBy] = useState(() => getSortFromUrl().sortBy);
    const [tempSortOrder, setTempSortOrder] = useState<'asc' | 'desc'>(() => getSortFromUrl().sortOrder);
    const [hasChanges, setHasChanges] = useState(false);
    const [appliedSortBy, setAppliedSortBy] = useState(() => getSortFromUrl().sortBy);
    const [appliedSortOrder, setAppliedSortOrder] = useState(() => getSortFromUrl().sortOrder);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const { sortBy, sortOrder } = getSortFromUrl();
        setTempSortBy(sortBy);
        setTempSortOrder(sortOrder);
        setAppliedSortBy(sortBy);
        setAppliedSortOrder(sortOrder);
        setHasChanges(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, config.defaultSortBy, config.defaultSortOrder, config.urlParamPrefix]);

    useEffect(() => {
        setHasChanges(tempSortBy !== appliedSortBy || tempSortOrder !== appliedSortOrder);
    }, [tempSortBy, tempSortOrder, appliedSortBy, appliedSortOrder]);

    const updateUrl = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        const params = new URLSearchParams(searchParams);

        const sortByParam = config.urlParamPrefix
            ? `${config.urlParamPrefix}_sort_by`
            : 'sort_by';
        const sortOrderParam = config.urlParamPrefix
            ? `${config.urlParamPrefix}_sort_order`
            : 'sort_order';

        params.set(sortByParam, sortBy);
        params.set(sortOrderParam, sortOrder);
        params.set('page', '1');

        const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        router.push(newUrl, { scroll: false });
    };

    const handleSortByChange = (value: string | null) => {
        if (!value) return;
        setTempSortBy(value);
    };

    const handleSortOrderToggle = () => {
        setTempSortOrder(tempSortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleApplySort = () => {
        updateUrl(tempSortBy, tempSortOrder);
        setAppliedSortBy(tempSortBy);
        setAppliedSortOrder(tempSortOrder);
        setHasChanges(false);

        if (onSortChange) {
            onSortChange(tempSortBy, tempSortOrder);
        }
    };

    const handleReset = () => {
        const defaultSortBy = config.defaultSortBy || config.options[0]?.value || '';
        const defaultSortOrder = config.defaultSortOrder || 'desc';

        setTempSortBy(defaultSortBy);
        setTempSortOrder(defaultSortOrder);
        updateUrl(defaultSortBy, defaultSortOrder);
        setAppliedSortBy(defaultSortBy);
        setAppliedSortOrder(defaultSortOrder);
        setHasChanges(false);

        if (onSortChange) {
            onSortChange(defaultSortBy, defaultSortOrder);
        }
    };

    const hasActiveSort = () => {
        const defaultSortBy = config.defaultSortBy || config.options[0]?.value || '';
        const defaultSortOrder = config.defaultSortOrder || 'desc';
        return appliedSortBy !== defaultSortBy || appliedSortOrder !== defaultSortOrder;
    };

    const desktopRow = (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Sort by:</span>
                <Select value={tempSortBy} onValueChange={handleSortByChange}>
                    <SelectTrigger size="lg" className="w-36 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                        {config.options.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-zinc-900 dark:text-white"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handleSortOrderToggle}
                    className="p-5 rounded-lg border-zinc-200 dark:border-zinc-800"
                >
                    {tempSortOrder === 'asc' ? '↑' : '↓'}
                </Button>

                <Button
                    variant={hasChanges ? "default" : "secondary"}
                    size="sm"
                    onClick={handleApplySort}
                    className={cn(
                        "gap-1 p-5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        hasChanges
                            ? "bg-primary text-white hover:bg-orange-600"
                            : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                    )}
                    disabled={!hasChanges}
                >
                    <ArrowUpDown size={14} />
                    Apply Sort
                </Button>

                {hasActiveSort() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="p-5 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        Reset
                    </Button>
                )}
            </div>

            {hasChanges && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    You have unsaved sort changes. Click &quot;Apply Sort&quot; to update.
                </div>
            )}
        </div>
    );

    return (
        <>
            <div className="hidden lg:block">{desktopRow}</div>

            <div className="lg:hidden relative inline-block">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMobileOpen(true)}
                    className="gap-2 p-5 rounded-lg text-[10px] font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-800 text-zinc-700"
                >
                    <ArrowUpDown size={14} />
                    Sort
                </Button>
                {hasActiveSort() && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary pointer-events-none" />
                )}
            </div>

            <CustomDialog
                title="Sort"
                description="Choose which field to sort by."
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                contentWidth="max-w-[400px]"
            >
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Sort by</label>
                        <Select value={tempSortBy} onValueChange={handleSortByChange}>
                            <SelectTrigger size="sm" className="w-full rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                                {config.options.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="text-zinc-900 dark:text-white"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Order</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={tempSortOrder === 'asc' ? 'default' : 'outline'}
                                className={cn(
                                    "h-9 rounded-lg",
                                    tempSortOrder === 'asc' && "bg-primary text-white"
                                )}
                                onClick={() => setTempSortOrder('asc')}
                            >
                                ↑ Ascending
                            </Button>
                            <Button
                                type="button"
                                variant={tempSortOrder === 'desc' ? 'default' : 'outline'}
                                className={cn(
                                    "h-9 rounded-lg",
                                    tempSortOrder === 'desc' && "bg-primary text-white"
                                )}
                                onClick={() => setTempSortOrder('desc')}
                            >
                                ↓ Descending
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-[#111114]">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-lg"
                        onClick={handleReset}
                        disabled={!hasActiveSort()}
                    >
                        Reset
                    </Button>
                    <Button
                        className="flex-1 gap-2 rounded-lg bg-primary text-white hover:bg-orange-600"
                        onClick={() => {
                            handleApplySort();
                            setMobileOpen(false);
                        }}
                    >
                        <ArrowUpDown size={14} />
                        Apply Sort
                    </Button>
                </div>
            </CustomDialog>
        </>
    );
}

export function CustomSortFromUrl(props: CustomSortFromUrlProps) {
    return (
        <Suspense fallback={<div className="h-8 w-48 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded" />}>
            <CustomSortFromUrlContent {...props} />
        </Suspense>
    );
}
