import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check permissions
        const allowedRoles = ["ADMIN", "SUPER_ADMIN", "CAPTAIN", "TREASURER", "SECRETARY"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get fiscal year ID from query parameters
        const searchParams = req.nextUrl.searchParams;
        const fiscalYearId = searchParams.get("fiscalYearId");

        if (!fiscalYearId) {
            return NextResponse.json(
                { error: "Fiscal year ID is required" },
                { status: 400 }
            );
        }

        // Fetch the fiscal year to ensure it exists
        const fiscalYear = await prisma.fiscalYear.findUnique({
            where: {
                id: fiscalYearId
            }
        });

        if (!fiscalYear) {
            return NextResponse.json(
                { error: "Fiscal year not found" },
                { status: 404 }
            );
        }

        // For now, return mock data since we don't know the exact schema
        // This can be updated later when we have more information about the actual schema
        const mockBudgetData = {
            totalBudget: 1000000, // ₱1,000,000
            allocatedBudget: 750000, // ₱750,000
            spentBudget: 250000, // ₱250,000
            allocationPercentage: 75,
            utilizationPercentage: 25
        };

        return NextResponse.json(mockBudgetData);
    } catch (error) {
        console.error("Failed to fetch budget summary:", error);
        return NextResponse.json(
            { error: "Failed to fetch budget summary" },
            { status: 500 }
        );
    }
}