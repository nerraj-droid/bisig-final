import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const history = await prisma.householdHistory.findMany({
            where: { householdId: params.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(history)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Failed to fetch history" }, { status: 500 })
    }
} 