import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { UserList } from "@/components/users/user-list"
import Link from "next/link"

export default async function UsersPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Users</h1>
                <Link
                    href="/dashboard/users/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                    Create User
                </Link>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <UserList initialUsers={users} />
            </div>
        </div>
    )
} 