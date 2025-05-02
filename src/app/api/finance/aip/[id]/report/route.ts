import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProjectStatus } from "@prisma/client";
import { format } from "date-fns";

// GET /api/finance/aip/[id]/report - Get report data for a specific AIP
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

        // Fetch AIP with related data
        const aip = await prisma.annualInvestmentProgram.findUnique({
            where: { id },
            include: {
                fiscalYear: true,
                projects: {
                    include: {
                        budgetCategory: true,
                        expenses: {
                            include: {
                                transaction: true,
                            },
                        },
                        milestones: true,
                    },
                },
            },
        });

        if (!aip) {
            return NextResponse.json(
                { error: "AIP not found" },
                { status: 404 }
            );
        }

        // Calculate summary statistics
        const projectCount = aip.projects.length;
        const totalExpenditure = aip.projects.reduce(
            (sum, project) =>
                sum + project.expenses.reduce((s, e) => s + e.amount, 0),
            0
        );

        // Count projects by status
        const completedProjects = aip.projects.filter(p => p.status === "COMPLETED").length;
        const ongoingProjects = aip.projects.filter(p => p.status === "ONGOING").length;
        const plannedProjects = aip.projects.filter(p => p.status === "PLANNED").length;
        const delayedProjects = aip.projects.filter(p => p.status === "DELAYED").length;
        const cancelledProjects = aip.projects.filter(p => p.status === "CANCELLED").length;

        // Projects by status for pie chart
        const projectsByStatus = Object.values(ProjectStatus)
            .map(status => ({
                status,
                count: aip.projects.filter(p => p.status === status).length
            }))
            .filter(item => item.count > 0);

        // Projects and budget by sector
        const sectorSet = new Set<string>();
        aip.projects.forEach(p => sectorSet.add(p.sector));
        const sectors = Array.from(sectorSet);

        const projectsBySector = sectors.map(sector => {
            const sectorProjects = aip.projects.filter(p => p.sector === sector);
            const budget = sectorProjects.reduce((sum, p) => sum + p.totalCost, 0);
            const expenditure = sectorProjects.reduce(
                (sum, p) => sum + p.expenses.reduce((s, e) => s + e.amount, 0),
                0
            );
            return {
                sector,
                budget,
                expenditure,
                projectCount: sectorProjects.length
            };
        });

        // Budget categories
        const categorySet = new Set<string>();
        aip.projects
            .filter(p => p.budgetCategoryId)
            .forEach(p => categorySet.add(p.budgetCategory?.name || "Uncategorized"));

        const budgetCategories = Array.from(categorySet);

        const budgetUtilization = budgetCategories.map(category => {
            const categoryProjects = aip.projects.filter(
                p => (p.budgetCategory?.name || "Uncategorized") === category
            );
            const allocated = categoryProjects.reduce((sum, p) => sum + p.totalCost, 0);
            const utilized = categoryProjects.reduce(
                (sum, p) => sum + p.expenses.reduce((s, e) => s + e.amount, 0),
                0
            );
            return {
                category,
                allocated,
                utilized
            };
        });

        // If no budget categories are found, add a default "Total" category
        if (budgetUtilization.length === 0) {
            budgetUtilization.push({
                category: "Total",
                allocated: aip.totalAmount,
                utilized: totalExpenditure
            });
        }

        // Expenditure timeline - group by month
        const expenses = aip.projects.flatMap(p => p.expenses);

        // Create a map to store monthly expenditures
        const monthlyExpenditures = new Map<string, number>();

        // Get the fiscal year start date and end date
        const fyStartDate = new Date(aip.fiscalYear.startDate);
        const fyEndDate = new Date(aip.fiscalYear.endDate);

        // Initialize all months with zero
        const currentDate = new Date(fyStartDate);
        while (currentDate <= fyEndDate) {
            const monthKey = format(currentDate, "MMM yyyy");
            monthlyExpenditures.set(monthKey, 0);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Add up expenses by month
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = format(date, "MMM yyyy");

            if (monthlyExpenditures.has(monthKey)) {
                monthlyExpenditures.set(
                    monthKey,
                    (monthlyExpenditures.get(monthKey) || 0) + expense.amount
                );
            }
        });

        // Convert map to sorted array
        const expenditureTimeline = Array.from(monthlyExpenditures.entries())
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => {
                // Sort chronologically
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA.getTime() - dateB.getTime();
            });

        // Build and return the report data
        const reportData = {
            summary: {
                id: aip.id,
                title: aip.title,
                status: aip.status,
                totalAmount: aip.totalAmount,
                fiscalYear: aip.fiscalYear.year,
                projectCount,
                expenditureAmount: totalExpenditure,
                completedProjects,
                ongoingProjects,
                plannedProjects,
                delayedProjects,
                cancelledProjects,
            },
            projectsByStatus,
            projectsBySector,
            budgetUtilization,
            expenditureTimeline,
        };

        return NextResponse.json(reportData);
    } catch (error) {
        console.error("Error fetching AIP report data:", error);
        return NextResponse.json(
            { error: "Failed to fetch report data" },
            { status: 500 }
        );
    }
} 