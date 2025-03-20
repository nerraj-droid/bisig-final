import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // If no token and trying to access protected routes, redirect to login
        if (!token && path.startsWith("/dashboard")) {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        // Define route permissions
        const routePermissions = {
            "/dashboard/users": ["SUPER_ADMIN", "CAPTAIN"],
            "/dashboard/reports": ["SUPER_ADMIN", "CAPTAIN", "TREASURER"],
            "/dashboard/certificates": ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"],
            "/dashboard/residents": ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"],
            "/dashboard/households": ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"],
            "/dashboard/map": ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"],
        }

        // Check if the current path requires specific roles
        for (const [route, allowedRoles] of Object.entries(routePermissions)) {
            if (path.startsWith(route) && !allowedRoles.includes(token?.role as string)) {
                return NextResponse.redirect(new URL("/dashboard", req.url))
            }
        }

        // Add CORS headers to allow redirections
        const response = NextResponse.next()
        response.headers.append("Access-Control-Allow-Private-Network", "true")
        response.headers.append("Access-Control-Allow-Origin", "*")
        response.headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.append("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization")

        return response
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
        pages: {
            signIn: "/login",
        },
    }
)

// Protect all routes under /dashboard
export const config = {
    matcher: ["/dashboard/:path*"]
} 