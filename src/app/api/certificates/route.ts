import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createCertificate,
  getCertificates,
  getCertificateByControlNumber,
  getCertificateStats,
  CertificateCreateInput
} from "@/models/Certificate";
import { CertificateType } from "@prisma/client";

// Get all certificates or search by control number
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const controlNumber = url.searchParams.get("controlNumber");
    const stats = url.searchParams.get("stats");

    // Return statistics if requested
    if (stats === "true") {
      const certificateStats = await getCertificateStats();
      return NextResponse.json(certificateStats);
    }

    // Search by control number if provided
    if (controlNumber) {
      const certificate = await getCertificateByControlNumber(controlNumber);

      if (!certificate) {
        return NextResponse.json(
          { error: "Certificate not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(certificate);
    }

    // Get all certificates
    const certificates = await getCertificates();
    return NextResponse.json(certificates);

  } catch (error) {
    console.error("Error in GET /api/certificates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new certificate
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only certain roles can create certificates
    if (!["SUPER_ADMIN", "CAPTAIN", "SECRETARY"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { purpose, residentId, type, officialId } = body;

    // Validate required fields
    if (!purpose || !residentId || !type) {
      return NextResponse.json(
        { error: "Missing required fields: purpose, residentId, type" },
        { status: 400 }
      );
    }

    // Validate certificate type
    if (!Object.values(CertificateType).includes(type)) {
      return NextResponse.json(
        { error: "Invalid certificate type" },
        { status: 400 }
      );
    }

    const certificateData: CertificateCreateInput = {
      purpose: purpose.trim(),
      residentId,
      type,
      officialId,
    };

    const certificate = await createCertificate(certificateData);

    return NextResponse.json(certificate, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/certificates:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
