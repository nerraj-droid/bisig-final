import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/finance/aip - List all AIPs
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role permissions (only certain roles can view AIP data)
        const allowedRoles = ["TREASURER", "CAPTAIN", "SUPER_ADMIN"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Parse query parameters
        const url = new URL(req.url);
        const fiscalYearId = url.searchParams.get("fiscalYearId");
        const status = url.searchParams.get("status");

        // Build the query filter
        const filter: any = {};

        if (fiscalYearId) {
            filter.fiscalYearId = fiscalYearId;
        }

        if (status) {
            filter.status = status;
        }

        // Fetch AIP records with relations
        const aips = await prisma.annualInvestmentProgram.findMany({
            where: filter,
            include: {
                fiscalYear: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                approvedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                projects: {
                    select: {
                        id: true,
                        title: true,
                        totalCost: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(aips);
    } catch (error) {
        console.error("Error fetching AIP data:", error);
        return NextResponse.json(
            { error: "Failed to fetch AIP data" },
            { status: 500 }
        );
    }
}

// POST /api/finance/aip - Create a new AIP
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role permissions (only certain roles can create AIP)
        const allowedRoles = ["TREASURER", "CAPTAIN", "SUPER_ADMIN"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        // Validate required fields
        const requiredFields = ["fiscalYearId", "title", "totalAmount"];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Validate fiscal year exists
        const fiscalYear = await prisma.fiscalYear.findUnique({
            where: { id: body.fiscalYearId },
        });

        if (!fiscalYear) {
            return NextResponse.json(
                { error: "Fiscal year not found" },
                { status: 404 }
            );
        }

        // Create the AIP record
        const aip = await prisma.annualInvestmentProgram.create({
            data: {
                fiscalYearId: body.fiscalYearId,
                title: body.title,
                description: body.description,
                totalAmount: parseFloat(body.totalAmount),
                status: "DRAFT", // Default status
                createdById: session.user.id,
            },
        });

        return NextResponse.json(aip, { status: 201 });
    } catch (error) {
        console.error("Error creating AIP:", error);
        return NextResponse.json(
            { error: "Failed to create AIP" },
            { status: 500 }
        );
    }
} 