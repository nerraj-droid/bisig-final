import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/finance/budgets - Get budgets with optional filters
export async function GET(req: NextRequest) {
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

        // Get query parameters
        const searchParams = req.nextUrl.searchParams;
        const fiscalYearId = searchParams.get("fiscalYearId");

        // Build query
        const where: any = {};

        // Filter by fiscal year if provided
        if (fiscalYearId) {
            where.fiscalYearId = fiscalYearId;
        }

        // Fetch budgets
        const budgets = await prisma.budget.findMany({
            where,
            include: {
                category: true,
                fiscalYear: {
                    select: {
                        id: true,
                        year: true,
                    },
                },
            },
            orderBy: {
                category: {
                    code: "asc",
                },
            },
        });

        return NextResponse.json(budgets);
    } catch (error) {
        console.error("Error fetching budgets:", error);
        return NextResponse.json(
            { error: "Failed to fetch budgets" },
            { status: 500 }
        );
    }
}

// POST /api/finance/budgets - Create a new budget
export async function POST(req: NextRequest) {
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

        // Get request body
        const body = await req.json();

        // Validate required fields
        if (!body.fiscalYearId || !body.categoryId || body.amount === undefined) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify fiscal year exists
        const fiscalYear = await prisma.fiscalYear.findUnique({
            where: { id: body.fiscalYearId },
        });

        if (!fiscalYear) {
            return NextResponse.json(
                { error: "Fiscal year not found" },
                { status: 404 }
            );
        }

        // Verify category exists
        const category = await prisma.budgetCategory.findUnique({
            where: { id: body.categoryId },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Budget category not found" },
                { status: 404 }
            );
        }

        // Check if budget already exists for this category and fiscal year
        const existingBudget = await prisma.budget.findFirst({
            where: {
                fiscalYearId: body.fiscalYearId,
                categoryId: body.categoryId,
            },
        });

        if (existingBudget) {
            return NextResponse.json(
                { error: "Budget already exists for this category and fiscal year" },
                { status: 400 }
            );
        }

        // Create budget
        const budget = await prisma.budget.create({
            data: {
                fiscalYearId: body.fiscalYearId,
                categoryId: body.categoryId,
                amount: parseFloat(body.amount),
                description: body.description || null,
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

        return NextResponse.json(budget, { status: 201 });
    } catch (error) {
        console.error("Error creating budget:", error);
        return NextResponse.json(
            { error: "Failed to create budget" },
            { status: 500 }
        );
    }
} 