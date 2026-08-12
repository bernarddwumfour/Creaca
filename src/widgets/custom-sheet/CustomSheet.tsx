// Ported from myUpskill's app/widgets/custom-sheet/CustomSheet.tsx — adapted
// from Base UI (@base-ui/react/dialog, used upstream) to Radix
// (@radix-ui/react-dialog), the same primitive Creaca's own CustomDialog
// already uses. Sheet-side/size behavior and styling preserved.
'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomSheetProps {
    trigger?: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: 'left' | 'right' | 'top' | 'bottom';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sheetSizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[90vw]',
};

const sheetSideClasses = {
    left: 'left-0 top-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
    right: 'right-0 top-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
    top: 'top-0 left-0 right-0 max-w-full !rounded-b-lg !rounded-t-none data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
    bottom: 'bottom-0 left-0 right-0 max-w-full !rounded-t-lg !rounded-b-none data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
};

export function CustomSheet({
    trigger,
    title,
    description,
    children,
    open,
    onOpenChange,
    side = 'right',
    size = 'md',
}: CustomSheetProps) {
    const sizeClass = sheetSizes[size];
    const isHorizontalSheet = side === 'top' || side === 'bottom';
    const widthClass = isHorizontalSheet ? 'w-full' : sizeClass;

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                <DialogPrimitive.Content
                    className={cn(
                        'fixed z-[101] h-full bg-white dark:bg-[#111114] shadow-2xl duration-200 outline-none',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        sheetSideClasses[side],
                        isHorizontalSheet ? 'h-screen max-h-[95vh]' : widthClass,
                        'flex flex-col'
                    )}
                >
                    <div className="sticky top-0 z-10 bg-white dark:bg-[#111114] border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogPrimitive.Title className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                                    {title}
                                </DialogPrimitive.Title>
                                {description && (
                                    <DialogPrimitive.Description className="text-xs font-bold text-zinc-500 italic">
                                        {description}
                                    </DialogPrimitive.Description>
                                )}
                            </div>

                            <DialogPrimitive.Close className="rounded-full p-2 opacity-70 ring-offset-white transition-opacity hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none">
                                <X size={20} />
                                <span className="sr-only">Close</span>
                            </DialogPrimitive.Close>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {children}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
