'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TableSkeletonProps {
    columns?: number;
    rows?: number;
    className?: string;
}

export function TableSkeleton({ columns = 5, rows = 6, className }: TableSkeletonProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center justify-between px-1">
                <div className="h-8 w-32 rounded-lg bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                <div className="flex items-center gap-2">
                    <div className="h-8 w-24 rounded-lg bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                    <div className="h-8 w-24 rounded-lg bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                </div>
            </div>

            <Card className="shadow-none border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#09090b] rounded-xl py-0">
                <CardContent className="p-0">
                    <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4 p-4">
                        <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        {Array.from({ length: columns }).map((_, i) => (
                            <div key={i} className="h-3 flex-1 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        ))}
                        <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {Array.from({ length: rows }).map((_, r) => (
                            <div key={r} className="flex items-center gap-4 p-4">
                                <div className="h-4 w-4 rounded bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                                {Array.from({ length: columns }).map((_, c) => (
                                    <div
                                        key={c}
                                        className="h-3 flex-1 rounded bg-zinc-100 dark:bg-zinc-900 animate-pulse"
                                        style={{ animationDelay: `${(r * columns + c) * 20}ms` }}
                                    />
                                ))}
                                <div className="h-4 w-4 rounded bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
