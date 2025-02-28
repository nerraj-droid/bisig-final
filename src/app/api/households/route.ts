import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Prisma, Role, HouseholdType, HouseholdStatus } from "@prisma/client"
import { z } from "zod"
import { randomUUID } from "crypto"

interface ExtendedSession {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: Role
    }
}

const isAuthorized = (role: Role | undefined) => {
    return role === Role.SUPER_ADMIN || role === Role.CAPTAIN || role === Role.SECRETARY
}

// Define validation schema
const householdSchema = z.object({
    houseNo: z.string().min(1, "House number is required"),
    street: z.string().min(1, "Street is required"),
    barangay: z.string().min(1, "Barangay is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    type: z.nativeEnum(HouseholdType).default(HouseholdType.SINGLE_FAMILY),
    status: z.nativeEnum(HouseholdStatus).default(HouseholdStatus.ACTIVE),
    notes: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession

        if (!session?.user?.role || !isAuthorized(session.user.role)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin, Captain, and Secretary can manage households." },
                { status: 401 }
            )
        }

        const data = await req.json()
        const validatedData = householdSchema.parse(data)

        const household = await prisma.household.create({
            data: {
                id: randomUUID(),
                ...validatedData,
                createdAt: new Date(),
                updatedAt: new Date(),
                mergedFrom: [],
                history: [],
            },
            include: {
                Resident: true,
            },
        })

        return NextResponse.json(household)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Validation error", errors: error.errors },
                { status: 400 }
            )
        }

        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
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

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search")
        const type = searchParams.get("type") as HouseholdType | null
        const status = searchParams.get("status") as HouseholdStatus | null

        let where: Prisma.HouseholdWhereInput = {}

        if (search) {
            where = {
                OR: [
                    { houseNo: { contains: search, mode: "insensitive" } },
                    { street: { contains: search, mode: "insensitive" } },
                    { barangay: { contains: search, mode: "insensitive" } },
                    { city: { contains: search, mode: "insensitive" } },
                    { province: { contains: search, mode: "insensitive" } },
                    { zipCode: { contains: search, mode: "insensitive" } },
                ],
            }
        }

        if (type) {
            where = { ...where, type }
        }

        if (status) {
            where = { ...where, status }
        }

        const households = await prisma.household.findMany({
            where,
            include: {
                Resident: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(households)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
} 