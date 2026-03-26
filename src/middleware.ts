import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_KEY = 'kyrios_auth_session';

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
        const segments = pathname.split('/');
        const lang = segments[1] || 'en';

        return NextResponse.redirect(new URL(`/en/login`, request.url));
    }

    if (isLoginPage && authCookie) {
        const segments = pathname.split('/');
        const lang = segments[1] || 'en';
        return NextResponse.redirect(new URL(`/`, request.url));
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