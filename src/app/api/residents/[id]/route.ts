import { PrismaClient, Gender, CivilStatus } from "@prisma/client";
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
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const id = params.id;

    const resident = await prisma.resident.findUnique({
      where: { id },
    });

    if (!resident) {
      return new Response(
        JSON.stringify({ message: "Resident not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(resident),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.log(`Error fetching resident: ${error instanceof Error ? error.message : 'Unknown error'}`);

    // Create a safe error message
    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object') {
      try {
        errorMessage = JSON.stringify(error);
      } catch (e) {
        errorMessage = "An unexpected error occurred";
      }
    }

    return new Response(
      JSON.stringify({ message: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await prisma.$disconnect();
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
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const id = params.id;

    // Parse request body
    let data;
    try {
      const text = await request.text();
      console.log('Raw request body length:', text.length);
      // Log only the first 200 characters to avoid console issues with large payloads
      if (text.length > 0) {
        console.log('Raw request body preview:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      } else {
        console.log('Warning: Empty request body received');
      }

      try {
        data = JSON.parse(text);
        console.log('Parsed data fields:', Object.keys(data));
      } catch (parseError) {
        console.log(`JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        return new Response(
          JSON.stringify({ message: "Invalid JSON in request body" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.log(`Error reading request body: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return new Response(
        JSON.stringify({ message: "Error reading request body" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.gender || !data.birthDate || !data.civilStatus || !data.address) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if resident exists
    const existingResident = await prisma.resident.findUnique({
      where: { id },
    });

    if (!existingResident) {
      return new Response(
        JSON.stringify({ message: "Resident not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare update data
    const updateData = {
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: new Date(data.birthDate),
      address: data.address,
      // Handle enum fields carefully
      ...(data.gender && { gender: data.gender }),
      ...(data.civilStatus && { civilStatus: data.civilStatus }),
      // Arrays and booleans
      ...(Array.isArray(data.sectors) ? { sectors: data.sectors } : {}),
      voterInBarangay: Boolean(data.voterInBarangay),
      // Optional fields
      ...(data.middleName ? { middleName: data.middleName } : {}),
      ...(data.extensionName ? { extensionName: data.extensionName } : {}),
      ...(data.contactNo ? { contactNo: data.contactNo } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.occupation ? { occupation: data.occupation } : {}),
      ...(data.employmentStatus ? { employmentStatus: data.employmentStatus } : {}),
      ...(data.identityType ? { identityType: data.identityType } : {}),
      ...(data.identityNumber ? { identityNumber: data.identityNumber } : {}),
      ...(data.identityDocumentPath ? { identityDocumentPath: data.identityDocumentPath } : {}),
      ...(data.userPhoto ? { userPhoto: data.userPhoto } : {}),
      // Parent information
      ...(data.fatherName ? { fatherName: data.fatherName } : {}),
      ...(data.fatherMiddleName ? { fatherMiddleName: data.fatherMiddleName } : {}),
      ...(data.fatherLastName ? { fatherLastName: data.fatherLastName } : {}),
      ...(data.motherFirstName ? { motherFirstName: data.motherFirstName } : {}),
      ...(data.motherMiddleName ? { motherMiddleName: data.motherMiddleName } : {}),
      ...(data.motherMaidenName ? { motherMaidenName: data.motherMaidenName } : {}),
      // Additional fields
      ...(data.nationality ? { nationality: data.nationality } : {}),
      ...(data.religion ? { religion: data.religion } : {}),
      ...(data.ethnicGroup ? { ethnicGroup: data.ethnicGroup } : {}),
      ...(data.bloodType ? { bloodType: data.bloodType } : {}),
      ...(data.alias ? { alias: data.alias } : {})
    };

    // Log update data safely
    console.log('Updating resident with fields:', Object.keys(updateData));
    // Log data type for gender and civilStatus
    if (updateData.gender) {
      console.log('Gender type:', typeof updateData.gender, 'Value:', updateData.gender);
    }
    if (updateData.civilStatus) {
      console.log('Civil status type:', typeof updateData.civilStatus, 'Value:', updateData.civilStatus);
    }

    try {
      // Update resident
      let updatedResident;
      try {
        updatedResident = await prisma.resident.update({
          where: { id },
          data: updateData,
        });
      } catch (prismaError) {
        // Simple string logging to avoid issues with complex objects
        console.log(`Prisma update failed: ${prismaError instanceof Error ? prismaError.message : 'Unknown error'}`);

        return new Response(
          JSON.stringify({
            message: prismaError instanceof Error
              ? prismaError.message
              : "Failed to update resident in database"
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // If we get here, update was successful
      return new Response(
        JSON.stringify({
          message: "Resident updated successfully",
          data: updatedResident
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      // Simple string logging instead of object logging
      console.log(`Error in update try block: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return new Response(
        JSON.stringify({ message: "An error occurred during the update process" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    // Simple string logging to avoid potential issues with error objects
    console.log(`Error in PUT handler: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return new Response(
      JSON.stringify({
        message: error instanceof Error
          ? error.message
          : "An unexpected error occurred processing your request"
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await prisma.$disconnect();
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
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const id = params.id;

    // Check if resident exists
    const existingResident = await prisma.resident.findUnique({
      where: { id },
    });

    if (!existingResident) {
      return new Response(
        JSON.stringify({ message: "Resident not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the resident
    await prisma.resident.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "Resident deleted successfully" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.log(`Error deleting resident: ${error instanceof Error ? error.message : 'Unknown error'}`);

    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object') {
      try {
        errorMessage = JSON.stringify(error);
      } catch (e) {
        errorMessage = "An unexpected error occurred";
      }
    }

    return new Response(
      JSON.stringify({ message: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await prisma.$disconnect();
  }
} 