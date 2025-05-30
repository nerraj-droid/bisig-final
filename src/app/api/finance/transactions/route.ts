import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasFinancialPermission, getTransactionAmountLimit } from "@/lib/permissions";

// Schema for creating a transaction
const transactionSchema = z.object({
    type: z.enum(["REVENUE", "EXPENSE", "TRANSFER"], {
        required_error: "Transaction type is required",
    }),
    referenceNumber: z.string().min(1, "Reference number is required"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    amount: z.number().positive("Amount must be positive"),
    description: z.string().min(1, "Description is required"),
    fiscalYearId: z.string().min(1, "Fiscal year is required"),
    budgetId: z.string().min(1, "Budget is required").optional(),
    supplierId: z.string().optional(),
    residentId: z.string().optional(),
    householdId: z.string().optional(),
    status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "VOIDED"], {
        required_error: "Transaction status is required",
    }),
});

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const fiscalYearId = searchParams.get("fiscalYearId");
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "20");
        const page = parseInt(searchParams.get("page") || "1");

        // Build filter based on params
        let whereClause: any = {};

        if (type) {
            whereClause.type = type;
        }

        if (fiscalYearId) {
            whereClause.fiscalYearId = fiscalYearId;
        }

        if (status) {
            whereClause.status = status;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Fetch transactions
        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: {
                fiscalYear: true,
                budget: {
                    include: {
                        category: true,
                    },
                },
                supplier: true,
                resident: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                household: {
                    select: {
                        id: true,
                        houseNo: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
            skip,
            take: limit,
        });

        // Get total count for pagination
        const total = await prisma.transaction.count({
            where: whereClause,
        });

        return NextResponse.json({
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check permission based on transaction type
        const data = await req.json();
        const transactionType = data.type;

        const permissionType = transactionType === "REVENUE"
            ? "canCreateTransaction"
            : "canCreateTransaction";

        const hasPermission = await hasFinancialPermission(
            session.user.id,
            permissionType
        );

        if (!hasPermission) {
            return NextResponse.json(
                { error: `You don't have permission to create ${transactionType.toLowerCase()} transactions` },
                { status: 403 }
            );
        }

        // Check amount limit if applicable
        const amountLimit = await getTransactionAmountLimit(session.user.id);
        if (amountLimit !== null && data.amount > amountLimit) {
            return NextResponse.json(
                { error: `Transaction amount exceeds your limit of ₱${amountLimit.toLocaleString()}` },
                { status: 403 }
            );
        }

        // Since we're accepting numerical form values, convert them to strings for the validation
        if (typeof data.fiscalYearId === 'number') {
            data.fiscalYearId = data.fiscalYearId.toString();
        }
        if (typeof data.budgetId === 'number') {
            data.budgetId = data.budgetId.toString();
        }
        if (typeof data.supplierId === 'number') {
            data.supplierId = data.supplierId.toString();
        }

        // Validate data
        const validatedData = transactionSchema.parse(data);

        // Ensure the reference number is unique
        const existingTransaction = await prisma.transaction.findUnique({
            where: { referenceNumber: validatedData.referenceNumber },
        });

        if (existingTransaction) {
            return NextResponse.json(
                { error: "Transaction with this reference number already exists" },
                { status: 409 }
            );
        }

        // Check if fiscal year exists
        const fiscalYear = await prisma.fiscalYear.findUnique({
            where: { id: validatedData.fiscalYearId },
        });

        if (!fiscalYear) {
            return NextResponse.json(
                { error: "Fiscal year not found" },
                { status: 404 }
            );
        }

        // Check if budget exists if provided
        if (validatedData.budgetId) {
            const budget = await prisma.budget.findUnique({
                where: { id: validatedData.budgetId },
            });

            if (!budget) {
                return NextResponse.json(
                    { error: "Budget not found" },
                    { status: 404 }
                );
            }
        }

        // Prepare data for creation
        const transactionData = {
            ...validatedData,
            date: new Date(validatedData.date),
            createdById: session.user.id,
            // Set approvedById only if status is APPROVED
            approvedById: validatedData.status === "APPROVED" ? session.user.id : null,
        };

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: transactionData,
            include: {
                fiscalYear: true,
                budget: {
                    include: {
                        category: true,
                    },
                },
                supplier: true,
                resident: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                household: {
                    select: {
                        id: true,
                        houseNo: true,
                    },
                },
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
} 