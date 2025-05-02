import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/finance/budgets/:id - Get a single budget
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

        // Fetch budget
        const budget = await prisma.budget.findUnique({
            where: { id },
            include: {
                category: true,
                fiscalYear: {
                    select: {
                        id: true,
                        year: true,
                    },
                },
            },
        });

        if (!budget) {
            return NextResponse.json(
                { error: "Budget not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(budget);
    } catch (error) {
        console.error("Error fetching budget:", error);
        return NextResponse.json(
            { error: "Failed to fetch budget" },
            { status: 500 }
        );
    }
}

// PATCH /api/finance/budgets/:id - Update a budget
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

        // Verify budget exists
        const budget = await prisma.budget.findUnique({
            where: { id },
        });

        if (!budget) {
            return NextResponse.json(
                { error: "Budget not found" },
                { status: 404 }
            );
        }

        // Update budget
        const updatedBudget = await prisma.budget.update({
            where: { id },
            data: {
                amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
                description: body.description !== undefined ? body.description : undefined,
            },
            include: {
                category: true,
                fiscalYear: {
                    select: {
                        id: true,
                        year: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedBudget);
    } catch (error) {
        console.error("Error updating budget:", error);
        return NextResponse.json(
            { error: "Failed to update budget" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/budgets/:id - Delete a budget
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

        // Verify budget exists
        const budget = await prisma.budget.findUnique({
            where: { id },
        });

        if (!budget) {
            return NextResponse.json(
                { error: "Budget not found" },
                { status: 404 }
            );
        }

        // Check if there are transactions linked to this budget
        const transactions = await prisma.transaction.findMany({
            where: { budgetId: id },
            take: 1,
        });

        if (transactions.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete budget with linked transactions" },
                { status: 400 }
            );
        }

        // Delete budget
        await prisma.budget.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Budget deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting budget:", error);
        return NextResponse.json(
            { error: "Failed to delete budget" },
            { status: 500 }
        );
    }
} 