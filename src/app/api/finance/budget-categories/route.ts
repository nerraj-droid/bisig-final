import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasFinancialPermission } from "@/lib/permissions";

// Schema for creating a budget category
const budgetCategorySchema = z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    parentId: z.number().optional().nullable(),
});

// GET handler to fetch all budget categories
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const parentId = searchParams.get("parentId");
        const includeChildren = searchParams.get("includeChildren") === "true";

        let whereClause = {};

        if (parentId) {
            whereClause = { parentId: parseInt(parentId) };
        } else if (parentId === "null") {
            whereClause = { parentId: null };
        }

        const categories = await prisma.budgetCategory.findMany({
            where: whereClause,
            include: includeChildren ? {
                children: true
            } : undefined,
            orderBy: { code: "asc" }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching budget categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch budget categories" },
            { status: 500 }
        );
    }
}

// POST handler to create a new budget category
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user has permission to create budget
        const hasPermission = await hasFinancialPermission(session.user.id, "canCreateBudget");

        if (!hasPermission) {
            return NextResponse.json(
                { error: "You don't have permission to create budget categories" },
                { status: 403 }
            );
        }

        const data = await req.json();

        const validatedData = budgetCategorySchema.parse(data);

        // Check if code already exists
        const existingCategory = await prisma.budgetCategory.findUnique({
            where: { code: validatedData.code }
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: "Budget category with this code already exists" },
                { status: 400 }
            );
        }

        // Create the budget category
        const createData = {
            code: validatedData.code,
            name: validatedData.name,
            description: validatedData.description
        };

        // Only add parentId if it's provided
        if (validatedData.parentId !== undefined && validatedData.parentId !== null) {
            Object.assign(createData, { parentId: validatedData.parentId });
        }

        const category = await prisma.budgetCategory.create({
            data: createData
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error creating budget category:", error);
        return NextResponse.json(
            { error: "Failed to create budget category" },
            { status: 500 }
        );
    }
} 