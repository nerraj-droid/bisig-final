import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BlotterCaseStatus } from "@/lib/enums";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const { filingFeePaid } = await request.json();

        if (typeof filingFeePaid !== 'boolean') {
            return NextResponse.json(
                { error: "Invalid request, filingFeePaid must be a boolean" },
                { status: 400 }
            );
        }

        // Get the current case
        const currentCase = await (prisma as any).blotterCase.findUnique({
            where: { id }
        });

        if (!currentCase) {
            return NextResponse.json(
                { error: "Case not found" },
                { status: 404 }
            );
        }

        // Determine if we should update the status based on current status
        const shouldUpdateStatus = currentCase.status === BlotterCaseStatus.FILED ||
            currentCase.status === "FILED";

        // Update the blotter case
        const updatedCase = await (prisma as any).blotterCase.update({
            where: { id },
            data: {
                filingFeePaid,
                // Only update status if the case is in FILED status
                ...(shouldUpdateStatus && filingFeePaid && {
                    status: BlotterCaseStatus.DOCKETED,
                    docketDate: new Date()
                }),
                statusUpdates: {
                    create: {
                        status: shouldUpdateStatus ? BlotterCaseStatus.DOCKETED : currentCase.status,
                        notes: shouldUpdateStatus
                            ? "Filing fee has been paid. Case is now docketed."
                            : "Filing fee has been marked as paid. Case status remains unchanged.",
                        updatedById: session.user.id
                    }
                }
            },
        });

        return NextResponse.json(updatedCase);
    } catch (error: any) {
        console.error("Error updating filing fee status:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update filing fee status" },
            { status: 500 }
        );
    }
} 