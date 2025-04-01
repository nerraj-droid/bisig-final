import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Public routes that don't need authentication checks
    const publicRoutes = ['/', '/about', '/contact', '/request-demo']
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
        return NextResponse.next()
    }

    // Special case: allow NextAuth routes to pass through without auth checks
    if (pathname.startsWith('/api/auth')) {
        return NextResponse.next()
    }

    // Get the token to check if user is authenticated - with improved config for Next.js 15
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === "production",
        cookieName: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token"
    })
    const isAuthenticated = !!token

    // Log authentication status for debugging
    console.log(`[Auth Debug] Path: ${pathname}, Authenticated: ${isAuthenticated}`)

    // Auth routes - redirect to dashboard if already logged in
    if (pathname.startsWith('/login') || pathname === '/') {
        if (isAuthenticated) {
            console.log(`[Auth Redirect] Already authenticated, redirecting to dashboard`)
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    // Protected routes - dashboard and api routes that shouldn't be accessible without auth
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
        if (!isAuthenticated) {
            // Redirect to login for dashboard routes
            if (pathname.startsWith('/dashboard')) {
                // Store the original URL as the callbackUrl to redirect back after login
                const callbackUrl = encodeURIComponent(request.nextUrl.pathname)
                console.log(`[Auth Redirect] Not authenticated, redirecting to login with callback to ${callbackUrl}`)
                const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
                return NextResponse.redirect(loginUrl)
            }

            // Return unauthorized for API routes
            if (pathname.startsWith('/api/')) {
                console.log(`[Unauthorized API Request] ${request.method} ${pathname}`)
                return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
            }
        }

        // Log API requests
        if (pathname.startsWith('/api/')) {
            console.log(`[API Request] ${request.method} ${pathname}`)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/landing',
        '/landing/:path*',
        '/about',
        '/contact',
        '/request-demo',
        '/dashboard/:path*',
        '/api/:path*',
    ],
}

