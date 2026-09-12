'use client';

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

export interface PageHeaderProps {
    eyebrow: string;
    title: ReactNode;
    description?: string;
    actions?: ReactNode;
    /** When provided, renders a back button inline beside the eyebrow text. */
    onBack?: () => void;
}

export function PageHeader({ eyebrow, title, description, actions, onBack }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-end flex-wrap gap-4">
            <div className="max-w-xl space-y-2">
                <div className="flex items-center gap-2">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            aria-label="Go back"
                            className="flex items-center justify-center rounded-lg p-1 text-zinc-400 hover:text-orange-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                        >
                            <ArrowLeft size={14} />
                        </button>
                    )}
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">
                        {eyebrow}
                    </p>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-zinc-500 font-medium tracking-tight text-sm">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
