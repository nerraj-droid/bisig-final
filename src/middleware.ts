import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

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

        return NextResponse.next()
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