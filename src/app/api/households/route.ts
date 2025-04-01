import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, isAuthorized } from "@/lib/auth"
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

// Define validation schema
const householdSchema = z.object({
    address: z.string().min(1, "Address is required"),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    notes: z.string().optional(),
})

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession

        if (!session?.user?.role || !isAuthorized(session.user.role)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin, Captain, and Secretary can manage households." },
                { status: 401 }
            )
        }

        const data = await request.json()

        // Basic validation
        if (!data.address) {
            return NextResponse.json(
                { message: 'Address is required' },
                { status: 400 }
            )
        }

        // Extract resident IDs from request
        const { residentIds = [], headOfHousehold = '', address, notes = '', ...otherData } = data

        // Set default address components
        const addressParts = address.split(',');
        const houseNo = addressParts[0]?.trim() || 'N/A';
        const street = addressParts[1]?.trim() || 'N/A';
        const barangay = addressParts[2]?.trim() || 'Barangay';
        const city = addressParts[3]?.trim() || 'City';
        const province = addressParts[4]?.trim() || 'Province';
        const zipCode = addressParts[5]?.trim() || '0000';

        // Add head of household info to notes
        let householdNotes = notes;
        if (headOfHousehold) {
            householdNotes += `\nHead of Household ID: ${headOfHousehold}`;
        }

        // Create the household
        const household = await prisma.household.create({
            data: {
                id: randomUUID(),
                houseNo,
                street,
                barangay,
                city,
                province,
                zipCode,
                notes: householdNotes,
                type: HouseholdType.SINGLE_FAMILY,
                status: HouseholdStatus.ACTIVE,
                ...otherData,  // This includes latitude and longitude
                createdAt: new Date(),
                updatedAt: new Date(),
                mergedFrom: [],
                history: [],
            },
            include: {
                Resident: true,
            },
        })

        console.log(`Created household with ID: ${household.id}`);

        // Process residents if any were provided
        const validResidentIds = Array.isArray(residentIds)
            ? residentIds.filter((id: string) => id && typeof id === 'string')
            : [];

        if (validResidentIds.length > 0) {
            try {
                // Update each resident with the new household ID
                await Promise.all(
                    validResidentIds.map(async (residentId: string) => {
                        return prisma.resident.update({
                            where: { id: residentId },
                            data: {
                                householdId: household.id
                            },
                        })
                    })
                );
                console.log(`Updated ${validResidentIds.length} residents with household ID`);
            } catch (residentError) {
                console.error('Error updating residents:', residentError);
                // Continue with the response even if resident updates fail
            }
        }

        return NextResponse.json(
            {
                message: 'Household created successfully',
                household: {
                    id: household.id,
                    address: address,
                    residents: household.Resident
                }
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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '500', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const skip = (page - 1) * limit;

        // Get all households with their coordinates and basic information
        const households = await prisma.household.findMany({
            select: {
                id: true,
                houseNo: true,
                street: true,
                barangay: true,
                city: true,
                latitude: true,
                longitude: true,
                Resident: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        birthDate: true,
                        gender: true,
                        civilStatus: true,
                        contactNo: true,
                    },
                },
            },
            where: {
                latitude: { not: null },
                longitude: { not: null }
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip: skip
        });

        return NextResponse.json(households);
    } catch (error) {
        console.error('Error fetching households:', error);
        return NextResponse.json(
            { error: 'Error fetching households' },
            { status: 500 }
        );
    }
} 
