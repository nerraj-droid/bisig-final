import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from 'zod'

const householdSchema = z.object({
    houseNo: z.string().min(1, 'House number is required'),
    street: z.string().min(1, 'Street is required'),
    barangay: z.string().min(1, 'Barangay is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
})

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const json = await req.json()
        const data = householdSchema.parse(json)

        const household = await prisma.household.create({
            data: {
                houseNo: data.houseNo,
                street: data.street,
                barangay: data.barangay,
                city: data.city,
                province: data.province,
                zipCode: data.zipCode,
                latitude: data.latitude || null,
                longitude: data.longitude || null,
            }
        })

        return NextResponse.json(household)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({
                message: 'Validation error',
                errors: error.errors
            }), { status: 400 })
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
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search")

        const where: Prisma.HouseholdWhereInput = search ? {
            OR: [
                { houseNo: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
                { street: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
            ],
        } : {}

        const households = await prisma.household.findMany({
            where,
            include: {
                residents: true,
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