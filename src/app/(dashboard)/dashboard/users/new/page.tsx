import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { RegisterForm } from "@/components/auth/register-form"

export default async function NewUserPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    return (
        <div className="mx-auto max-w-md">
            <h1 className="mb-8 text-2xl font-bold">Create New User</h1>
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <RegisterForm />
            </div>
        </div>
    )
} 