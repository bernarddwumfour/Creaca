'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

const AUTH_COOKIE_KEY = 'kyrios_auth_session';

// Avatar configuration interface
interface AvatarConfig {
    top?: string;
    clothing?: string;
    facial_hair?: string;
    eyes?: string;
    mouth?: string;
    accessories?: string;
    skin_color?: string;
    hair_color?: string;
    clothes_color?: string;
    facial_hair_color?: string;
}

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    gender?: string;
    avatar_config?: AvatarConfig;
    phone_number?: string;
    email_verified?: boolean;
    profile_picture?: string;

    mfa_enabled?: boolean;
    mfa_method?: 'app' | 'email';
    mfa_email_verified?: boolean;
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
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const logout = useCallback(async () => {
        try {
            await api.post(ENDPOINTS.AUTH.LOGOUT);
        } catch {
            // Logout is best-effort server-side; local credentials must always clear.
        } finally {
            setSession(null);
            Cookies.remove(AUTH_COOKIE_KEY);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            router.push('/');
        }
    }, [router]);

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
    }, [logout]);

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

    const updateUser = (userData: Partial<User>) => {
        if (session) {
            const updatedSession = {
                ...session,
                user: {
                    ...session.user,
                    ...userData
                }
            };
            setSession(updatedSession);

            // Update cookie with new user data
            Cookies.set(AUTH_COOKIE_KEY, JSON.stringify(updatedSession), {
                expires: 7,
                secure: true,
                sameSite: 'strict'
            });
        }
    };

    return (
        <AuthContext.Provider value={{
            user: session?.user || null,
            tokens: session?.tokens || null,
            login,
            logout,
            updateUser,
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
