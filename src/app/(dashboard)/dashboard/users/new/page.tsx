import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RegisterForm } from "@/components/auth/register-form"
import { Role } from "@prisma/client"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function NewUserPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== Role.SUPER_ADMIN) {
        redirect("/dashboard")
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

            <h1 className="mb-4 text-2xl font-bold">Create New User</h1>
            <p className="mb-8 text-sm text-gray-500">
                Create a new system user with access to the barangay information system.
                Make sure to assign the appropriate role based on their responsibilities.
            </p>

            <div className="rounded-lg bg-white p-6 shadow-sm">
                <RegisterForm />
            </div>
        </div>
    )
} 