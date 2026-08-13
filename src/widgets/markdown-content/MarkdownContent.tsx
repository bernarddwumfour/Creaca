'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
    content: string;
    className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
    return (
        <div
            className={cn(
                "prose prose-zinc dark:prose-invert max-w-none",
                "prose-headings:font-black prose-headings:tracking-tight",
                "prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed",
                "prose-strong:text-zinc-900 dark:prose-strong:text-white",
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                "prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none",
                "prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-2xl",
                "prose-blockquote:border-primary prose-blockquote:text-zinc-500",
                className
            )}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
}
