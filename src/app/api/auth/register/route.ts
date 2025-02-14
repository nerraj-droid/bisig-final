import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Only allow admin users to create new users
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { name, email, password, role } = await req.json()

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
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

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
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