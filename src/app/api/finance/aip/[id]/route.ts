import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/finance/aip/:id - Get AIP details
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

        // Fetch AIP with related data
        const aip = await prisma.annualInvestmentProgram.findUnique({
            where: { id },
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
                    include: {
                        budgetCategory: true,
                        milestones: true,
                        expenses: {
                            include: {
                                transaction: true,
                            },
                        },
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
                },
            },
        });

        if (!aip) {
            return NextResponse.json(
                { error: "AIP record not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(aip);
    } catch (error) {
        console.error("Error fetching AIP details:", error);
        return NextResponse.json(
            { error: "Failed to fetch AIP details" },
            { status: 500 }
        );
    }
}

// PUT /api/finance/aip/:id - Update AIP
export async function PUT(
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

        // Check if AIP exists
        const existingAIP = await prisma.annualInvestmentProgram.findUnique({
            where: { id },
        });

        if (!existingAIP) {
            return NextResponse.json(
                { error: "AIP record not found" },
                { status: 404 }
            );
        }

        // Only allow updates to DRAFT status AIPs unless it's a status change
        if (existingAIP.status !== "DRAFT" && !body.status) {
            return NextResponse.json(
                { error: "Cannot update AIP that is not in DRAFT status" },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: any = {};

        if (body.title) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.totalAmount) updateData.totalAmount = parseFloat(body.totalAmount);

        // Handle status changes
        if (body.status && body.status !== existingAIP.status) {
            // Validate status transition
            const validTransitions: { [key: string]: string[] } = {
                DRAFT: ["SUBMITTED"],
                SUBMITTED: ["APPROVED", "REJECTED", "DRAFT"],
                APPROVED: ["IMPLEMENTED"],
                REJECTED: ["DRAFT"],
                IMPLEMENTED: ["COMPLETED"],
                COMPLETED: [],
            };

            if (!validTransitions[existingAIP.status].includes(body.status)) {
                return NextResponse.json(
                    {
                        error: `Invalid status transition from ${existingAIP.status} to ${body.status}`
                    },
                    { status: 400 }
                );
            }

            updateData.status = body.status;

            // Set approval data if status is changing to APPROVED
            if (body.status === "APPROVED") {
                updateData.approvedById = session.user.id;
                updateData.approvedDate = new Date();
            }
        }

        // Update the AIP record
        const updatedAIP = await prisma.annualInvestmentProgram.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedAIP);
    } catch (error) {
        console.error("Error updating AIP:", error);
        return NextResponse.json(
            { error: "Failed to update AIP" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/aip/:id - Delete AIP
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

        // Only SUPER_ADMIN and CAPTAIN can delete AIPs
        const allowedRoles = ["SUPER_ADMIN", "CAPTAIN"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = params;

        // Check if AIP exists
        const existingAIP = await prisma.annualInvestmentProgram.findUnique({
            where: { id },
            include: {
                projects: {
                    include: {
                        expenses: true,
                    },
                },
            },
        });

        if (!existingAIP) {
            return NextResponse.json(
                { error: "AIP record not found" },
                { status: 404 }
            );
        }

        // Only allow deletion of AIPs in DRAFT or REJECTED status
        if (!["DRAFT", "REJECTED"].includes(existingAIP.status)) {
            return NextResponse.json(
                { error: "Only DRAFT or REJECTED AIPs can be deleted" },
                { status: 400 }
            );
        }

        // Check if there are any linked expenses with transactions
        const hasTransactionLinks = existingAIP.projects.some(project =>
            project.expenses.some(expense => expense.transactionId)
        );

        if (hasTransactionLinks) {
            return NextResponse.json(
                { error: "Cannot delete AIP with linked financial transactions" },
                { status: 400 }
            );
        }

        // Delete the AIP and all related records (cascading delete)
        await prisma.annualInvestmentProgram.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting AIP:", error);
        return NextResponse.json(
            { error: "Failed to delete AIP" },
            { status: 500 }
        );
    }
} 