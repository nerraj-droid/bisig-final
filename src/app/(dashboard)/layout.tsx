import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { SignOutButton } from "@/components/auth/sign-out-button"
import Link from "next/link"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <span className="text-2xl font-bold">BMS</span>
                            </div>
                            <div className="ml-6 flex items-center space-x-4">
                                <Link
                                    href="/dashboard"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/dashboard/residents"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Residents
                                </Link>
                                <Link
                                    href="/dashboard/households"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Households
                                </Link>
                                <Link
                                    href="/dashboard/map"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Map
                                </Link>
                                <Link
                                    href="/dashboard/reports"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Reports
                                </Link>
                                {session.user.role === "ADMIN" && (
                                    <>
                                        <Link
                                            href="/dashboard/users"
                                            className="text-gray-700 hover:text-gray-900"
                                        >
                                            Users
                                        </Link>
                                        <Link
                                            href="/dashboard/users/new"
                                            className="text-gray-700 hover:text-gray-900"
                                        >
                                            Create User
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-700">
                                Welcome, {session.user.name || session.user.email}
                            </span>
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </nav>
            <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
} 