import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, HouseholdType, HouseholdStatus } from "@prisma/client"
import { z } from "zod"

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

// Define validation schema for updates
const householdUpdateSchema = z.object({
    houseNo: z.string().optional(),
    street: z.string().optional(),
    barangay: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    zipCode: z.string().optional(),
    notes: z.string().optional(),
    type: z.nativeEnum(HouseholdType).optional(),
    status: z.nativeEnum(HouseholdStatus).optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
});

// GET /api/households/[id]
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const household = await prisma.household.findUnique({
            where: { id: params.id },
            include: {
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
        });

        if (!household) {
            return NextResponse.json(
                { message: "Household not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(household);
    } catch (error) {
        console.error('Error fetching household:', error);
        return NextResponse.json(
            { message: 'Failed to fetch household', error: (error as Error).message },
            { status: 500 }
        );
    }
}

// PATCH /api/households/[id]
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Authorization check
        const session = await getServerSession(authOptions) as ExtendedSession;
        if (!session?.user?.role || !isAuthorized(session.user.role)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin, Captain, and Secretary can update households." },
                { status: 401 }
            );
        }

        // Get household ID from params
        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { message: "Household ID is required" },
                { status: 400 }
            );
        }

        // Check if household exists
        const existingHousehold = await prisma.household.findUnique({
            where: { id },
        });

        if (!existingHousehold) {
            return NextResponse.json(
                { message: "Household not found" },
                { status: 404 }
            );
        }

        // Parse and validate request body
        const requestText = await request.text();
        let data;
        try {
            data = JSON.parse(requestText);
        } catch (error) {
            return NextResponse.json(
                { message: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        // Validate the update data
        const validationResult = householdUpdateSchema.safeParse(data);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Invalid data provided",
                    errors: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        // Update the household
        const updatedHousehold = await prisma.household.update({
            where: { id },
            data: {
                ...validationResult.data,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            message: "Household updated successfully",
            household: updatedHousehold
        });
    } catch (error) {
        console.error('Error updating household:', error);
        return NextResponse.json(
            { message: 'Failed to update household', error: (error as Error).message },
            { status: 500 }
        );
    }
}

// DELETE /api/households/[id]
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Authorization check
        const session = await getServerSession(authOptions) as ExtendedSession;
        if (!session?.user?.role || !isAuthorized(session.user.role)) {
            return NextResponse.json(
                { message: "Unauthorized. Only Super Admin, Captain, and Secretary can delete households." },
                { status: 401 }
            );
        }

        // Get household ID from params
        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { message: "Household ID is required" },
                { status: 400 }
            );
        }

        // Check if household exists
        const existingHousehold = await prisma.household.findUnique({
            where: { id },
            include: { Resident: true }
        });

        if (!existingHousehold) {
            return NextResponse.json(
                { message: "Household not found" },
                { status: 404 }
            );
        }

        // If there are residents in this household, remove household reference
        if (existingHousehold.Resident.length > 0) {
            await prisma.resident.updateMany({
                where: { householdId: id },
                data: { householdId: null }
            });
        }

        // Delete the household
        await prisma.household.delete({
            where: { id }
        });

        return NextResponse.json({
            message: "Household deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting household:', error);
        return NextResponse.json(
            { message: 'Failed to delete household', error: (error as Error).message },
            { status: 500 }
        );
    }
} 