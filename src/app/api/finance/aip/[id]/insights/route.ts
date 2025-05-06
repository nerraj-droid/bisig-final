import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateAIPInsights } from "@/lib/ai/aip-insights";

// GET /api/finance/aip/:id/insights - Get AI insights for an AIP
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
    const allowedRoles = ["TREASURER", "CAPTAIN", "SUPER_ADMIN", "SECRETARY"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    // Fetch AIP with related data needed for insights
    const aipData = await prisma.annualInvestmentProgram.findUnique({
      where: { id },
      include: {
        fiscalYear: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        projects: {
          include: {
            milestones: true,
            expenses: true,
          },
        },
      },
    });

    if (!aipData) {
      return NextResponse.json(
        { error: "AIP record not found" },
        { status: 404 }
      );
    }

    // Convert date objects to ISO strings to match our expected AIP interface
    const aip = {
      ...aipData,
      createdAt: aipData.createdAt.toISOString(),
      approvedDate: aipData.approvedDate?.toISOString() || null,
      fiscalYear: {
        ...aipData.fiscalYear,
        startDate: aipData.fiscalYear.startDate.toISOString(),
        endDate: aipData.fiscalYear.endDate.toISOString(),
        createdAt: aipData.fiscalYear.createdAt.toISOString(),
        updatedAt: aipData.fiscalYear.updatedAt.toISOString(),
      },
      projects: aipData.projects.map(project => ({
        ...project,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate.toISOString(),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        milestones: project.milestones.map(milestone => ({
          ...milestone,
          dueDate: milestone.dueDate.toISOString(),
          completedAt: milestone.completedAt?.toISOString() || null,
          createdAt: milestone.createdAt.toISOString(),
          updatedAt: milestone.updatedAt.toISOString(),
        })),
        expenses: project.expenses.map(expense => ({
          ...expense,
          date: expense.date.toISOString(),
          createdAt: expense.createdAt.toISOString(),
          updatedAt: expense.updatedAt.toISOString(),
        })),
      })),
    };

    // Generate insights from AIP data
    const insights = generateAIPInsights(aip);

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating AIP insights:", error);
    return NextResponse.json(
      { error: "Failed to generate AIP insights" },
      { status: 500 }
    );
  }
} 