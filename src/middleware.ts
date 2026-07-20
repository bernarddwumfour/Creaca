import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_KEY = 'kyrios_auth_session';
const SUPPORTED_LANGS = ['en', 'fr', 'es'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authCookie = request.cookies.get(AUTH_COOKIE_KEY);

    if (pathname === '/') {
        return NextResponse.redirect(new URL('/en', request.url));
    }


    if (pathname === '/admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    const isDashboardPage = pathname.includes('/admin');
    const isLoginPage = pathname.includes('/login') || pathname.includes('/signup');

    if (isDashboardPage && !authCookie) {
        return NextResponse.redirect(new URL('/en/login', request.url));
    }

    if (isDashboardPage && authCookie) {
        try {
            const session = JSON.parse(authCookie.value);
            if (!['ADMIN', 'STAFF'].includes(session?.user?.role)) {
                return NextResponse.redirect(new URL('/en/dashboard', request.url));
            }
        } catch {
            const response = NextResponse.redirect(new URL('/en/login', request.url));
            response.cookies.delete(AUTH_COOKIE_KEY);
            return response;
        }
    }

    if (isLoginPage && authCookie) {
        const segments = pathname.split('/');
        // segments[1] is only a real locale when the URL actually has a
        // /{lang}/ prefix (e.g. /en/login) — a bare /login (no prefix, e.g.
        // an old bookmark) makes segments[1] the literal string "login",
        // which `|| 'en'` never catches since it's truthy. That "lang" then
        // gets used as the [lang] route segment for the dashboard redirect,
        // and learnerDict['login'] is undefined -> Header.tsx throws.
        const lang = SUPPORTED_LANGS.includes(segments[1]) ? segments[1] : 'en';
        let role = '';
        try { role = JSON.parse(authCookie.value)?.user?.role || ''; } catch { /* ignore */ }
        return NextResponse.redirect(new URL(
            ['ADMIN', 'STAFF'].includes(role) ? '/admin/dashboard' : `/${lang}/dashboard`,
            request.url
        ));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all request paths except for the ones starting with:
        // - api (API routes)
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - favicon.ico (favicon file)
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
