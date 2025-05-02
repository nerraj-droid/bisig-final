import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, Status } from "@prisma/client"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Only allow super admin and captain to create new users
        if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.CAPTAIN)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin and Captain can create users." },
                { status: 401 }
            )
        }

        const { name, email, password, role, status = Status.ACTIVE } = await req.json()

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validate role
        const validRoles = [Role.SUPER_ADMIN, Role.CAPTAIN, Role.SECRETARY, Role.TREASURER]
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { message: "Invalid role" },
                { status: 400 }
            )
        }

        // Only SUPER_ADMIN can create other SUPER_ADMINs
        if (role === Role.SUPER_ADMIN && session.user.role !== Role.SUPER_ADMIN) {
            return NextResponse.json(
                { message: "Only Super Admin can create other Super Admin accounts" },
                { status: 403 }
            )
        }

        // Check if user already exists
        const exists = await prisma.user.findUnique({
            where: { email }
        })

        if (exists) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            )
        }

        const hashedPassword = await hash(password, 10)

        // Include all required fields based on the schema
        const user = await prisma.user.create({
            data: {
                id: randomUUID(),
                name,
                email,
                password: hashedPassword,
                role,
                status,
                updatedAt: new Date()
            }
        })

        return NextResponse.json({
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
} 
