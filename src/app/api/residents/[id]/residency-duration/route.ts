import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { differenceInMonths } from "date-fns";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const resident = await prisma.resident.findUnique({
            where: {
                id: params.id,
            },
            select: {
                createdAt: true,
            },
        });

        if (!resident) {
            return NextResponse.json(
                { error: "Resident not found" },
                { status: 404 }
            );
        }

        const residencyMonths = differenceInMonths(new Date(), resident.createdAt);

        return NextResponse.json({ residencyMonths });
    } catch (error) {
        console.error("Error fetching residency duration:", error);
        return NextResponse.json(
            { error: "Failed to fetch residency duration" },
            { status: 500 }
        );
    }
} 