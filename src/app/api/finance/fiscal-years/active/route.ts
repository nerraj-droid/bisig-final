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

        // Fetch the active fiscal year
        const activeFiscalYear = await prisma.fiscalYear.findFirst({
            where: {
                isActive: true
            }
        });

        if (!activeFiscalYear) {
            return NextResponse.json(null);
        }

        return NextResponse.json(activeFiscalYear);
    } catch (error) {
        console.error("Failed to fetch active fiscal year:", error);
        return NextResponse.json(
            { error: "Failed to fetch active fiscal year" },
            { status: 500 }
        );
    }
} 