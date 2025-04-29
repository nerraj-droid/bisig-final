import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search query from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    
    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Search residents by name or other identifiers
    const residents = await prisma.resident.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { middleName: { contains: query, mode: "insensitive" } },
          { contactNo: { contains: query } },
        ],
      },
      take: 10, // Limit results
    });

    return NextResponse.json({ residents });
  } catch (error) {
    console.error("Error searching residents:", error);
    return NextResponse.json(
      { error: "Failed to search residents" },
      { status: 500 }
    );
  }
} 