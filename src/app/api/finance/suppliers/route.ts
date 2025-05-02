import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for creating a supplier
const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contactPerson: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email("Invalid email").optional().nullable(),
    address: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
});

// GET /api/finance/suppliers - Get all suppliers
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

        // Get query parameters for filtering
        const searchParams = req.nextUrl.searchParams;
        const search = searchParams.get("search");

        // Build query
        const where: any = {};

        // Filter by search term if provided
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { contactPerson: { contains: search, mode: "insensitive" } }
            ];
        }

        // Fetch suppliers
        const suppliers = await prisma.supplier.findMany({
            where,
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(suppliers);
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return NextResponse.json(
            { error: "Failed to fetch suppliers" },
            { status: 500 }
        );
    }
}

// POST /api/finance/suppliers - Create a new supplier
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

        // Validate request data
        const validationResult = supplierSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation error",
                    details: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        // Check if supplier with the same name already exists
        const existingSupplier = await prisma.supplier.findFirst({
            where: { name: body.name },
        });

        if (existingSupplier) {
            return NextResponse.json(
                { error: "A supplier with this name already exists" },
                { status: 400 }
            );
        }

        // Create the supplier
        const supplier = await prisma.supplier.create({
            data: {
                name: body.name,
                contactPerson: body.contactPerson,
                phone: body.phone,
                email: body.email,
                address: body.address,
                taxId: body.taxId,
            },
        });

        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        console.error("Error creating supplier:", error);
        return NextResponse.json(
            { error: "Failed to create supplier" },
            { status: 500 }
        );
    }
} 