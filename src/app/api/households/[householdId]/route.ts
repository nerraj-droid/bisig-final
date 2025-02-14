import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: { householdId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const household = await prisma.household.findUnique({
            where: { id: params.householdId },
            include: {
                residents: true,
            },
        })

        if (!household) {
            return NextResponse.json(
                { message: "Household not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(household)
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
    { params }: { params: { householdId: string } }
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
        if (!data.houseNo || !data.street || !data.barangay || !data.city || !data.province || !data.zipCode) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            )
        }

        const household = await prisma.household.update({
            where: { id: params.householdId },
            data: {
                houseNo: data.houseNo,
                street: data.street,
                barangay: data.barangay,
                city: data.city,
                province: data.province,
                zipCode: data.zipCode,
                latitude: data.latitude,
                longitude: data.longitude,
            },
            include: {
                residents: true,
            },
        })

        return NextResponse.json(household)
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
    { params }: { params: { householdId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        await prisma.household.delete({
            where: { id: params.householdId },
        })

        return NextResponse.json({ message: "Household deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
} 