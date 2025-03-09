import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Prisma, Role } from "@prisma/client"
import { z } from 'zod'
import { randomUUID } from "crypto"
import { PrismaClient } from "@prisma/client"
import { NextRequest } from "next/server"

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
    middleName: z.string().optional().nullable(),
    extensionName: z.string().optional().nullable(),
    alias: z.string().optional().nullable(),
    birthDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid date'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    civilStatus: z.enum(['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED']),
    address: z.string().min(1, 'Address is required'),
    email: z.string().email().optional().nullable(),
    contactNo: z.string().optional().nullable(),
    occupation: z.string().optional().nullable(),
    employmentStatus: z.string().optional().nullable(),
    unemploymentReason: z.string().optional().nullable(),
    educationalAttainment: z.string().optional().nullable(),
    bloodType: z.string().optional().nullable(),
    religion: z.string().optional().nullable(),
    ethnicGroup: z.string().optional().nullable(),
    nationality: z.string().optional().nullable(),
    userPhoto: z.string().optional().nullable(),
    motherMaidenName: z.string().optional().nullable(),
    motherMiddleName: z.string().optional().nullable(),
    motherFirstName: z.string().optional().nullable(),
    fatherName: z.string().optional().nullable(),
    fatherLastName: z.string().optional().nullable(),
    fatherMiddleName: z.string().optional().nullable(),
    headOfHousehold: z.boolean().optional(),
    voterInBarangay: z.boolean().optional(),
    sectors: z.array(z.string()).optional(),
    proofOfIdentity: z.string().optional().nullable(),
    proofOfIdentityUrl: z.string().optional().nullable(),
    identityType: z.string().optional().nullable(),
    householdId: z.string().optional().nullable(),
    // Address components
    houseNo: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    barangay: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession

        if (!session?.user?.role || !isAuthorized(session.user.role)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin, Captain, and Secretary can manage residents." },
                { status: 401 }
            )
        }

        const data = await request.json()

        // Validate the data using zod schema
        const validatedData = residentSchema.parse(data)

        const resident = await prisma.resident.create({
            data: {
                id: randomUUID(),
                updatedAt: new Date(),
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
                employmentStatus: validatedData.employmentStatus,
                educationalAttainment: validatedData.educationalAttainment,
                bloodType: validatedData.bloodType,
                religion: validatedData.religion,
                ethnicGroup: validatedData.ethnicGroup,
                nationality: validatedData.nationality || '',
                address: validatedData.address,
                userPhoto: validatedData.userPhoto,
                motherMaidenName: validatedData.motherMaidenName,
                motherMiddleName: validatedData.motherMiddleName,
                motherFirstName: validatedData.motherFirstName,
                fatherName: validatedData.fatherName,
                fatherLastName: validatedData.fatherLastName,
                fatherMiddleName: validatedData.fatherMiddleName,
                headOfHousehold: validatedData.headOfHousehold || false,
                voterInBarangay: validatedData.voterInBarangay || false,
                sectors: validatedData.sectors || [],
                // Use either proofOfIdentityUrl or proofOfIdentity
                proofOfIdentity: validatedData.proofOfIdentityUrl || validatedData.proofOfIdentity,
                identityType: validatedData.identityType,
                householdId: validatedData.householdId || null,
            },
            include: {
                Household: true,
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
        console.error("Error creating resident:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession

        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        // Search condition
        const whereCondition = search
            ? {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { lastName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { middleName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { address: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                ],
            }
            : {}

        // Get residents with pagination and search
        const residents = await prisma.resident.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: {
                lastName: 'asc'
            },
            include: {
                Household: true
            }
        })

        // Format the data to match the expected format
        const formattedResidents = residents.map(resident => ({
            id: resident.id,
            firstName: resident.firstName,
            middleName: resident.middleName,
            lastName: resident.lastName,
            extensionName: resident.extensionName,
            birthDate: resident.birthDate ? resident.birthDate.toISOString() : '',
            gender: resident.gender,
            civilStatus: resident.civilStatus,
            contactNo: resident.contactNo,
            email: resident.email,
            occupation: resident.occupation,
            voterInBarangay: resident.voterInBarangay,
            headOfHousehold: resident.headOfHousehold,
            Household: 'Household' in resident && resident.Household ? {
                houseNo: resident.Household.houseNo,
                street: resident.Household.street
            } : null
        }))

        return NextResponse.json(formattedResidents)
    } catch (error) {
        console.error("Error fetching residents:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
} 