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
        if (!data.firstName || !data.lastName || !data.birthDate || !data.gender || !data.civilStatus) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            )
        }

        const resident = await prisma.resident.create({
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
            }
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
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
            ],
        } : {}

        const residents = await prisma.resident.findMany({
            where,
            include: {
                household: true,
            },
            orderBy: {
                createdAt: "desc",
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