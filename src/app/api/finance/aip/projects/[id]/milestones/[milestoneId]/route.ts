import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for updating a milestone
const updateMilestoneSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional().nullable(),
    dueDate: z.string().optional().refine(
        (date) => !date || !isNaN(new Date(date).getTime()),
        { message: "Invalid date format" }
    ),
    status: z.enum(["PENDING", "COMPLETED", "DELAYED", "CANCELLED"]).optional(),
});

// GET /api/finance/aip/projects/:id/milestones/:milestoneId - Get milestone
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string; milestoneId: string } }
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

        const { milestoneId } = params;

        // Fetch the milestone
        const milestone = await prisma.aIPMilestone.findUnique({
            where: { id: milestoneId },
        });

        if (!milestone) {
            return NextResponse.json(
                { error: "Milestone not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(milestone);
    } catch (error) {
        console.error("Error fetching milestone:", error);
        return NextResponse.json(
            { error: "Failed to fetch milestone" },
            { status: 500 }
        );
    }
}

// PATCH /api/finance/aip/projects/:id/milestones/:milestoneId - Update milestone
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string; milestoneId: string } }
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

        const { id, milestoneId } = params;
        const body = await req.json();

        // Validate request body
        const validationResult = updateMilestoneSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map((err) => ({
                path: err.path.join("."),
                message: err.message,
            }));
            return NextResponse.json({ errors }, { status: 400 });
        }

        // Verify milestone exists and belongs to the project
        const milestone = await prisma.aIPMilestone.findFirst({
            where: {
                id: milestoneId,
                projectId: id,
            },
            include: {
                project: {
                    include: {
                        aip: true,
                    },
                },
            },
        });

        if (!milestone) {
            return NextResponse.json(
                { error: "Milestone not found or does not belong to this project" },
                { status: 404 }
            );
        }

        // Only allow updating if AIP is in editable state
        const aipStatus = milestone.project.aip.status;
        if (!["DRAFT", "SUBMITTED", "APPROVED", "IMPLEMENTED"].includes(aipStatus)) {
            return NextResponse.json(
                { error: "Cannot update milestone when AIP is in current status" },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: any = {};

        if (body.title) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.dueDate) updateData.dueDate = new Date(body.dueDate);

        // Handle status change
        if (body.status && body.status !== milestone.status) {
            updateData.status = body.status;

            // If completing the milestone, set completedAt
            if (body.status === "COMPLETED" && milestone.status !== "COMPLETED") {
                updateData.completedAt = new Date();
            } else if (body.status !== "COMPLETED" && milestone.status === "COMPLETED") {
                // If un-completing, clear completedAt
                updateData.completedAt = null;
            }
        }

        // Update the milestone
        const updatedMilestone = await prisma.aIPMilestone.update({
            where: { id: milestoneId },
            data: updateData,
        });

        // Update project progress if status changed
        if (body.status && body.status !== milestone.status) {
            await updateProjectProgress(id);
        }

        return NextResponse.json(updatedMilestone);
    } catch (error) {
        console.error("Error updating milestone:", error);
        return NextResponse.json(
            { error: "Failed to update milestone" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/aip/projects/:id/milestones/:milestoneId - Delete milestone
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; milestoneId: string } }
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

        const { id, milestoneId } = params;

        // Verify milestone exists and belongs to the project
        const milestone = await prisma.aIPMilestone.findFirst({
            where: {
                id: milestoneId,
                projectId: id,
            },
            include: {
                project: {
                    include: {
                        aip: true,
                    },
                },
            },
        });

        if (!milestone) {
            return NextResponse.json(
                { error: "Milestone not found or does not belong to this project" },
                { status: 404 }
            );
        }

        // Only allow deleting if AIP is in editable state
        const aipStatus = milestone.project.aip.status;
        if (!["DRAFT", "SUBMITTED", "APPROVED"].includes(aipStatus)) {
            return NextResponse.json(
                { error: "Cannot delete milestone when AIP is in current status" },
                { status: 400 }
            );
        }

        // Delete the milestone
        await prisma.aIPMilestone.delete({
            where: { id: milestoneId },
        });

        // Update project progress
        await updateProjectProgress(id);

        return NextResponse.json(
            { message: "Milestone deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting milestone:", error);
        return NextResponse.json(
            { error: "Failed to delete milestone" },
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

        // If all milestones are completed, consider updating project status
        if (progress === 100) {
            const project = await prisma.aIPProject.findUnique({
                where: { id: projectId },
            });

            if (project && project.status === "ONGOING") {
                await prisma.aIPProject.update({
                    where: { id: projectId },
                    data: { status: "COMPLETED" },
                });
            }
        }
    } catch (error) {
        console.error("Error updating project progress:", error);
    }
} 