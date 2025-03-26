import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

// Get a specific council member
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const councilMember = await prisma.councilMember.findUnique({
            where: { id }
        })

        if (!councilMember) {
            return NextResponse.json(
                { message: "Council member not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(councilMember)
    } catch (error) {
        console.error("Error fetching council member:", error)
        return NextResponse.json(
            { message: "Failed to fetch council member" },
            { status: 500 }
        )
    }
}

// Update a council member
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        // Only admins and captains can update council members
        if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.CAPTAIN)) {
            return NextResponse.json(
                { message: "Unauthorized. Only administrators and captains can manage council members." },
                { status: 401 }
            )
        }

        const { id } = params

        try {
            const { name, position, imageUrl, signature, isActive } = await request.json()

            // Validate required fields
            if (!name || !position) {
                return NextResponse.json(
                    { message: "Name and position are required fields" },
                    { status: 400 }
                )
            }

            // Check if member exists
            const existingMember = await prisma.councilMember.findUnique({
                where: { id }
            })

            if (!existingMember) {
                return NextResponse.json(
                    { message: "Council member not found" },
                    { status: 404 }
                )
            }

            // Update the council member
            const updatedMember = await prisma.councilMember.update({
                where: { id },
                data: {
                    name,
                    position,
                    imageUrl: imageUrl || null,
                    signature: signature || null,
                    isActive: isActive !== undefined ? isActive : true,
                    updatedAt: new Date()
                }
            })

            return NextResponse.json(updatedMember)
        } catch (jsonError) {
            console.error("Error parsing request body:", jsonError)
            return NextResponse.json(
                { message: "Invalid request format" },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error("Error updating council member:", error)
        return NextResponse.json(
            { message: "Failed to update council member" },
            { status: 500 }
        )
    }
}

// Delete a council member
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        // Only admins and captains can delete council members
        if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.CAPTAIN)) {
            return NextResponse.json(
                { message: "Unauthorized. Only administrators and captains can manage council members." },
                { status: 401 }
            )
        }

        const { id } = params

        // Check if member exists
        const existingMember = await prisma.councilMember.findUnique({
            where: { id }
        })

        if (!existingMember) {
            return NextResponse.json(
                { message: "Council member not found" },
                { status: 404 }
            )
        }

        // Get the order of the deleted member to reorder others
        const order = existingMember.order

        // Delete the council member
        await prisma.councilMember.delete({
            where: { id }
        })

        // Reorder remaining members
        await prisma.councilMember.updateMany({
            where: { order: { gt: order } },
            data: { order: { decrement: 1 } }
        })

        return NextResponse.json(
            { message: "Council member deleted successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error deleting council member:", error)
        return NextResponse.json(
            { message: "Failed to delete council member" },
            { status: 500 }
        )
    }
} 