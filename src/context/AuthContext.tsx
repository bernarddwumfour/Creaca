'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const AUTH_COOKIE_KEY = 'kyrios_auth_session';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface Tokens {
    access: string;
    refresh: string;
    access_expires_in: number;
    refresh_expires_in: number;
}

interface AuthSession {
    user: User;
    tokens: Tokens;
}

interface AuthContextType {
    user: User | null;
    tokens: Tokens | null;
    login: (session: AuthSession) => void;
    logout: () => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Hydrate from the single cookie
        const cookieData = Cookies.get(AUTH_COOKIE_KEY);
        if (cookieData) {
            try {
                const parsedSession: AuthSession = JSON.parse(cookieData);
                setSession(parsedSession);

                // Keep localStorage in sync for Axios interceptors if needed
                localStorage.setItem('access_token', parsedSession.tokens.access);
                localStorage.setItem('refresh_token', parsedSession.tokens.refresh);
            } catch (e) {
                console.error("Session corruption detected.");
                logout();
            }
        }
        setIsLoading(false);
    }, []);

    const login = (authData: AuthSession) => {
        setSession(authData);

        Cookies.set(AUTH_COOKIE_KEY, JSON.stringify(authData), {
            expires: 7,
            secure: true,
            sameSite: 'strict'
        });

        // Sync to localStorage for your existing Axios Interceptor logic
        localStorage.setItem('access_token', authData.tokens.access);
        localStorage.setItem('refresh_token', authData.tokens.refresh);
    };

    const logout = () => {
        setSession(null);
        Cookies.remove(AUTH_COOKIE_KEY);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{
            user: session?.user || null,
            tokens: session?.tokens || null,
            login,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};