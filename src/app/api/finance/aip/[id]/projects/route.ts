import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/finance/aip/:id/projects - List AIP projects
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role permissions
        const allowedRoles = ["TREASURER", "CAPTAIN", "SUPER_ADMIN"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = params;

        // Verify AIP exists
        const aip = await prisma.annualInvestmentProgram.findUnique({
            where: { id },
        });

        if (!aip) {
            return NextResponse.json(
                { error: "AIP record not found" },
                { status: 404 }
            );
        }

        // Fetch projects for this AIP
        const projects = await prisma.aIPProject.findMany({
            where: { aipId: id },
            include: {
                budgetCategory: true,
                milestones: {
                    orderBy: {
                        dueDate: "asc",
                    },
                },
                expenses: {
                    include: {
                        transaction: true,
                    },
                    orderBy: {
                        date: "desc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching AIP projects:", error);
        return NextResponse.json(
            { error: "Failed to fetch AIP projects" },
            { status: 500 }
        );
    }
}

// POST /api/finance/aip/:id/projects - Add project to AIP
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role permissions
        const allowedRoles = ["TREASURER", "CAPTAIN", "SUPER_ADMIN"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();

        // Verify AIP exists and is in editable state
        const aip = await prisma.annualInvestmentProgram.findUnique({
            where: { id },
        });

        if (!aip) {
            return NextResponse.json(
                { error: "AIP record not found" },
                { status: 404 }
            );
        }

        // Only allow adding projects to DRAFT or SUBMITTED AIP
        if (!["DRAFT", "SUBMITTED"].includes(aip.status)) {
            return NextResponse.json(
                { error: "Cannot add projects to AIP in current status" },
                { status: 400 }
            );
        }

        // Validate required fields
        const requiredFields = [
            "projectCode",
            "title",
            "description",
            "sector",
            "startDate",
            "endDate",
            "totalCost",
        ];

        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Validate dates
        const startDate = new Date(body.startDate);
        const endDate = new Date(body.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            );
        }

        if (endDate <= startDate) {
            return NextResponse.json(
                { error: "End date must be after start date" },
                { status: 400 }
            );
        }

        // Validate budget category if provided
        if (body.budgetCategoryId) {
            const category = await prisma.budgetCategory.findUnique({
                where: { id: body.budgetCategoryId },
            });

            if (!category) {
                return NextResponse.json(
                    { error: "Budget category not found" },
                    { status: 404 }
                );
            }
        }

        // Create the project
        const project = await prisma.aIPProject.create({
            data: {
                aipId: id,
                projectCode: body.projectCode,
                title: body.title,
                description: body.description,
                sector: body.sector,
                location: body.location,
                expectedBeneficiaries: body.expectedBeneficiaries,
                startDate,
                endDate,
                totalCost: parseFloat(body.totalCost),
                budgetCategoryId: body.budgetCategoryId || null,
                fundSource: body.fundSource,
                status: "PLANNED", // Default status
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Error creating AIP project:", error);
        return NextResponse.json(
            { error: "Failed to create AIP project" },
            { status: 500 }
        );
    }
} 