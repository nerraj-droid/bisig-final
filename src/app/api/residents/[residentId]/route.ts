import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: { residentId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const resident = await prisma.resident.findUnique({
            where: { id: params.residentId },
            include: {
                household: true,
            },
        })

        if (!resident) {
            return NextResponse.json(
                { message: "Resident not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(resident)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { residentId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        await prisma.resident.delete({
            where: { id: params.residentId },
        })

        return NextResponse.json({ message: "Resident deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { residentId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const data = await req.json()

        // Validate required fields
        if (!data.firstName || !data.lastName || !data.birthDate || !data.gender || !data.civilStatus) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            )
        }

        const resident = await prisma.resident.update({
            where: { id: params.residentId },
            data: {
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                birthDate: new Date(data.birthDate),
                gender: data.gender,
                civilStatus: data.civilStatus,
                contactNo: data.contactNo,
                email: data.email,
                occupation: data.occupation,
                address: data.address,
                householdId: data.householdId || null,
            },
            include: {
                household: true,
            },
        })

        return NextResponse.json(resident)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
} 