import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Prisma, Role, Gender, CivilStatus } from "@prisma/client"
import { z } from 'zod'
import { randomUUID } from "crypto"

interface ExtendedSession {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: Role
        id?: string | null
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
    gender: z.nativeEnum(Gender),
    civilStatus: z.nativeEnum(CivilStatus),
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
    fatherName: z.string().optional().nullable(),
    fatherMiddleName: z.string().optional().nullable(),
    fatherLastName: z.string().optional().nullable(),
    motherFirstName: z.string().optional().nullable(),
    motherMiddleName: z.string().optional().nullable(),
    motherMaidenName: z.string().optional().nullable(),
    voterInBarangay: z.boolean().optional(),
    sectors: z.array(z.string()).optional(),
    identityType: z.string().optional().nullable(),
    identityNumber: z.string().optional().nullable(),
    identityDocumentPath: z.string().optional().nullable(),
    householdId: z.string().optional().nullable(),
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

        if (!data) {
            return NextResponse.json(
                { message: "No data provided" },
                { status: 400 }
            )
        }

        // Validate the data using zod schema
        try {
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
                    employmentStatus: validatedData.employmentStatus || "EMPLOYED",
                    educationalAttainment: validatedData.educationalAttainment,
                    bloodType: validatedData.bloodType,
                    religion: validatedData.religion,
                    ethnicGroup: validatedData.ethnicGroup,
                    nationality: validatedData.nationality || 'Filipino',
                    address: validatedData.address,
                    userPhoto: validatedData.userPhoto,
                    fatherName: validatedData.fatherName || null,
                    fatherMiddleName: validatedData.fatherMiddleName || null,
                    fatherLastName: validatedData.fatherLastName || null,
                    motherFirstName: validatedData.motherFirstName || null,
                    motherMiddleName: validatedData.motherMiddleName || null,
                    motherMaidenName: validatedData.motherMaidenName || null,
                    voterInBarangay: validatedData.voterInBarangay || false,
                    sectors: validatedData.sectors || [],
                    identityType: validatedData.identityType,
                    identityNumber: validatedData.identityNumber,
                    identityDocumentPath: validatedData.identityDocumentPath,
                    householdId: validatedData.householdId,
                },
            })

            return NextResponse.json(resident)
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                return NextResponse.json(
                    {
                        message: "Validation error",
                        errors: validationError.errors
                    },
                    { status: 400 }
                )
            }
            throw validationError
        }
    } catch (error) {
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

        // Build WHERE condition for filtering
        const whereCondition: Prisma.ResidentWhereInput = {};

        // Text search condition
        if (search) {
            whereCondition.OR = [
                { firstName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                { lastName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                { middleName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                { address: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            ];
        }

        // Process gender filter
        const gender = searchParams.get('gender')
        if (gender && (gender === 'MALE' || gender === 'FEMALE')) {
            whereCondition.gender = gender as Gender
        }

        // Process civil status filter
        const civilStatus = searchParams.get('civilStatus')
        if (civilStatus && ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED'].includes(civilStatus)) {
            whereCondition.civilStatus = civilStatus as CivilStatus
        }

        // Process voter filter
        const voter = searchParams.get('voter')
        if (voter !== null) {
            whereCondition.voterInBarangay = voter === 'true'
        }

        // Process age group filter
        const ageGroup = searchParams.get('ageGroup')
        if (ageGroup) {
            const today = new Date()

            switch (ageGroup) {
                case 'child':
                    // Children: 0-12 years
                    whereCondition.birthDate = {
                        gte: new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
                    }
                    break
                case 'young-adult':
                    // Young Adults: 13-30 years
                    whereCondition.birthDate = {
                        lt: new Date(today.getFullYear() - 12, today.getMonth(), today.getDate()),
                        gte: new Date(today.getFullYear() - 30, today.getMonth(), today.getDate())
                    }
                    break
                case 'adult':
                    // Adults: 31-60 years
                    whereCondition.birthDate = {
                        lt: new Date(today.getFullYear() - 30, today.getMonth(), today.getDate()),
                        gte: new Date(today.getFullYear() - 60, today.getMonth(), today.getDate())
                    }
                    break
                case 'senior':
                    // Seniors: 60+ years
                    whereCondition.birthDate = {
                        lt: new Date(today.getFullYear() - 60, today.getMonth(), today.getDate())
                    }
                    break
            }
        }

        // Only request fields that are actually needed to improve performance
        const residents = await prisma.resident.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: {
                lastName: 'asc'
            },
            select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                extensionName: true,
                birthDate: true,
                gender: true,
                civilStatus: true,
                contactNo: true,
                email: true,
                occupation: true,
                voterInBarangay: true,
                fatherName: true,
                fatherMiddleName: true,
                fatherLastName: true,
                motherFirstName: true,
                motherMiddleName: true,
                motherMaidenName: true,
                Household: {
                    select: {
                        houseNo: true,
                        street: true
                    }
                }
            }
        })

        // Run count query in parallel if we need total count
        let totalCount;
        if (searchParams.has('withCount')) {
            totalCount = await prisma.resident.count({
                where: whereCondition
            });
            return NextResponse.json({
                data: residents,
                meta: {
                    total: totalCount,
                    page,
                    limit,
                    pages: Math.ceil(totalCount / limit)
                }
            })
        }

        return NextResponse.json(residents)
    } catch (error) {
        console.error("Error fetching residents:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
} 