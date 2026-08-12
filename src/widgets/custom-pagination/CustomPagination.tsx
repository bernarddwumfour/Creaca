// Ported from myUpskill/estore's app/components/ui/CustomPagination.tsx
// — adapted colors only.
'use client';

import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
    start_index: number;
    end_index: number;
}

interface CustomPaginationProps {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    showLimitSelector?: boolean;
    limitOptions?: number[];
    className?: string;
}

export function CustomPagination({
    pagination,
    onPageChange,
    onLimitChange,
    showLimitSelector = true,
    limitOptions = [10, 20, 50, 100],
    className,
}: CustomPaginationProps) {
    const {
        current_page,
        per_page,
        total,
        total_pages,
        has_next,
        has_previous,
        next_page,
        previous_page,
        start_index,
        end_index,
    } = pagination;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;
        const halfVisible = Math.floor(maxVisible / 2);

        if (total_pages <= maxVisible) {
            for (let i = 1; i <= total_pages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            let start = Math.max(2, current_page - halfVisible);
            let end = Math.min(total_pages - 1, current_page + halfVisible);

            if (current_page <= halfVisible + 1) {
                end = maxVisible - 1;
            }

            if (current_page >= total_pages - halfVisible) {
                start = total_pages - (maxVisible - 2);
            }

            if (start > 2) {
                pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < total_pages - 1) {
                pages.push('...');
            }

            pages.push(total_pages);
        }

        return pages;
    };

    if (total === 0) {
        return null;
    }

    return (
        <div className={cn("flex flex-col sm:flex-row items-center sm:justify-between gap-4 py-4", className)}>
            <div className="text-sm text-center text-zinc-600 dark:text-zinc-400">
                Showing <span className="font-medium text-zinc-900 dark:text-white">{start_index}</span> to{' '}
                <span className="font-medium text-zinc-900 dark:text-white">{end_index}</span> of{' '}
                <span className="font-medium text-zinc-900 dark:text-white">{total}</span> results
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-2">
                {showLimitSelector && onLimitChange && (
                    <div className="flex items-center gap-2 sm:mr-4">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Show</span>
                        <Select
                            value={per_page.toString()}
                            onValueChange={(value) => { if (value) onLimitChange(parseInt(value)); }}
                        >
                            <SelectTrigger size="sm" className="w-20 text-sm rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                                {limitOptions.map((limit) => (
                                    <SelectItem
                                        key={limit}
                                        value={limit.toString()}
                                        className="text-zinc-900 dark:text-zinc-100"
                                    >
                                        {limit}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">per page</span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        disabled={!has_previous}
                        className="h-8 w-8 p-0 rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronsLeft size={16} />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previous_page && onPageChange(previous_page)}
                        disabled={!has_previous}
                        className="h-8 w-8 p-0 rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </Button>

                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <span className="px-2 text-zinc-500 dark:text-zinc-400">...</span>
                                ) : (
                                    <Button
                                        variant={current_page === page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => typeof page === 'number' && onPageChange(page)}
                                        className={cn(
                                            "h-8 w-8 p-0 rounded-md",
                                            current_page === page
                                                ? "bg-primary text-white hover:bg-orange-600"
                                                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        )}
                                    >
                                        {page}
                                    </Button>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => next_page && onPageChange(next_page)}
                        disabled={!has_next}
                        className="h-8 w-8 p-0 rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(total_pages)}
                        disabled={!has_next}
                        className="h-8 w-8 p-0 rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronsRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
