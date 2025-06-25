import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, isAuthorized } from "@/lib/auth"
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
        // Process direct age filters (min/max age)
        else {
            const minAge = searchParams.get('minAge')
            const maxAge = searchParams.get('maxAge')
            const today = new Date()
            
            if (minAge !== null && maxAge !== null) {
                // Both min and max age provided
                const minAgeValue = parseInt(minAge)
                const maxAgeValue = parseInt(maxAge)
                
                if (!isNaN(minAgeValue) && !isNaN(maxAgeValue)) {
                    // Calculate the birthdate range more precisely
                    // For min age, we need a date that is minAge years ago
                    const minAgeDate = new Date(today)
                    minAgeDate.setFullYear(today.getFullYear() - minAgeValue)
                    
                    // For max age, we need a date that is maxAge years ago
                    const maxAgeDate = new Date(today)
                    maxAgeDate.setFullYear(today.getFullYear() - maxAgeValue)
                    
                    // Someone between minAge and maxAge years old
                    // Their birthdate must be between maxAgeDate and minAgeDate
                    whereCondition.birthDate = {
                        lte: minAgeDate,
                        gte: maxAgeDate
                    }
                    console.log('API: Age filter conditions:', {
                        minAge: minAgeValue,
                        maxAge: maxAgeValue,
                        minAgeDate: minAgeDate.toISOString(),
                        maxAgeDate: maxAgeDate.toISOString(),
                        birthDateConditions: whereCondition.birthDate
                    });
                }
            } else if (minAge !== null) {
                // Only min age provided - older than minAge
                const minAgeValue = parseInt(minAge)
                
                if (!isNaN(minAgeValue)) {
                    // Calculate the date for minAge more precisely
                    const minAgeDate = new Date(today)
                    minAgeDate.setFullYear(today.getFullYear() - minAgeValue)
                    
                    // Their birthdate must be earlier than minAgeDate
                    whereCondition.birthDate = {
                        lte: minAgeDate
                    }
                    console.log('API: Min age filter:', {
                        minAge: minAgeValue,
                        minAgeDate: minAgeDate.toISOString(),
                        birthDateCondition: whereCondition.birthDate
                    });
                }
            } else if (maxAge !== null) {
                // Only max age provided - younger than maxAge
                const maxAgeValue = parseInt(maxAge)
                
                if (!isNaN(maxAgeValue)) {
                    // Calculate the date for maxAge more precisely
                    const maxAgeDate = new Date(today)
                    maxAgeDate.setFullYear(today.getFullYear() - maxAgeValue)
                    
                    // Their birthdate must be later than maxAgeDate
                    whereCondition.birthDate = {
                        gte: maxAgeDate
                    }
                    console.log('API: Max age filter:', {
                        maxAge: maxAgeValue,
                        maxAgeDate: maxAgeDate.toISOString(),
                        birthDateCondition: whereCondition.birthDate
                    });
                }
            }
            
            // Handle additional precision parameters
            const ageYears = searchParams.get('ageYears')
            const ageMonths = searchParams.get('ageMonths')
            const ageDays = searchParams.get('ageDays')
            
            if (ageYears !== null || ageMonths !== null || ageDays !== null) {
                // Calculate exact date based on years, months, days
                const preciseDate = new Date(today)
                
                if (ageYears !== null) {
                    const years = parseInt(ageYears)
                    if (!isNaN(years)) {
                        preciseDate.setFullYear(preciseDate.getFullYear() - years)
                    }
                }
                
                if (ageMonths !== null) {
                    const months = parseInt(ageMonths)
                    if (!isNaN(months)) {
                        preciseDate.setMonth(preciseDate.getMonth() - months)
                    }
                }
                
                if (ageDays !== null) {
                    const days = parseInt(ageDays)
                    if (!isNaN(days)) {
                        preciseDate.setDate(preciseDate.getDate() - days)
                    }
                }
                
                // If we already have a birthDate condition, refine it
                if (whereCondition.birthDate && typeof whereCondition.birthDate === 'object' && 'lte' in whereCondition.birthDate && 'gte' in whereCondition.birthDate) {
                    // If exact age is specified, create a range of ±2 days around that age
                    const rangeStart = new Date(preciseDate)
                    rangeStart.setDate(rangeStart.getDate() - 2)
                    
                    const rangeEnd = new Date(preciseDate)
                    rangeEnd.setDate(rangeEnd.getDate() + 2)
                    
                    const birthDateFilter = whereCondition.birthDate as any;
                    
                    // Check and update constraints if needed
                    if (!birthDateFilter.lte || birthDateFilter.lte > rangeEnd) {
                        birthDateFilter.lte = rangeEnd;
                    }
                    
                    if (!birthDateFilter.gte || birthDateFilter.gte < rangeStart) {
                        birthDateFilter.gte = rangeStart;
                    }
                } else {
                    // Create a small range around the exact age (±2 days)
                    const rangeStart = new Date(preciseDate)
                    rangeStart.setDate(rangeStart.getDate() - 2)
                    
                    const rangeEnd = new Date(preciseDate)
                    rangeEnd.setDate(rangeEnd.getDate() + 2)
                    
                    whereCondition.birthDate = {
                        lte: rangeEnd,
                        gte: rangeStart
                    }
                }
                
                console.log('API: Precise age filter:', {
                    years: ageYears,
                    months: ageMonths,
                    days: ageDays,
                    targetDate: preciseDate.toISOString(),
                    birthDateCondition: whereCondition.birthDate
                });
            }
        }

        // Process other advanced filters
        const employmentStatus = searchParams.get('employmentStatus')
        if (employmentStatus) {
            whereCondition.employmentStatus = employmentStatus
        }
        
        const educationalAttainment = searchParams.get('educationalAttainment')
        if (educationalAttainment) {
            whereCondition.educationalAttainment = educationalAttainment
        }
        
        const sectors = searchParams.get('sectors')
        if (sectors) {
            const sectorArray = sectors.split(',')
            if (sectorArray.length > 0) {
                whereCondition.sectors = {
                    hasSome: sectorArray
                }
            }
        }
        
        const religion = searchParams.get('religion')
        if (religion) {
            whereCondition.religion = {
                contains: religion,
                mode: 'insensitive' as Prisma.QueryMode
            }
        }
        
        const bloodType = searchParams.get('bloodType')
        if (bloodType) {
            whereCondition.bloodType = bloodType
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
