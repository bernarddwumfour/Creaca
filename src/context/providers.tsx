'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,     // 5 minutes
                gcTime: 1000 * 60 * 10,       // 10 minutes (garbage collection)
                retry: 2,
                refetchOnWindowFocus: false,
            },
        },
    });
}

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = React.useState(() => makeQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}