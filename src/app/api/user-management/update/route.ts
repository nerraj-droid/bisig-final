import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== Role.SUPER_ADMIN) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        try {
            const data = await req.json()
            const { id, name, email, role, status } = data

            if (!id || !name || !email || !role || !status) {
                return NextResponse.json(
                    { message: "Missing required fields" },
                    { status: 400 }
                )
            }

            // Don't allow changing your own role or status (prevent locking yourself out)
            if (session.user.id === id && (session.user.role !== role || status === "INACTIVE")) {
                return NextResponse.json(
                    { message: "You cannot change your own role or deactivate your account" },
                    { status: 400 }
                )
            }

            // Check if email is already taken by another user
            if (email) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        email,
                        id: {
                            not: id,
                        },
                    },
                })

                if (existingUser) {
                    return NextResponse.json(
                        { message: "Email already in use" },
                        { status: 400 }
                    )
                }
            }

            const updatedUser = await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    name,
                    email,
                    role,
                    status,
                    updatedAt: new Date(),
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                },
            })

            return NextResponse.json(updatedUser)
        } catch (jsonError) {
            console.error("Error parsing request body:", jsonError)
            return NextResponse.json(
                { message: "Invalid request format" },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json(
            { message: "Failed to update user: " + (error instanceof Error ? error.message : "Unknown error") },
            { status: 500 }
        )
    }
} 
