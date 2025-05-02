import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for creating an expense
const createExpenseSchema = z.object({
    amount: z.number().positive({ message: "Amount must be greater than 0" }),
    description: z.string().min(1, { message: "Description is required" }),
    date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Invalid date format",
    }),
    reference: z.string().optional(),
    transactionId: z.string().optional(),
});

// GET /api/finance/aip/projects/:id/expenses - List expenses
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

        // Verify project exists
        const project = await prisma.aIPProject.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        // Fetch expenses for this project
        const expenses = await prisma.aIPExpense.findMany({
            where: { projectId: id },
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
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return NextResponse.json(
            { error: "Failed to fetch expenses" },
            { status: 500 }
        );
    }
}

// POST /api/finance/aip/projects/:id/expenses - Add expense
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

        // Validate request body
        const validationResult = createExpenseSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map((err) => ({
                path: err.path.join("."),
                message: err.message,
            }));
            return NextResponse.json({ errors }, { status: 400 });
        }

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

        // Only allow adding expenses if project is in appropriate state
        if (!["PLANNED", "ONGOING"].includes(project.status)) {
            return NextResponse.json(
                { error: "Cannot add expenses to a completed or cancelled project" },
                { status: 400 }
            );
        }

        // Verify transaction if provided
        if (body.transactionId) {
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

        // Create the expense
        const expense = await prisma.aIPExpense.create({
            data: {
                projectId: id,
                amount: body.amount,
                description: body.description,
                date: new Date(body.date),
                reference: body.reference || null,
                transactionId: body.transactionId || null,
            },
        });

        // Update project status to ONGOING if it's still PLANNED
        if (project.status === "PLANNED") {
            await prisma.aIPProject.update({
                where: { id },
                data: { status: "ONGOING" },
            });
        }

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        console.error("Error creating expense:", error);
        return NextResponse.json(
            { error: "Failed to create expense" },
            { status: 500 }
        );
    }
} 