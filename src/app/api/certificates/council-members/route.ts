import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

// Get all council members
export async function GET() {
    try {
        const councilMembers = await prisma.councilMember.findMany({
            orderBy: { order: 'asc' }
        })

        return NextResponse.json(councilMembers)
    } catch (error) {
        console.error("Error fetching council members:", error)
        return NextResponse.json(
            { message: "Failed to fetch council members" },
            { status: 500 }
        )
    }
}

// Create a new council member
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Only admins and captains can add council members
        if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.CAPTAIN)) {
            return NextResponse.json(
                { message: "Unauthorized. Only administrators and captains can manage council members." },
                { status: 401 }
            )
        }

        try {
            const { name, position, imageUrl, signature, order, isActive } = await req.json()

            // Validate required fields
            if (!name || !position) {
                return NextResponse.json(
                    { message: "Name and position are required fields" },
                    { status: 400 }
                )
            }

            // If adding a new member with same order, shift others down
            if (order !== undefined) {
                const existingMembers = await prisma.councilMember.findMany({
                    where: { order: { gte: order } },
                    orderBy: { order: 'asc' }
                })

                // Update order for all members with >= order
                if (existingMembers.length > 0) {
                    await Promise.all(
                        existingMembers.map((member) =>
                            prisma.councilMember.update({
                                where: { id: member.id },
                                data: { order: member.order + 1 }
                            })
                        )
                    )
                }
            }

            // Create the new council member
            const councilMember = await prisma.councilMember.create({
                data: {
                    name,
                    position,
                    imageUrl: imageUrl || null,
                    signature: signature || null,
                    order: order || 0,
                    isActive: isActive !== undefined ? isActive : true,
                }
            })

            return NextResponse.json(councilMember)
        } catch (jsonError) {
            console.error("Error parsing request body:", jsonError)
            return NextResponse.json(
                { message: "Invalid request format" },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error("Error creating council member:", error)
        return NextResponse.json(
            { message: "Failed to create council member" },
            { status: 500 }
        )
    }
} 