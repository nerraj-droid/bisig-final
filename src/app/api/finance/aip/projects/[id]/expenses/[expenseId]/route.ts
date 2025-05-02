import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for updating an expense
const updateExpenseSchema = z.object({
    amount: z.number().positive({ message: "Amount must be greater than 0" }).optional(),
    description: z.string().min(1, { message: "Description is required" }).optional(),
    date: z.string().optional().refine(
        (date) => !date || !isNaN(new Date(date).getTime()),
        { message: "Invalid date format" }
    ),
    reference: z.string().optional().nullable(),
    transactionId: z.string().optional().nullable(),
});

// GET /api/finance/aip/projects/:id/expenses/:expenseId - Get expense
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string; expenseId: string } }
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

        const { expenseId } = params;

        // Fetch the expense
        const expense = await prisma.aIPExpense.findUnique({
            where: { id: expenseId },
            include: {
                transaction: {
                    select: {
                        id: true,
                        referenceNumber: true,
                        type: true,
                        amount: true,
                        description: true,
                    },
                },
            },
        });

        if (!expense) {
            return NextResponse.json(
                { error: "Expense not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(expense);
    } catch (error) {
        console.error("Error fetching expense:", error);
        return NextResponse.json(
            { error: "Failed to fetch expense" },
            { status: 500 }
        );
    }
}

// PATCH /api/finance/aip/projects/:id/expenses/:expenseId - Update expense
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string; expenseId: string } }
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

        const { id, expenseId } = params;
        const body = await req.json();

        // Validate request body
        const validationResult = updateExpenseSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map((err) => ({
                path: err.path.join("."),
                message: err.message,
            }));
            return NextResponse.json({ errors }, { status: 400 });
        }

        // Verify expense exists and belongs to the project
        const expense = await prisma.aIPExpense.findFirst({
            where: {
                id: expenseId,
                projectId: id,
            },
            include: {
                project: {
                    include: {
                        aip: true,
                    },
                },
            },
        });

        if (!expense) {
            return NextResponse.json(
                { error: "Expense not found or does not belong to this project" },
                { status: 404 }
            );
        }

        // Only allow updating if project is in appropriate state
        if (!["PLANNED", "ONGOING"].includes(expense.project.status)) {
            return NextResponse.json(
                { error: "Cannot update expense for a completed or cancelled project" },
                { status: 400 }
            );
        }

        // Verify transaction if changed
        if (body.transactionId && body.transactionId !== expense.transactionId) {
            const transaction = await prisma.transaction.findUnique({
                where: { id: body.transactionId },
            });

            if (!transaction) {
                return NextResponse.json(
                    { error: "Transaction not found" },
                    { status: 404 }
                );
            }

            if (transaction.type !== "EXPENSE") {
                return NextResponse.json(
                    { error: "Transaction must be an expense type" },
                    { status: 400 }
                );
            }
        }

        // Prepare update data
        const updateData: any = {};

        if (body.amount !== undefined) updateData.amount = body.amount;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.date) updateData.date = new Date(body.date);
        if (body.reference !== undefined) updateData.reference = body.reference;
        if (body.transactionId !== undefined) updateData.transactionId = body.transactionId;

        // Update the expense
        const updatedExpense = await prisma.aIPExpense.update({
            where: { id: expenseId },
            data: updateData,
            include: {
                transaction: {
                    select: {
                        id: true,
                        referenceNumber: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedExpense);
    } catch (error) {
        console.error("Error updating expense:", error);
        return NextResponse.json(
            { error: "Failed to update expense" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/aip/projects/:id/expenses/:expenseId - Delete expense
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; expenseId: string } }
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

        const { id, expenseId } = params;

        // Verify expense exists and belongs to the project
        const expense = await prisma.aIPExpense.findFirst({
            where: {
                id: expenseId,
                projectId: id,
            },
            include: {
                project: {
                    include: {
                        aip: true,
                    },
                },
            },
        });

        if (!expense) {
            return NextResponse.json(
                { error: "Expense not found or does not belong to this project" },
                { status: 404 }
            );
        }

        // Only allow deleting if project is in appropriate state
        if (!["PLANNED", "ONGOING"].includes(expense.project.status)) {
            return NextResponse.json(
                { error: "Cannot delete expense for a completed or cancelled project" },
                { status: 400 }
            );
        }

        // Delete the expense
        await prisma.aIPExpense.delete({
            where: { id: expenseId },
        });

        return NextResponse.json(
            { message: "Expense deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting expense:", error);
        return NextResponse.json(
            { error: "Failed to delete expense" },
            { status: 500 }
        );
    }
} 