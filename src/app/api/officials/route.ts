import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get council members first
    const councilMembers = await prisma.councilMember.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        name: true,
        position: true
      }
    });

    // Get barangay officials
    const barangayOfficials = await prisma.officials.findFirst({
      select: {
        id: true,
        punongBarangay: true,
        secretary: true,
        treasurer: true
      }
    });

    // Format the officials
    const officials = [
      // Add main officials if they exist
      ...(barangayOfficials?.punongBarangay ? [{ 
        id: `${barangayOfficials.id}-punong`, 
        name: barangayOfficials.punongBarangay,
        position: 'Punong Barangay'
      }] : []),
      ...(barangayOfficials?.secretary ? [{ 
        id: `${barangayOfficials.id}-secretary`, 
        name: barangayOfficials.secretary,
        position: 'Secretary'
      }] : []),
      ...(barangayOfficials?.treasurer ? [{ 
        id: `${barangayOfficials.id}-treasurer`, 
        name: barangayOfficials.treasurer,
        position: 'Treasurer'
      }] : []),
      
      // Add council members
      ...councilMembers.map(member => ({
        id: member.id,
        name: member.name,
        position: member.position || 'Council Member'
      }))
    ];

    return NextResponse.json({ officials });
  } catch (error) {
    console.error("Error fetching officials:", error);
    return NextResponse.json(
      { error: "Failed to fetch officials" },
      { status: 500 }
    );
  }
} 