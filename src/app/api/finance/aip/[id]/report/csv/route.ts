import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";

// POST /api/finance/aip/[id]/report/csv - Export AIP report data as CSV
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

        // Fetch AIP with related data
        const aip = await prisma.annualInvestmentProgram.findUnique({
            where: { id },
            include: {
                fiscalYear: true,
                projects: {
                    include: {
                        budgetCategory: true,
                        expenses: true,
                        milestones: true,
                    },
                },
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                approvedBy: {
                    select: {
                        name: true,
                        email: true,
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

        // Format date
        const formatDateString = (dateStr: string | Date | null): string => {
            if (!dateStr) return "N/A";
            return format(new Date(dateStr), "yyyy-MM-dd");
        };

        // Format number as currency without symbol for CSV
        const formatNumber = (num: number): string => {
            return num.toFixed(2);
        };

        // Generate CSV content
        let csvContent: any[][] = [];

        // AIP Summary Section
        csvContent.push(["ANNUAL INVESTMENT PROGRAM REPORT"]);
        csvContent.push([`Generated on: ${formatDateString(new Date())}`]);
        csvContent.push([]);

        csvContent.push(["1. AIP SUMMARY"]);
        csvContent.push(["Field", "Value"]);
        csvContent.push(["Title", aip.title]);
        csvContent.push(["Fiscal Year", aip.fiscalYear.year]);
        csvContent.push(["Status", aip.status]);
        csvContent.push(["Total Budget", formatNumber(aip.totalAmount)]);
        csvContent.push(["Created By", aip.createdBy.name || aip.createdBy.email]);
        csvContent.push(["Created Date", formatDateString(aip.createdAt)]);
        csvContent.push(["Approved By", aip.approvedBy ? (aip.approvedBy.name || aip.approvedBy.email) : "Not Approved"]);
        csvContent.push(["Approved Date", aip.approvedDate ? formatDateString(aip.approvedDate) : "Not Approved"]);
        csvContent.push(["Description", aip.description || ""]);
        csvContent.push([]);

        // Calculate summary statistics
        const totalProjects = aip.projects.length;
        const completedProjects = aip.projects.filter(p => p.status === "COMPLETED").length;
        const ongoingProjects = aip.projects.filter(p => p.status === "ONGOING").length;
        const plannedProjects = aip.projects.filter(p => p.status === "PLANNED").length;
        const totalExpenditure = aip.projects.reduce(
            (sum, project) =>
                sum + project.expenses.reduce((s, e) => s + e.amount, 0),
            0
        );

        // Project Status Overview
        csvContent.push(["PROJECT STATUS OVERVIEW"]);
        csvContent.push(["Status", "Count", "Percentage"]);
        csvContent.push(["Completed", completedProjects, `${totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0}%`]);
        csvContent.push(["Ongoing", ongoingProjects, `${totalProjects ? Math.round((ongoingProjects / totalProjects) * 100) : 0}%`]);
        csvContent.push(["Planned", plannedProjects, `${totalProjects ? Math.round((plannedProjects / totalProjects) * 100) : 0}%`]);
        csvContent.push(["Total", totalProjects, "100%"]);
        csvContent.push([]);

        // Budget Utilization
        csvContent.push(["BUDGET UTILIZATION"]);
        csvContent.push(["Category", "Value"]);
        csvContent.push(["Total Budget", formatNumber(aip.totalAmount)]);
        csvContent.push(["Total Expenditure", formatNumber(totalExpenditure)]);
        csvContent.push(["Remaining Budget", formatNumber(aip.totalAmount - totalExpenditure)]);
        csvContent.push(["Utilization Rate", `${aip.totalAmount ? Math.round((totalExpenditure / aip.totalAmount) * 100) : 0}%`]);
        csvContent.push([]);

        // Projects Section
        csvContent.push(["2. PROJECTS OVERVIEW"]);
        csvContent.push(["Project Code", "Title", "Sector", "Budget", "Expenditure", "Status", "Progress", "Start Date", "End Date"]);

        aip.projects.forEach(project => {
            const projectExpenditure = project.expenses.reduce((sum, e) => sum + e.amount, 0);
            csvContent.push([
                project.projectCode,
                project.title,
                project.sector,
                formatNumber(project.totalCost),
                formatNumber(projectExpenditure),
                project.status,
                `${project.progress}%`,
                formatDateString(project.startDate),
                formatDateString(project.endDate)
            ]);
        });
        csvContent.push([]);

        // Sector Analysis
        const sectorSet = new Set<string>();
        aip.projects.forEach(p => sectorSet.add(p.sector));
        const sectors = Array.from(sectorSet);

        csvContent.push(["BUDGET ALLOCATION BY SECTOR"]);
        csvContent.push(["Sector", "Projects", "Budget", "Expenditure", "Utilization Rate"]);

        sectors.forEach(sector => {
            const sectorProjects = aip.projects.filter(p => p.sector === sector);
            const budget = sectorProjects.reduce((sum, p) => sum + p.totalCost, 0);
            const expenditure = sectorProjects.reduce(
                (sum, p) => sum + p.expenses.reduce((s, e) => s + e.amount, 0),
                0
            );
            const utilization = budget > 0 ? Math.round((expenditure / budget) * 100) : 0;

            csvContent.push([
                sector,
                sectorProjects.length,
                formatNumber(budget),
                formatNumber(expenditure),
                `${utilization}%`
            ]);
        });
        csvContent.push([]);

        // Project Details
        csvContent.push(["3. PROJECT DETAILS"]);

        aip.projects.forEach(project => {
            csvContent.push([`PROJECT: ${project.title} (${project.projectCode})`]);
            csvContent.push(["Field", "Value"]);
            csvContent.push(["Sector", project.sector]);
            csvContent.push(["Status", project.status]);
            csvContent.push(["Budget", formatNumber(project.totalCost)]);
            csvContent.push(["Location", project.location || "N/A"]);
            csvContent.push(["Start Date", formatDateString(project.startDate)]);
            csvContent.push(["End Date", formatDateString(project.endDate)]);
            csvContent.push(["Progress", `${project.progress}%`]);
            csvContent.push(["Fund Source", project.fundSource || "N/A"]);
            csvContent.push(["Budget Category", project.budgetCategory?.name || "Uncategorized"]);
            csvContent.push(["Description", project.description]);
            csvContent.push([]);

            // Milestones
            if (project.milestones.length > 0) {
                csvContent.push(["MILESTONES"]);
                csvContent.push(["Title", "Status", "Due Date", "Completed Date"]);

                project.milestones.forEach(milestone => {
                    csvContent.push([
                        milestone.title,
                        milestone.status,
                        formatDateString(milestone.dueDate),
                        milestone.completedAt ? formatDateString(milestone.completedAt) : "Not Completed"
                    ]);
                });
                csvContent.push([]);
            }

            // Expenses
            if (project.expenses.length > 0) {
                csvContent.push(["EXPENSES"]);
                csvContent.push(["Date", "Description", "Amount", "Reference"]);

                project.expenses.forEach(expense => {
                    csvContent.push([
                        formatDateString(expense.date),
                        expense.description,
                        formatNumber(expense.amount),
                        expense.reference || "N/A"
                    ]);
                });

                // Expense summary
                const totalExpense = project.expenses.reduce((sum, e) => sum + e.amount, 0);
                const remaining = project.totalCost - totalExpense;
                const utilization = project.totalCost > 0 ? Math.round((totalExpense / project.totalCost) * 100) : 0;

                csvContent.push([]);
                csvContent.push(["Total Expenses", formatNumber(totalExpense)]);
                csvContent.push(["Remaining Budget", formatNumber(remaining)]);
                csvContent.push(["Budget Utilization", `${utilization}%`]);
            }

            csvContent.push([]);
            csvContent.push([]); // Add extra spacing between projects
        });

        // Convert the array to CSV string
        // Properly escape fields containing commas, quotes, or newlines
        const escapeCsvField = (field: any): string => {
            const stringField = String(field);
            if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };

        const csvString = csvContent
            .map(row => row.map(escapeCsvField).join(','))
            .join('\n');

        // Return the CSV as a download
        return new NextResponse(csvString, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=aip-report-${aip.fiscalYear.year}.csv`,
            },
        });
    } catch (error) {
        console.error("Error generating CSV report:", error);
        return NextResponse.json(
            { error: "Failed to generate CSV report" },
            { status: 500 }
        );
    }
} 