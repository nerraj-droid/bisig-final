import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Schema for creating a fiscal year
const FiscalYearSchema = z.object({
    year: z.string().min(5).max(10), // e.g. "2023-2024"
    startDate: z.string().transform((date) => new Date(date)),
    endDate: z.string().transform((date) => new Date(date)),
    isActive: z.boolean().optional().default(false),
});

// GET handler to fetch all fiscal years
export async function GET(req: NextRequest) {
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

        // Note: Database migrations need to be run before these models are available
        // This endpoint will throw errors until migrations are completed
        try {
            // Extract query parameters
            const searchParams = req.nextUrl.searchParams;
            const isActive = searchParams.get("isActive");

            // Build the filter based on query parameters
            const filter: any = {};
            if (isActive !== null) {
                filter.isActive = isActive === "true";
            }

            // Fetch fiscal years from database - this will fail until migrations are run
            const fiscalYears = await prisma.fiscalYear.findMany({
                where: filter,
                orderBy: { startDate: "desc" },
            });

            return NextResponse.json(fiscalYears);
        } catch (e) {
            // Handle case where table doesn't exist yet
            if (e instanceof Error && e.message?.includes('does not exist')) {
                return NextResponse.json(
                    { message: "Financial tables not yet created. Run database migrations first." },
                    { status: 503 }
                );
            }
            throw e; // Re-throw if it's not the expected error
        }
    } catch (error) {
        console.error("Error fetching fiscal years:", error);
        return NextResponse.json(
            { message: "Failed to fetch fiscal years" },
            { status: 500 }
        );
    }
}

// POST handler to create a new fiscal year
export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Only allow TREASURER and CAPTAIN roles to create fiscal years
        if (!["TREASURER", "CAPTAIN", "SUPER_ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Parse and validate request body
        const body = await req.json();
        const validatedData = FiscalYearSchema.parse(body);

        try {
            // If setting this fiscal year as active, deactivate all others
            if (validatedData.isActive) {
                await prisma.fiscalYear.updateMany({
                    where: { isActive: true },
                    data: { isActive: false },
                });
            }

            // Create the new fiscal year
            const fiscalYear = await prisma.fiscalYear.create({
                data: validatedData,
            });

            return NextResponse.json(fiscalYear, { status: 201 });
        } catch (e) {
            // Handle case where table doesn't exist yet
            if (e instanceof Error && e.message?.includes('does not exist')) {
                return NextResponse.json(
                    { message: "Financial tables not yet created. Run database migrations first." },
                    { status: 503 }
                );
            }
            throw e; // Re-throw if it's not the expected error
        }
    } catch (error) {
        console.error("Error creating fiscal year:", error);

        // Handle validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Validation error", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Failed to create fiscal year" },
            { status: 500 }
        );
    }
} 