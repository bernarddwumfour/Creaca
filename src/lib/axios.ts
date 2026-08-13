import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { ENDPOINTS, PUBLIC_URLS } from './endpoints';

const AUTH_COOKIE_KEY = 'kyrios_auth_session';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: 15000,
});

/**
 * Helper to get and parse our unified cookie
 */
const getSession = () => {
    const cookie = Cookies.get(AUTH_COOKIE_KEY);
    if (!cookie) return null;
    try {
        return JSON.parse(cookie);
    } catch {
        return null;
    }
};

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const isPublic = PUBLIC_URLS.some(url => config.url?.includes(url));
        const session = getSession();
        const token = session?.tokens?.access;

        // Use the token from our unified cookie if it exists and the route isn't public
        if (token && !isPublic && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const serverResponse = error.response?.data as any;

        // Matching your Django API logic for expired tokens
        if (
            error.response?.status === 401 &&
            serverResponse?.message === "Token has expired" && // Check your backend message
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const session = getSession();
                const refresh = session?.tokens?.refresh;

                if (!refresh) throw new Error("No refresh token available");

                const { data } = await axios.post(
                    `${api.defaults.baseURL}${ENDPOINTS.AUTH.REFRESH}`,
                    {},
                    { headers: { Authorization: `Bearer ${refresh}` } }
                );

                const newTokens = data.data.tokens;

                // UPDATE THE UNIFIED COOKIE
                // We keep the existing user data but swap the tokens
                if (session) {
                    const updatedSession = {
                        ...session,
                        tokens: {
                            ...session.tokens,
                            access: newTokens.access,
                            refresh: newTokens.refresh || session.tokens.refresh // handle if API sends new refresh
                        }
                    };

                    // Save back to cookie so Middleware is updated
                    Cookies.set(AUTH_COOKIE_KEY, JSON.stringify(updatedSession), {
                        expires: 7,
                        secure: true,
                        sameSite: 'strict'
                    });

                    // Optional: keep localStorage in sync if you still use it elsewhere
                    localStorage.setItem('access_token', newTokens.access);
                }

                // Retry original request with new access token
                originalRequest.headers['Authorization'] = `Bearer ${newTokens.access}`;
                return api(originalRequest);

            } catch (err) {
                // If refresh fails, clear session and force login
                Cookies.remove(AUTH_COOKIE_KEY);
                localStorage.clear();

                // Redirecting to login — preserve the current locale prefix so
                // Next.js's [lang] route doesn't swallow a bare segment like
                // "login"/"courses" as the language (see middleware.ts for the
                // same class of bug on the server-side redirect branches).
                if (typeof window !== 'undefined') {
                    const SUPPORTED_LANGS = ['en', 'fr', 'es'];
                    const currentLang = window.location.pathname.split('/')[1];
                    const lang = SUPPORTED_LANGS.includes(currentLang) ? currentLang : 'en';
                    window.location.href = `/${lang}/login`;
                }
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;