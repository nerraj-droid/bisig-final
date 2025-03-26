import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Role, Status } from "@prisma/client"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { EditUserForm } from "@/components/users/edit-user-form"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Edit User | Barangay Information System",
    description: "Update user details and roles",
}

interface EditUserPageProps {
    params: {
        id: string
    }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== Role.SUPER_ADMIN) {
        redirect("/dashboard")
    }

    const user = await prisma.user.findUnique({
        where: {
            id: params.id,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
        },
    })

    if (!user) {
        notFound()
    }

    return (
        <div className="mx-auto max-w-md">
            <div className="mb-6">
                <Link
                    href="/dashboard/users"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Users
                </Link>
            </div>

            <h1 className="mb-4 text-2xl font-bold">Edit User</h1>
            <p className="mb-8 text-sm text-gray-500">
                Update user details and access permissions. You can change the role or deactivate the account if needed.
            </p>

            <div className="rounded-lg bg-white p-6 shadow-sm">
                <EditUserForm user={user} />
            </div>
        </div>
    )
} 