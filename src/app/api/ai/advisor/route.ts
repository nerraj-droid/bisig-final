import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// This initial implementation will use rule-based recommendations
// In future phases, this will be replaced with ML models

// Define types for recommendations
interface Recommendation {
    message: string;
    type: 'info' | 'suggestion' | 'warning' | 'critical' | 'error';
    data?: Record<string, any>;
}

/**
 * GET /api/ai/advisor
 * 
 * Query parameters:
 * - aipId: Optional ID of specific AIP to get recommendations for
 * - type: Type of recommendations to get (budget, project, risk, all)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract query parameters
        const url = new URL(req.url);
        const aipId = url.searchParams.get("aipId");
        const type = url.searchParams.get("type") || "all";

        // Get recommendations based on type
        let recommendations: Record<string, Recommendation[]> = {};

        if (type === "all" || type === "budget") {
            recommendations.budget = await getBudgetRecommendations(aipId);
        }

        if (type === "all" || type === "project") {
            recommendations.project = await getProjectRecommendations(aipId);
        }

        if (type === "all" || type === "risk") {
            recommendations.risk = await getRiskRecommendations(aipId);
        }

        return NextResponse.json({
            recommendations,
            timestamp: new Date().toISOString(),
            source: "rule-based-v1",
        });
    } catch (error) {
        console.error("Error generating AI recommendations:", error);
        return NextResponse.json(
            { error: "Failed to generate recommendations" },
            { status: 500 }
        );
    }
}

/**
 * Generate budget-related recommendations
 */
async function getBudgetRecommendations(aipId: string | null): Promise<Recommendation[]> {
    try {
        // If specific AIP provided
        if (aipId) {
            const aip = await prisma.annualInvestmentProgram.findUnique({
                where: { id: aipId },
                include: {
                    projects: {
                        include: {
                            expenses: true,
                        },
                    },
                },
            });

            if (!aip) {
                return [{ message: "No AIP found with the provided ID", type: "warning" }];
            }

            const recommendations: Recommendation[] = [];

            // Calculate budget utilization
            const totalExpenses = aip.projects.reduce((total, project) => {
                const projectExpenses = project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
                return total + projectExpenses;
            }, 0);

            const utilizationRate = (totalExpenses / aip.totalAmount) * 100;

            // Budget utilization recommendations
            if (utilizationRate < 30) {
                recommendations.push({
                    message: "Budget utilization is significantly below expected levels. Consider accelerating project implementation or reallocating funds to high-priority areas.",
                    type: "critical",
                    data: { utilizationRate: utilizationRate.toFixed(2) + "%" }
                });
            } else if (utilizationRate > 90) {
                recommendations.push({
                    message: "Budget utilization is nearing capacity. Monitor expenses closely to avoid overruns.",
                    type: "warning",
                    data: { utilizationRate: utilizationRate.toFixed(2) + "%" }
                });
            }

            // Sector balance recommendations
            const sectors = new Map();
            let totalAllocation = 0;

            aip.projects.forEach(project => {
                const sector = project.sector || "Uncategorized";
                const currentAmount = sectors.get(sector) || 0;
                sectors.set(sector, currentAmount + project.totalCost);
                totalAllocation += project.totalCost;
            });

            // Check if any sector has more than 50% of the budget
            sectors.forEach((amount, sector) => {
                const percentage = (amount / totalAllocation) * 100;
                if (percentage > 50) {
                    recommendations.push({
                        message: `${sector} sector accounts for ${percentage.toFixed(2)}% of the budget. Consider diversifying investments across more sectors.`,
                        type: "suggestion",
                        data: { sector, percentage: percentage.toFixed(2) + "%" }
                    });
                }
            });

            return recommendations.length > 0 ? recommendations : [{ message: "No budget recommendations at this time", type: "info" }];
        }

        // General recommendations if no specific AIP
        return [
            { message: "Ensure at least 20% of AIP budget is allocated to health and social services", type: "suggestion" },
            { message: "Consider historical spending patterns from previous fiscal years when planning new budget allocations", type: "suggestion" },
            { message: "Allocate a small contingency budget (5-10%) for unexpected expenses", type: "suggestion" }
        ];
    } catch (error) {
        console.error("Error generating budget recommendations:", error);
        return [{ message: "Unable to generate budget recommendations", type: "error" }];
    }
}

/**
 * Generate project-related recommendations
 */
async function getProjectRecommendations(aipId: string | null): Promise<Recommendation[]> {
    try {
        // If specific AIP provided
        if (aipId) {
            const aip = await prisma.annualInvestmentProgram.findUnique({
                where: { id: aipId },
                include: {
                    projects: {
                        include: {
                            milestones: true,
                        },
                    },
                },
            });

            if (!aip) {
                return [{ message: "No AIP found with the provided ID", type: "warning" }];
            }

            const recommendations: Recommendation[] = [];

            // Project status recommendations
            const delayedProjects = aip.projects.filter(project => project.status === "DELAYED");
            if (delayedProjects.length > 0) {
                recommendations.push({
                    message: `${delayedProjects.length} project(s) are currently delayed. Consider reviewing these projects to identify common bottlenecks.`,
                    type: "critical",
                    data: { count: delayedProjects.length }
                });
            }

            // Milestone tracking recommendations
            const projectsMissingMilestones = aip.projects.filter(project =>
                project.milestones.length === 0 && project.status !== "COMPLETED"
            );

            if (projectsMissingMilestones.length > 0) {
                recommendations.push({
                    message: `${projectsMissingMilestones.length} project(s) don't have defined milestones. Add milestones to better track progress.`,
                    type: "warning",
                    data: { count: projectsMissingMilestones.length }
                });
            }

            // Project timeline recommendations
            const currentDate = new Date();
            const projectsNearingDeadline = aip.projects.filter(project => {
                const endDate = new Date(project.endDate);
                const daysRemaining = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysRemaining <= 30 && project.status !== "COMPLETED";
            });

            if (projectsNearingDeadline.length > 0) {
                recommendations.push({
                    message: `${projectsNearingDeadline.length} project(s) are nearing their deadlines (within 30 days). Ensure they are on track for completion.`,
                    type: "warning",
                    data: { count: projectsNearingDeadline.length }
                });
            }

            return recommendations.length > 0 ? recommendations : [{ message: "No project recommendations at this time", type: "info" }];
        }

        // General recommendations if no specific AIP
        return [
            { message: "Maintain a balanced portfolio of short-term and long-term projects", type: "suggestion" },
            { message: "Set clear milestones for all projects to better track progress", type: "suggestion" },
            { message: "Consider community input when prioritizing new projects", type: "suggestion" }
        ];
    } catch (error) {
        console.error("Error generating project recommendations:", error);
        return [{ message: "Unable to generate project recommendations", type: "error" }];
    }
}

/**
 * Generate risk-related recommendations
 */
async function getRiskRecommendations(aipId: string | null): Promise<Recommendation[]> {
    try {
        // If specific AIP provided
        if (aipId) {
            const aip = await prisma.annualInvestmentProgram.findUnique({
                where: { id: aipId },
                include: {
                    projects: true,
                },
            });

            if (!aip) {
                return [{ message: "No AIP found with the provided ID", type: "warning" }];
            }

            const recommendations: Recommendation[] = [];

            // Budget-related risks
            const highValueProjects = aip.projects.filter(project =>
                project.totalCost > (aip.totalAmount * 0.25)
            );

            if (highValueProjects.length > 0) {
                recommendations.push({
                    message: `${highValueProjects.length} project(s) represent more than 25% of total budget each. Consider splitting these into smaller phases to reduce risk.`,
                    type: "warning",
                    data: { count: highValueProjects.length }
                });
            }

            // Timeline-related risks
            const currentDate = new Date();
            const projectTimeframes = aip.projects.map(project => ({
                id: project.id,
                title: project.title,
                start: new Date(project.startDate),
                end: new Date(project.endDate)
            }));

            // Simple algorithm to detect many projects happening simultaneously
            const monthCounts = new Array(12).fill(0);
            projectTimeframes.forEach(project => {
                const startMonth = project.start.getMonth();
                const endMonth = project.end.getMonth();

                for (let month = startMonth; month <= endMonth; month++) {
                    monthCounts[month]++;
                }
            });

            const peakMonth = monthCounts.reduce((maxIdx, count, idx, arr) =>
                count > arr[maxIdx] ? idx : maxIdx, 0);

            if (monthCounts[peakMonth] > 5) {
                recommendations.push({
                    message: `${monthCounts[peakMonth]} projects are scheduled to be active in month ${peakMonth + 1}. Consider reviewing resource allocation for this period.`,
                    type: "suggestion",
                    data: { count: monthCounts[peakMonth], month: peakMonth + 1 }
                });
            }

            return recommendations.length > 0 ? recommendations : [{ message: "No risk recommendations at this time", type: "info" }];
        }

        // General recommendations if no specific AIP
        return [
            { message: "Diversify funding sources to mitigate financial risks", type: "suggestion" },
            { message: "Identify and document potential risks for each project during planning phase", type: "suggestion" },
            { message: "Perform regular risk assessments throughout project lifecycle", type: "suggestion" }
        ];
    } catch (error) {
        console.error("Error generating risk recommendations:", error);
        return [{ message: "Unable to generate risk recommendations", type: "error" }];
    }
} 