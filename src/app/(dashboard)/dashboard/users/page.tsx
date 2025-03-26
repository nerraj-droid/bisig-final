import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { UserList } from "@/components/users/user-list"
import { Role } from "@prisma/client"
import { Metadata } from "next"
import { UsersIcon, ShieldCheckIcon, UserCog2 } from "lucide-react"

export const metadata: Metadata = {
    title: "Manage Users | Barangay Information System",
    description: "Manage system users and their roles",
}

export default async function UsersPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== Role.SUPER_ADMIN) {
        redirect("/dashboard")
    }

    // Get users with counts by role
    const [users, roleCounts] = await Promise.all([
        prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.user.groupBy({
            by: ["role"],
            _count: {
                role: true,
            },
        }),
    ])

    // Transform role counts into a more usable format
    const roleCountsMap = roleCounts.reduce((acc, curr) => {
        acc[curr.role] = curr._count.role
        return acc
    }, {} as Record<string, number>)

    // Get total count
    const totalUsers = users.length

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage system users and their access levels
                </p>
            </div>

            {/* User statistics */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-4 shadow-sm flex items-center">
                    <div className="rounded-full bg-blue-100 p-3 mr-4">
                        <UsersIcon className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Users</p>
                        <p className="text-2xl font-semibold">{totalUsers}</p>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-sm flex items-center">
                    <div className="rounded-full bg-purple-100 p-3 mr-4">
                        <ShieldCheckIcon className="h-6 w-6 text-purple-700" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Admins</p>
                        <p className="text-2xl font-semibold">{roleCountsMap[Role.SUPER_ADMIN] || 0}</p>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-sm flex items-center">
                    <div className="rounded-full bg-amber-100 p-3 mr-4">
                        <UserCog2 className="h-6 w-6 text-amber-700" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Staff</p>
                        <p className="text-2xl font-semibold">
                            {(roleCountsMap[Role.SECRETARY] || 0) + (roleCountsMap[Role.TREASURER] || 0)}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-sm flex items-center">
                    <div className="rounded-full bg-red-100 p-3 mr-4">
                        <UsersIcon className="h-6 w-6 text-red-700" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Captains</p>
                        <p className="text-2xl font-semibold">{roleCountsMap[Role.CAPTAIN] || 0}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
                <UserList initialUsers={users} />
            </div>
        </div>
    )
} 