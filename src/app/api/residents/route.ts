import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Prisma, Role } from "@prisma/client"
import { z } from 'zod'

interface ExtendedSession {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: Role
    }
}

const isAuthorized = (role: Role | undefined) => {
    return role === Role.SUPER_ADMIN || role === Role.CAPTAIN || role === Role.SECRETARY;
}

// Define validation schema
const residentSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    extensionName: z.string().optional(),
    alias: z.string().optional(),
    birthDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid date'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    civilStatus: z.enum(['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED']),
    address: z.string().min(1, 'Address is required'),
    email: z.string().email().optional(),
    contactNo: z.string().regex(/^(\+63|0)[0-9]{10}$/).optional(),
    occupation: z.string().optional(),
    educationalAttainment: z.string().optional(),
    bloodType: z.string().optional(),
    religion: z.string().optional(),
    ethnicGroup: z.string().optional(),
    nationality: z.string().optional(),
    userPhoto: z.string().optional(),
    motherMaidenName: z.string().optional(),
    motherMiddleName: z.string().optional(),
    motherFirstName: z.string().optional(),
    fatherName: z.string().optional(),
    fatherLastName: z.string().optional(),
    fatherMiddleName: z.string().optional(),
    familySerialNumber: z.string().optional(),
    headOfHousehold: z.boolean().optional(),
    familyRole: z.string().optional(),
    voterInBarangay: z.boolean().optional(),
    votersIdNumber: z.string().optional(),
    lastVotingParticipationDate: z.string().optional(),
    householdId: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession

        if (!session?.user?.role || !isAuthorized(session.user.role)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin, Captain, and Secretary can manage residents." },
                { status: 401 }
            )
        }

        // Read the request body once
        const data = await req.json()

        // Validate the data using zod schema
        const validatedData = residentSchema.parse(data)

        const resident = await prisma.resident.create({
            data: {
                firstName: validatedData.firstName,
                middleName: validatedData.middleName,
                lastName: validatedData.lastName,
                extensionName: validatedData.extensionName,
                alias: validatedData.alias,
                birthDate: new Date(validatedData.birthDate),
                gender: validatedData.gender,
                civilStatus: validatedData.civilStatus,
                contactNo: validatedData.contactNo,
                email: validatedData.email,
                occupation: validatedData.occupation,
                educationalAttainment: validatedData.educationalAttainment,
                bloodType: validatedData.bloodType,
                religion: validatedData.religion,
                ethnicGroup: validatedData.ethnicGroup,
                nationality: validatedData.nationality,
                address: validatedData.address,
                userPhoto: validatedData.userPhoto,
                motherMaidenName: validatedData.motherMaidenName,
                motherMiddleName: validatedData.motherMiddleName,
                motherFirstName: validatedData.motherFirstName,
                fatherName: validatedData.fatherName,
                fatherLastName: validatedData.fatherLastName,
                fatherMiddleName: validatedData.fatherMiddleName,
                familySerialNumber: validatedData.familySerialNumber,
                headOfHousehold: validatedData.headOfHousehold || false,
                familyRole: validatedData.familyRole,
                voterInBarangay: validatedData.voterInBarangay || false,
                votersIdNumber: validatedData.votersIdNumber,
                lastVotingParticipationDate: validatedData.lastVotingParticipationDate ? new Date(validatedData.lastVotingParticipationDate) : null,
                householdId: validatedData.householdId || null,
            },
            include: {
                household: true,
            }
        })

        return NextResponse.json(resident)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({
                message: 'Validation error',
                errors: error.errors
            }), { status: 400 })
        }
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession

        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(req.url, 'http://localhost:3000')
        const search = searchParams.get("search")

        let where: Prisma.ResidentWhereInput = {}

        if (search) {
            where = {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { lastName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { extensionName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { alias: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { motherMaidenName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { fatherName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { familySerialNumber: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { votersIdNumber: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                ],
            }
        }

        const residents = await prisma.resident.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                extensionName: true,
                alias: true,
                birthDate: true,
                gender: true,
                civilStatus: true,
                contactNo: true,
                email: true,
                occupation: true,
                educationalAttainment: true,
                bloodType: true,
                religion: true,
                ethnicGroup: true,
                nationality: true,
                address: true,
                userPhoto: true,
                motherMaidenName: true,
                motherMiddleName: true,
                motherFirstName: true,
                fatherName: true,
                fatherLastName: true,
                fatherMiddleName: true,
                familySerialNumber: true,
                headOfHousehold: true,
                familyRole: true,
                voterInBarangay: true,
                votersIdNumber: true,
                lastVotingParticipationDate: true,
                household: {
                    select: {
                        id: true,
                        houseNo: true,
                        street: true,
                        barangay: true,
                        city: true,
                        province: true,
                        zipCode: true,
                    }
                },
            },
            orderBy: {
                lastName: "asc",
            },
        })

        return NextResponse.json(residents)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
} 