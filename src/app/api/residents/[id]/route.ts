import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/residents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params.id;
    const resident = await prisma.resident.findUnique({
      where: { id },
    });

    if (!resident) {
      return NextResponse.json(
        { message: "Resident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(resident);
  } catch (error) {
    console.error("Error fetching resident:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/residents/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params.id;
    const data = await request.json();

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.gender) {
      return NextResponse.json(
        { message: "First name, last name, and gender are required" },
        { status: 400 }
      );
    }

    // Check if resident exists
    const existingResident = await prisma.resident.findUnique({
      where: { id },
    });

    if (!existingResident) {
      return NextResponse.json(
        { message: "Resident not found" },
        { status: 404 }
      );
    }

    // Update resident
    const updatedResident = await prisma.resident.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedResident);
  } catch (error) {
    console.error("Error updating resident:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/residents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params.id;

    // Check if resident exists
    const existingResident = await prisma.resident.findUnique({
      where: { id },
    });

    if (!existingResident) {
      return NextResponse.json(
        { message: "Resident not found" },
        { status: 404 }
      );
    }

    // Delete resident
    await prisma.resident.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Resident deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting resident:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 