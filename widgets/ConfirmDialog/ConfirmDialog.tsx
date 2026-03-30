'use client';

import React, { useState } from 'react';
import { AlertCircle, Loader2, LucideIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { CustomDialog } from '../CustomDialog/CustomDialog';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    title: string;
    warning: string; // Custom message passed as prop
    confirmText?: string;
    confirmIcon?: LucideIcon;
    variant?: 'destructive' | 'primary';
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    warning,
    confirmText = "Confirm",
    confirmIcon: Icon,
    variant = 'destructive'
}: ConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch (error) {
            console.error("Action failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isDestructive = variant === 'destructive';

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
        >
            <div className="space-y-6">
                {/* Dynamic Warning Box */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isDestructive
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                    : 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30'
                    }`}>
                    <AlertCircle className={isDestructive ? 'text-red-500' : 'text-orange-500'} size={20} />
                    <p className={`text-xs font-bold uppercase tracking-tight leading-relaxed ${isDestructive ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
                        }`}>
                        {warning}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`flex-[1.5] h-12 rounded-xl font-black uppercase tracking-widest transition-all gap-2 shadow-lg ${isDestructive
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                            : 'bg-primary hover:bg-orange-600 text-white shadow-primary/20'
                            }`}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : Icon && <Icon size={18} />}
                        {confirmText}
                    </Button>
                </div>
            </div>
        </CustomDialog>
    );
}