import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get pending certificates count
        const pendingCertificates = await prisma.certificate.count({
            where: {
                status: "PENDING"
            }
        });

        // Get recent blotter cases (last 7 days) that need attention
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentBlotterRecords = await prisma.blotterCase.count({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                },
                status: {
                    in: ["FILED", "DOCKETED", "SUMMONED", "MEDIATION", "CONCILIATION", "PENDING", "ONGOING"]
                }
            }
        });

        // Get new residents (last 7 days)
        const newResidents = await prisma.resident.count({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
            }
        });

        // Get pending certificate management items (certificates that need approval)
        const certificatesNeedingApproval = await prisma.certificate.count({
            where: {
                status: "APPROVED" // Ready to be released
            }
        });

        return NextResponse.json({
            certificates: pendingCertificates,
            blotter: recentBlotterRecords,
            residents: newResidents,
            certificateManagement: certificatesNeedingApproval,
            total: pendingCertificates + recentBlotterRecords + newResidents
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
} 