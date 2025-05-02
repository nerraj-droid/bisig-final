import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/finance/aip/projects/:id - Get project details
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

        // Fetch project with related data
        const project = await prisma.aIPProject.findUnique({
            where: { id },
            include: {
                aip: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        fiscalYear: {
                            select: {
                                id: true,
                                year: true,
                            },
                        },
                    },
                },
                budgetCategory: true,
                milestones: {
                    orderBy: {
                        dueDate: "asc",
                    },
                },
                expenses: {
                    include: {
                        transaction: {
                            select: {
                                id: true,
                                referenceNumber: true,
                            },
                        },
                    },
                    orderBy: {
                        date: "desc",
                    },
                },
                attachments: {
                    include: {
                        uploadedBy: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        uploadedAt: "desc",
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error fetching project details:", error);
        return NextResponse.json(
            { error: "Failed to fetch project details" },
            { status: 500 }
        );
    }
}

// PATCH /api/finance/aip/projects/:id - Update project
export async function PATCH(
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

        // Verify project exists
        const project = await prisma.aIPProject.findUnique({
            where: { id },
            include: {
                aip: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        // Only allow updating projects if AIP is in editable state
        if (!["DRAFT", "SUBMITTED", "APPROVED"].includes(project.aip.status)) {
            return NextResponse.json(
                { error: "Cannot update project when AIP is in current status" },
                { status: 400 }
            );
        }

        // Validate dates if provided
        let startDate;
        let endDate;

        if (body.startDate) {
            startDate = new Date(body.startDate);
            if (isNaN(startDate.getTime())) {
                return NextResponse.json(
                    { error: "Invalid start date format" },
                    { status: 400 }
                );
            }
        }

        if (body.endDate) {
            endDate = new Date(body.endDate);
            if (isNaN(endDate.getTime())) {
                return NextResponse.json(
                    { error: "Invalid end date format" },
                    { status: 400 }
                );
            }
        }

        // If both dates are provided, ensure end date is after start date
        if (startDate && endDate && endDate <= startDate) {
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

        // Prepare update data
        const updateData: any = {};

        // Include fields that are present in the request body
        const allowedFields = [
            "title",
            "projectCode",
            "description",
            "sector",
            "location",
            "expectedBeneficiaries",
            "totalCost",
            "budgetCategoryId",
            "status",
            "progress",
            "fundSource",
        ];

        for (const field of allowedFields) {
            if (field in body) {
                updateData[field] = body[field];
            }
        }

        // Add dates if provided
        if (startDate) updateData.startDate = startDate;
        if (endDate) updateData.endDate = endDate;

        // Convert totalCost to float if present
        if ('totalCost' in updateData) {
            updateData.totalCost = parseFloat(updateData.totalCost);
        }

        // Update the project
        const updatedProject = await prisma.aIPProject.update({
            where: { id },
            data: updateData,
            include: {
                aip: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                budgetCategory: true,
            },
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/aip/projects/:id - Delete project
export async function DELETE(
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

        // Verify project exists
        const project = await prisma.aIPProject.findUnique({
            where: { id },
            include: {
                aip: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        // Only allow deleting projects if AIP is in editable state
        if (!["DRAFT", "SUBMITTED", "APPROVED"].includes(project.aip.status)) {
            return NextResponse.json(
                { error: "Cannot delete project when AIP is in current status" },
                { status: 400 }
            );
        }

        // Delete the project - this will cascade delete milestones, expenses, and attachments
        await prisma.aIPProject.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Project deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 }
        );
    }
} 