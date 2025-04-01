import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Schema for updating a fiscal year
const UpdateFiscalYearSchema = z.object({
    year: z.string().min(5).max(10).optional(),
    startDate: z.string().transform((date) => new Date(date)).optional(),
    endDate: z.string().transform((date) => new Date(date)).optional(),
    isActive: z.boolean().optional(),
});

// GET handler to fetch a specific fiscal year
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Only allow TREASURER and CAPTAIN roles to access financial data
        if (!["TREASURER", "CAPTAIN", "SUPER_ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        try {
            // Fetch the fiscal year
            const fiscalYear = await prisma.fiscalYear.findUnique({
                where: { id: params.id },
                include: {
                    budgets: {
                        include: {
                            category: true,
                        },
                    },
                },
            });

            if (!fiscalYear) {
                return NextResponse.json(
                    { message: "Fiscal year not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(fiscalYear);
        } catch (error: any) {
            // Handle case where table doesn't exist yet
            if (error.message?.includes('does not exist')) {
                return NextResponse.json(
                    { message: "Financial tables not yet created. Run database migrations first." },
                    { status: 503 }
                );
            }
            throw error; // Re-throw if it's not the expected error
        }
    } catch (error) {
        console.error("Error fetching fiscal year:", error);
        return NextResponse.json(
            { message: "Failed to fetch fiscal year" },
            { status: 500 }
        );
    }
}

// PUT handler to update a fiscal year
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Only allow TREASURER and CAPTAIN roles to update fiscal years
        if (!["TREASURER", "CAPTAIN", "SUPER_ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Parse and validate request body
        const body = await req.json();
        const validatedData = UpdateFiscalYearSchema.parse(body);

        try {
            // If setting this fiscal year as active, deactivate all others
            if (validatedData.isActive) {
                await prisma.fiscalYear.updateMany({
                    where: {
                        isActive: true,
                        id: { not: params.id }
                    },
                    data: { isActive: false },
                });
            }

            // Update the fiscal year
            const fiscalYear = await prisma.fiscalYear.update({
                where: { id: params.id },
                data: validatedData,
            });

            return NextResponse.json(fiscalYear);
        } catch (error: any) {
            // Handle case where fiscal year doesn't exist
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { message: "Fiscal year not found" },
                    { status: 404 }
                );
            }

            // Handle case where table doesn't exist yet
            if (error.message?.includes('does not exist')) {
                return NextResponse.json(
                    { message: "Financial tables not yet created. Run database migrations first." },
                    { status: 503 }
                );
            }

            throw error; // Re-throw if it's not the expected error
        }
    } catch (error) {
        console.error("Error updating fiscal year:", error);

        // Handle validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Validation error", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Failed to update fiscal year" },
            { status: 500 }
        );
    }
}

// DELETE handler to delete a fiscal year
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Only allow CAPTAIN role to delete fiscal years (high-level operation)
        if (!["CAPTAIN", "SUPER_ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        try {
            // Check if fiscal year has any associated budgets
            const budgetCount = await prisma.budget.count({
                where: { fiscalYearId: params.id },
            });

            if (budgetCount > 0) {
                return NextResponse.json(
                    {
                        message: "Cannot delete fiscal year with associated budgets",
                        budgetCount
                    },
                    { status: 409 }
                );
            }

            // Check if fiscal year has any associated transactions
            const transactionCount = await prisma.transaction.count({
                where: { fiscalYearId: params.id },
            });

            if (transactionCount > 0) {
                return NextResponse.json(
                    {
                        message: "Cannot delete fiscal year with associated transactions",
                        transactionCount
                    },
                    { status: 409 }
                );
            }

            // Delete the fiscal year
            await prisma.fiscalYear.delete({
                where: { id: params.id },
            });

            return NextResponse.json(
                { message: "Fiscal year deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            // Handle case where fiscal year doesn't exist
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { message: "Fiscal year not found" },
                    { status: 404 }
                );
            }

            // Handle case where table doesn't exist yet
            if (error.message?.includes('does not exist')) {
                return NextResponse.json(
                    { message: "Financial tables not yet created. Run database migrations first." },
                    { status: 503 }
                );
            }

            throw error; // Re-throw if it's not the expected error
        }
    } catch (error) {
        console.error("Error deleting fiscal year:", error);
        return NextResponse.json(
            { message: "Failed to delete fiscal year" },
            { status: 500 }
        );
    }
} 