import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

<<<<<<< Updated upstream
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
=======
        const data = await request.json()
        
        // Basic validation
        if (!data.address) {
            return NextResponse.json(
                { message: 'Address is required' },
                { status: 400 }
            )
        }

        // Extract resident IDs from request
        const { residentIds, headOfHousehold, ...householdData } = data

        // Create the household first
        const household = await prisma.household.create({
            data: {
                id: randomUUID(),
                ...householdData,
                createdAt: new Date(),
                updatedAt: new Date(),
                mergedFrom: [],
                history: [],
            },
            include: {
                Resident: true,
            },
        })

        // Process residents if any were provided
        if (residentIds && residentIds.length > 0) {
            // Update each resident with the new household ID
            await Promise.all(
                residentIds.map(async (residentId: string) => {
                    return prisma.resident.update({
                        where: { id: residentId },
                        data: { 
                            householdId: household.id,
                            // If this resident is the head of household, update that flag
                            // isHeadOfHousehold: residentId === headOfHousehold
                        },
                    })
                })
            )
        }

        // If a specific head of household was provided but not in residentIds
        if (headOfHousehold && !residentIds.includes(headOfHousehold)) {
            await prisma.resident.update({
                where: { id: headOfHousehold },
                data: { 
                    householdId: household.id,
                    // isHeadOfHousehold: true
                },
            })
        }

>>>>>>> Stashed changes
        return NextResponse.json(
            { 
                message: 'Household created successfully', 
                household 
            }, 
            { status: 201 }
        )
    } catch (error) {
        console.error('Error creating household:', error)
        return NextResponse.json(
            { message: 'Failed to create household', error: (error as Error).message },
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