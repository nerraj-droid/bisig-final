import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function DELETE(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Unauthorized" },
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