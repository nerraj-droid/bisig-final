import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

interface ExtendedSession {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: Role;
        id?: string | null;
    };
}

const isAuthorized = (role: Role | undefined) => {
    return role === Role.SUPER_ADMIN || role === Role.CAPTAIN || role === Role.SECRETARY;
};

// POST /api/households/[id]/residents - Add resident to household
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession;

        if (!session?.user?.role || !isAuthorized(session.user.role)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin, Captain, and Secretary can manage household residents." },
                { status: 401 }
            );
        }

        const householdId = params.id;
        if (!householdId) {
            return NextResponse.json(
                { message: "Household ID is required" },
                { status: 400 }
            );
        }

        // Parse request body
        const data = await request.json();
        const { residentId, isHeadOfHousehold = false } = data;

        if (!residentId) {
            return NextResponse.json(
                { message: "Resident ID is required" },
                { status: 400 }
            );
        }

        // Check if household exists
        const existingHousehold = await prisma.household.findUnique({
            where: { id: householdId },
            include: {
                Resident: true
            }
        });

        if (!existingHousehold) {
            return NextResponse.json(
                { message: "Household not found" },
                { status: 404 }
            );
        }

        // Check if resident exists
        const existingResident = await prisma.resident.findUnique({
            where: { id: residentId }
        });

        if (!existingResident) {
            return NextResponse.json(
                { message: "Resident not found" },
                { status: 404 }
            );
        }

        // Check if resident is already in this household
        if (existingResident.householdId === householdId) {
            return NextResponse.json(
                { message: "Resident is already a member of this household" },
                { status: 400 }
            );
        }

        // If resident is already in another household, remove them first
        if (existingResident.householdId) {
            console.log(`Removing resident ${residentId} from previous household ${existingResident.householdId}`);
        }

        // Add resident to the household
        const updatedResident = await prisma.resident.update({
            where: { id: residentId },
            data: {
                householdId: householdId,
                headOfHousehold: Boolean(isHeadOfHousehold),
                updatedAt: new Date()
            }
        });

        // If this resident is being set as head of household, 
        // remove head status from other residents in this household
        if (isHeadOfHousehold) {
            await prisma.resident.updateMany({
                where: {
                    householdId: householdId,
                    id: { not: residentId }
                },
                data: {
                    headOfHousehold: false,
                    updatedAt: new Date()
                }
            });
        }

        // Get updated household with all residents
        const updatedHousehold = await prisma.household.findUnique({
            where: { id: householdId },
            include: {
                Resident: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        middleName: true,
                        birthDate: true,
                        gender: true,
                        civilStatus: true,
                        headOfHousehold: true
                    }
                }
            }
        });

        return NextResponse.json({
            message: "Resident successfully added to household",
            resident: updatedResident,
            household: updatedHousehold
        });

    } catch (error) {
        console.error('Error adding resident to household:', error);
        return NextResponse.json(
            { message: 'Failed to add resident to household', error: (error as Error).message },
            { status: 500 }
        );
    }
}

// GET /api/households/[id]/residents - Get all residents in household
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession;

        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const householdId = params.id;
        if (!householdId) {
            return NextResponse.json(
                { message: "Household ID is required" },
                { status: 400 }
            );
        }

        // Get all residents in the household
        const residents = await prisma.resident.findMany({
            where: { householdId: householdId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                extensionName: true,
                birthDate: true,
                gender: true,
                civilStatus: true,
                contactNo: true,
                email: true,
                occupation: true,
                headOfHousehold: true,
                voterInBarangay: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: [
                { headOfHousehold: 'desc' }, // Head of household first
                { lastName: 'asc' }
            ]
        });

        return NextResponse.json({
            householdId,
            residents,
            count: residents.length
        });

    } catch (error) {
        console.error('Error fetching household residents:', error);
        return NextResponse.json(
            { message: 'Failed to fetch household residents', error: (error as Error).message },
            { status: 500 }
        );
    }
} 