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
    category: z.string().optional(),
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

        // Verify project exists
        const project = await prisma.aIPProject.findUnique({
            where: { id },
            include: {
                aip: true,
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Fetch attachments for the project
        const attachments = await prisma.aIPProjectAttachment.findMany({
            where: {
                projectId: id,
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
        console.error("Error fetching attachments:", error);
        return NextResponse.json(
            { error: "Failed to retrieve attachments" },
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

        // Check if user has appropriate role
        const userRole = session.user.role;
        if (!["TREASURER", "CAPTAIN", "SUPER_ADMIN"].includes(userRole)) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            );
        }

        const data = await request.json();

        // Validate the request data
        const validationResult = createAttachmentSchema.safeParse(data);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.format() },
                { status: 400 }
            );
        }

        // Verify project exists
        const project = await prisma.aIPProject.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Create the attachment
        const attachment = await prisma.aIPProjectAttachment.create({
            data: {
                filename: data.filename,
                filepath: data.filepath,
                filesize: data.filesize,
                filetype: data.filetype,
                description: data.description,
                category: data.category,
                project: {
                    connect: {
                        id,
                    },
                },
                uploadedBy: {
                    connect: {
                        id: session.user.id,
                    },
                },
            },
        });

        return NextResponse.json(attachment, { status: 201 });
    } catch (error) {
        console.error("Error creating attachment:", error);
        return NextResponse.json(
            { error: "Failed to create attachment" },
            { status: 500 }
        );
    }
}

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

        // Verify the attachment exists and belongs to this project
        const attachment = await prisma.aIPProjectAttachment.findFirst({
            where: {
                id: attachmentId,
                projectId: id,
            },
        });

        if (!attachment) {
            return NextResponse.json(
                { error: "Attachment not found" },
                { status: 404 }
            );
        }

        // Delete the attachment
        await prisma.aIPProjectAttachment.delete({
            where: {
                id: attachmentId,
            },
        });

        return NextResponse.json(
            { message: "Attachment deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting project attachment:", error);
        return NextResponse.json(
            { error: "Failed to delete attachment" },
            { status: 500 }
        );
    }
} 