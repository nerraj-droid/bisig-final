import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasFinancialPermission } from "@/lib/permissions";

// Schema for updating a budget category
const updateBudgetCategorySchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional().nullable(),
    parentId: z.string().optional().nullable(),
});

// GET /api/finance/budget-categories/:id - Get a budget category
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = params.id;

        const category = await prisma.budgetCategory.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Budget category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error fetching budget category:", error);
        return NextResponse.json(
            { error: "Failed to fetch budget category" },
            { status: 500 }
        );
    }
}

// PATCH /api/finance/budget-categories/:id - Update a budget category
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user has permission to update budget
        const hasPermission = await hasFinancialPermission(session.user.id, "canCreateBudget");

        if (!hasPermission) {
            return NextResponse.json(
                { error: "You don't have permission to update budget categories" },
                { status: 403 }
            );
        }

        const id = params.id;
        const data = await req.json();

        // Validate the data
        const validatedData = updateBudgetCategorySchema.parse(data);

        // Check if category exists
        const category = await prisma.budgetCategory.findUnique({
            where: { id },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Budget category not found" },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {};

        if (validatedData.name !== undefined) {
            updateData.name = validatedData.name;
        }

        if (validatedData.description !== undefined) {
            updateData.description = validatedData.description;
        }

        if (validatedData.parentId !== undefined) {
            // If parentId is provided, make sure it's not the category's own ID
            if (validatedData.parentId === id) {
                return NextResponse.json(
                    { error: "A category cannot be its own parent" },
                    { status: 400 }
                );
            }

            // If parentId is provided and not null, verify the parent exists
            if (validatedData.parentId !== null) {
                const parent = await prisma.budgetCategory.findUnique({
                    where: { id: validatedData.parentId },
                });

                if (!parent) {
                    return NextResponse.json(
                        { error: "Parent category not found" },
                        { status: 404 }
                    );
                }
            }

            updateData.parentId = validatedData.parentId;
        }

        // Update the category
        const updatedCategory = await prisma.budgetCategory.update({
            where: { id },
            data: updateData,
            include: {
                parent: true,
            },
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error updating budget category:", error);
        return NextResponse.json(
            { error: "Failed to update budget category" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/budget-categories/:id - Delete a budget category
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user has permission to delete budget
        const hasPermission = await hasFinancialPermission(session.user.id, "canCreateBudget");

        if (!hasPermission) {
            return NextResponse.json(
                { error: "You don't have permission to delete budget categories" },
                { status: 403 }
            );
        }

        const id = params.id;

        // Check if category exists
        const category = await prisma.budgetCategory.findUnique({
            where: { id },
            include: {
                children: true,
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Budget category not found" },
                { status: 404 }
            );
        }

        // Check if category has children
        if (category.children.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete category with sub-categories" },
                { status: 400 }
            );
        }

        // Check if category is used in budgets
        const budgets = await prisma.budget.findMany({
            where: { categoryId: id },
            take: 1,
        });

        if (budgets.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete category that is used in budgets" },
                { status: 400 }
            );
        }

        // Delete the category
        await prisma.budgetCategory.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Budget category deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting budget category:", error);
        return NextResponse.json(
            { error: "Failed to delete budget category" },
            { status: 500 }
        );
    }
} 