'use client';

import { ReactNode } from 'react';

export interface PageHeaderProps {
    eyebrow: string;
    title: ReactNode;
    description?: string;
    actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-end flex-wrap gap-4">
            <div className="max-w-xl space-y-2">
                <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">
                    {eyebrow}
                </p>
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
