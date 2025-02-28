import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

interface ExtendedSession {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: Role
    }
}

interface PageProps {
    params: {
        residentId: string
    }
}

const isAuthorized = (role: Role | undefined) => {
    return role === Role.SUPER_ADMIN || role === Role.CAPTAIN || role === Role.SECRETARY;
}

export async function GET(
    req: Request,
    { params }: PageProps
) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession

        if (!session?.user) {
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
        console.error('Error fetching resident:', error)
        return NextResponse.json(
            { message: "Failed to fetch resident" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: PageProps
) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession

        if (!session?.user?.role || !isAuthorized(session.user.role)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin, Captain, and Secretary can manage residents." },
                { status: 401 }
            )
        }

        const resident = await prisma.resident.findUnique({
            where: { id: params.residentId }
        })

        if (!resident) {
            return NextResponse.json(
                { message: "Resident not found" },
                { status: 404 }
            )
        }

        await prisma.resident.delete({
            where: { id: params.residentId },
        })

        return NextResponse.json({ message: "Resident deleted successfully" })
    } catch (error) {
        console.error('Error deleting resident:', error)
        return NextResponse.json(
            { message: "Failed to delete resident" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: Request,
    { params }: PageProps
) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession

        if (!session?.user?.role || !isAuthorized(session.user.role)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin, Captain, and Secretary can manage residents." },
                { status: 401 }
            )
        }

        if (!req.body) {
            return NextResponse.json(
                { message: "Request body is empty" },
                { status: 400 }
            )
        }

        let data;
        try {
            data = await req.json()
        } catch (error) {
            return NextResponse.json(
                { message: "Invalid JSON in request body" },
                { status: 400 }
            )
        }

        // Validate required fields
        if (!data.firstName || !data.lastName || !data.birthDate || !data.gender || !data.civilStatus || !data.address) {
            return NextResponse.json(
                {
                    message: "Missing required fields",
                    required: ["firstName", "lastName", "birthDate", "gender", "civilStatus", "address"],
                    received: data
                },
                { status: 400 }
            )
        }

        const resident = await prisma.resident.update({
            where: { id: params.residentId },
            data: {
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                extensionName: data.extensionName,
                alias: data.alias,
                birthDate: new Date(data.birthDate),
                gender: data.gender,
                civilStatus: data.civilStatus,
                contactNo: data.contactNo,
                email: data.email,
                occupation: data.occupation,
                educationalAttainment: data.educationalAttainment,
                bloodType: data.bloodType,
                religion: data.religion,
                ethnicGroup: data.ethnicGroup,
                nationality: data.nationality,
                address: data.address,
                userPhoto: data.userPhoto,
                motherMaidenName: data.motherMaidenName,
                motherMiddleName: data.motherMiddleName,
                motherFirstName: data.motherFirstName,
                fatherName: data.fatherName,
                fatherLastName: data.fatherLastName,
                fatherMiddleName: data.fatherMiddleName,
                familySerialNumber: data.familySerialNumber,
                headOfHousehold: data.headOfHousehold || false,
                familyRole: data.familyRole,
                voterInBarangay: data.voterInBarangay || false,
                votersIdNumber: data.votersIdNumber,
                lastVotingParticipationDate: data.lastVotingParticipationDate ? new Date(data.lastVotingParticipationDate) : null,
                householdId: data.householdId || null,
            },
            include: {
                household: true,
            },
        })

        return NextResponse.json(resident)
    } catch (error) {
        console.error('Error updating resident:', error)
        if (error instanceof Error) {
            return NextResponse.json(
                { message: "Failed to update resident", error: error.message },
                { status: 500 }
            )
        }
        return NextResponse.json(
            { message: "An unexpected error occurred" },
            { status: 500 }
        )
    }
} 