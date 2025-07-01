import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getCertificateById,
    updateCertificateStatus,
    deleteCertificate,
} from "@/models/Certificate";

// Get a specific certificate by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = params;
        const certificate = await getCertificateById(id);

        if (!certificate) {
            return NextResponse.json(
                { error: "Certificate not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(certificate);

    } catch (error) {
        console.error("Error in GET /api/certificates/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Update certificate status
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only certain roles can update certificates
        if (!["SUPER_ADMIN", "CAPTAIN", "SECRETARY"].includes(session.user.role)) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            );
        }

        const { id } = params;
        const body = await request.json();
        const { status, issuedDate } = body;

        // Validate status
        const validStatuses = ["PENDING", "APPROVED", "RELEASED", "REJECTED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        // Check if certificate exists
        const existingCertificate = await getCertificateById(id);
        if (!existingCertificate) {
            return NextResponse.json(
                { error: "Certificate not found" },
                { status: 404 }
            );
        }

        const updatedCertificate = await updateCertificateStatus(
            id,
            status,
            issuedDate ? new Date(issuedDate) : undefined
        );

        return NextResponse.json(updatedCertificate);

    } catch (error) {
        console.error("Error in PUT /api/certificates/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Delete a certificate
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only admins and captains can delete certificates
        if (!["SUPER_ADMIN", "CAPTAIN"].includes(session.user.role)) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            );
        }

        const { id } = params;

        // Check if certificate exists
        const existingCertificate = await getCertificateById(id);
        if (!existingCertificate) {
            return NextResponse.json(
                { error: "Certificate not found" },
                { status: 404 }
            );
        }

        await deleteCertificate(id);

        return NextResponse.json(
            { message: "Certificate deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error in DELETE /api/certificates/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 