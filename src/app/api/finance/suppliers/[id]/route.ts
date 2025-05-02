import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for updating a supplier
const updateSupplierSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    contactPerson: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email("Invalid email").optional().nullable(),
    address: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
});

// GET /api/finance/suppliers/:id - Get a specific supplier
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

        // Fetch supplier
        const supplier = await prisma.supplier.findUnique({
            where: { id },
        });

        if (!supplier) {
            return NextResponse.json(
                { error: "Supplier not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(supplier);
    } catch (error) {
        console.error("Error fetching supplier:", error);
        return NextResponse.json(
            { error: "Failed to fetch supplier" },
            { status: 500 }
        );
    }
}

// PATCH /api/finance/suppliers/:id - Update a supplier
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

        // Validate request data
        const validationResult = updateSupplierSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation error",
                    details: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        // Check if supplier exists
        const supplier = await prisma.supplier.findUnique({
            where: { id },
        });

        if (!supplier) {
            return NextResponse.json(
                { error: "Supplier not found" },
                { status: 404 }
            );
        }

        // If name is being changed, check if it conflicts with an existing supplier
        if (body.name && body.name !== supplier.name) {
            const existingSupplier = await prisma.supplier.findFirst({
                where: {
                    name: body.name,
                    id: { not: id }
                },
            });

            if (existingSupplier) {
                return NextResponse.json(
                    { error: "A supplier with this name already exists" },
                    { status: 400 }
                );
            }
        }

        // Update the supplier
        const updatedSupplier = await prisma.supplier.update({
            where: { id },
            data: {
                name: body.name,
                contactPerson: body.contactPerson,
                phone: body.phone,
                email: body.email,
                address: body.address,
                taxId: body.taxId,
            },
        });

        return NextResponse.json(updatedSupplier);
    } catch (error) {
        console.error("Error updating supplier:", error);
        return NextResponse.json(
            { error: "Failed to update supplier" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/suppliers/:id - Delete a supplier
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

        // Check if supplier exists
        const supplier = await prisma.supplier.findUnique({
            where: { id },
        });

        if (!supplier) {
            return NextResponse.json(
                { error: "Supplier not found" },
                { status: 404 }
            );
        }

        // Check if supplier is linked to any transactions
        const transactions = await prisma.transaction.findMany({
            where: { supplierId: id },
            take: 1,
        });

        if (transactions.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete supplier that is linked to transactions" },
                { status: 400 }
            );
        }

        // Delete the supplier
        await prisma.supplier.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Supplier deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting supplier:", error);
        return NextResponse.json(
            { error: "Failed to delete supplier" },
            { status: 500 }
        );
    }
} 