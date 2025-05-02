import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for creating an attachment
const createAttachmentSchema = z.object({
    filename: z.string().min(1, { message: "Filename is required" }),
    filepath: z.string().min(1, { message: "Filepath is required" }),
    filesize: z.number().positive({ message: "Filesize must be a positive number" }),
    filetype: z.string().min(1, { message: "Filetype is required" }),
    description: z.string().optional(),
});

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Ensure params are fully resolved
        const { id } = context.params;

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify AIP exists
        const aip = await prisma.annualInvestmentProgram.findUnique({
            where: { id },
        });

        if (!aip) {
            return NextResponse.json({ error: "AIP not found" }, { status: 404 });
        }

        // Fetch attachments for the AIP
        const attachments = await prisma.aIPAttachment.findMany({
            where: {
                aipId: id,
            },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                uploadedAt: "desc",
            },
        });

        return NextResponse.json(attachments);
    } catch (error) {
        console.error("Error fetching AIP attachments:", error);
        return NextResponse.json(
            { error: "Failed to fetch attachments" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Ensure params are fully resolved
        const { id } = context.params;

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify AIP exists
        const aip = await prisma.annualInvestmentProgram.findUnique({
            where: { id },
        });

        if (!aip) {
            return NextResponse.json({ error: "AIP not found" }, { status: 404 });
        }

        // Parse and validate the request body
        const body = await request.json();
        const validatedData = createAttachmentSchema.parse(body);

        // Create the attachment
        const attachment = await prisma.aIPAttachment.create({
            data: {
                ...validatedData,
                aipId: id,
                uploadedById: session.user.id,
            },
        });

        return NextResponse.json(attachment, { status: 201 });
    } catch (error) {
        console.error("Error creating AIP attachment:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create attachment" },
            { status: 500 }
        );
    }
}

// DELETE endpoint for removing an attachment
export async function DELETE(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Ensure params are fully resolved
        const { id } = context.params;

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const attachmentId = url.searchParams.get("attachmentId");

        if (!attachmentId) {
            return NextResponse.json(
                { error: "Attachment ID is required" },
                { status: 400 }
            );
        }

        // Verify the attachment exists and belongs to this AIP
        const attachment = await prisma.aIPAttachment.findFirst({
            where: {
                id: attachmentId,
                aipId: id,
            },
        });

        if (!attachment) {
            return NextResponse.json(
                { error: "Attachment not found" },
                { status: 404 }
            );
        }

        // Delete the attachment
        await prisma.aIPAttachment.delete({
            where: {
                id: attachmentId,
            },
        });

        return NextResponse.json(
            { message: "Attachment deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting AIP attachment:", error);
        return NextResponse.json(
            { error: "Failed to delete attachment" },
            { status: 500 }
        );
    }
} 