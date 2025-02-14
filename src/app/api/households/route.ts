import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
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

        const where = search ? {
            OR: [
                { houseNo: { contains: search, mode: "insensitive" } },
                { street: { contains: search, mode: "insensitive" } },
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