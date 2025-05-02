import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for creating a milestone
const createMilestoneSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional(),
    dueDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Invalid date format",
    }),
    status: z.enum(["PENDING", "COMPLETED", "DELAYED", "CANCELLED"]).optional(),
});

// GET /api/finance/aip/projects/:id/milestones - List milestones
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role permissions
        const allowedRoles = ["TREASURER", "CAPTAIN", "SUPER_ADMIN"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = params;

        // Verify project exists
        const project = await prisma.aIPProject.findUnique({
            where: { id },
            include: {
                aip: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        // Fetch milestones for this project
        const milestones = await prisma.aIPMilestone.findMany({
            where: { projectId: id },
            orderBy: [
                { status: "asc" }, // Show pending ones first
                { dueDate: "asc" },
            ],
        });

        return NextResponse.json(milestones);
    } catch (error) {
        console.error("Error fetching milestones:", error);
        return NextResponse.json(
            { error: "Failed to fetch milestones" },
            { status: 500 }
        );
    }
}

// POST /api/finance/aip/projects/:id/milestones - Add milestone
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role permissions
        const allowedRoles = ["TREASURER", "CAPTAIN", "SUPER_ADMIN"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();

        // Validate request body
        const validationResult = createMilestoneSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map((err) => ({
                path: err.path.join("."),
                message: err.message,
            }));
            return NextResponse.json({ errors }, { status: 400 });
        }

        // Verify project exists and is in editable state
        const project = await prisma.aIPProject.findUnique({
            where: { id },
            include: {
                aip: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        // Only allow adding milestones if AIP is in editable state
        if (!["DRAFT", "SUBMITTED", "APPROVED", "IMPLEMENTED"].includes(project.aip.status)) {
            return NextResponse.json(
                { error: "Cannot add milestones to project when AIP is in current status" },
                { status: 400 }
            );
        }

        // Parse date
        const dueDate = new Date(body.dueDate);

        // Create the milestone
        const milestone = await prisma.aIPMilestone.create({
            data: {
                projectId: id,
                title: body.title,
                description: body.description || null,
                dueDate,
                status: body.status || "PENDING",
                completedAt: body.status === "COMPLETED" ? new Date() : null,
            },
        });

        // Update project progress if milestone is completed
        if (body.status === "COMPLETED") {
            await updateProjectProgress(id);
        }

        return NextResponse.json(milestone, { status: 201 });
    } catch (error) {
        console.error("Error creating milestone:", error);
        return NextResponse.json(
            { error: "Failed to create milestone" },
            { status: 500 }
        );
    }
}

// Helper function to update project progress based on milestone completion
async function updateProjectProgress(projectId: string) {
    try {
        // Get all milestones for this project
        const milestones = await prisma.aIPMilestone.findMany({
            where: { projectId },
        });

        // Calculate progress as percentage of completed milestones
        const totalMilestones = milestones.length;
        if (totalMilestones === 0) return;

        const completedMilestones = milestones.filter(
            (m) => m.status === "COMPLETED"
        ).length;

        const progress = Math.round((completedMilestones / totalMilestones) * 100);

        // Update project progress
        await prisma.aIPProject.update({
            where: { id: projectId },
            data: { progress },
        });
    } catch (error) {
        console.error("Error updating project progress:", error);
    }
} 