import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const isAuthorizedToManageUsers = (role: string | undefined) => {
    return role === "SUPER_ADMIN" || role === "CAPTAIN";
}

const isSuperAdmin = (role: string | undefined) => {
    return role === "SUPER_ADMIN";
}

export async function DELETE(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !isAuthorizedToManageUsers(session.user.role)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin and Captain can delete users." },
                { status: 401 }
            )
        }

        const { userId } = params

        // Prevent self-deletion
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! }
        })

        if (currentUser?.id === userId) {
            return NextResponse.json(
                { message: "Cannot delete your own account" },
                { status: 400 }
            )
        }

        // Prevent deletion of SUPER_ADMIN by non-SUPER_ADMIN
        const targetUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (isSuperAdmin(targetUser?.role) && !isSuperAdmin(session.user.role)) {
            return NextResponse.json(
                { message: "Only Super Admin can delete other Super Admin accounts" },
                { status: 403 }
            )
        }

        await prisma.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
} 