import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProjectStatus } from "@prisma/client";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Helper types
type CustomJsPDF = jsPDF & {
    autoTable: (options: any) => any;
    lastAutoTable: {
        finalY: number;
    };
};

// Function to generate AIP PDF report
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
                        expenses: {
                            include: {
                                transaction: true,
                            },
                            orderBy: {
                                date: "asc",
                            },
                        },
                        milestones: {
                            orderBy: {
                                dueDate: "asc",
                            },
                        },
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

        // Create PDF document
        const doc = new jsPDF() as CustomJsPDF;
        const timestamp = format(new Date(), "yyyy-MM-dd");

        // Cover Page
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.text("Annual Investment Program", doc.internal.pageSize.width / 2, 100, { align: "center" });
        doc.setFontSize(24);
        doc.text(`Fiscal Year ${aip.fiscalYear.year}`, doc.internal.pageSize.width / 2, 120, { align: "center" });

        // AIP Title
        doc.setFontSize(16);
        doc.text(aip.title, doc.internal.pageSize.width / 2, 140, { align: "center" });

        // Metadata
        doc.setFontSize(12);
        doc.text(
            [
                `Generated on: ${format(new Date(), "MMMM d, yyyy")}`,
                `Status: ${aip.status}`,
                `Total Budget: ${formatCurrency(aip.totalAmount)}`,
                `Document Type: AIP Report`,
            ],
            doc.internal.pageSize.width / 2,
            160,
            { align: "center" }
        );

        // Add new page for TOC
        doc.addPage();

        // Header (for all pages except cover)
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text(`AIP Report: ${aip.title}`, 20, 25);
        doc.setFontSize(12);
        doc.text(`Generated on: ${timestamp}`, 20, 35);
        doc.setTextColor(0, 0, 0);

        // Table of Contents
        doc.setFontSize(16);
        doc.text("Table of Contents", 20, 60);
        doc.setFontSize(12);

        let currentPage = 2;
        const toc = [
            { title: "1. AIP Summary", page: currentPage++ },
            { title: "2. Projects Overview", page: currentPage++ },
            { title: "3. Budget Utilization", page: currentPage++ },
            { title: "4. Project Details", page: currentPage },
        ];

        doc.autoTable({
            startY: 70,
            head: [["Section", "Page"]],
            body: toc.map(item => [item.title, item.page]),
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 12 },
        });

        // Summary Page
        doc.addPage();
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.text("1. AIP Summary", 20, 60);

        // Format dates
        const formatDateString = (dateString: string | Date | null) => {
            if (!dateString) return "N/A";
            return format(new Date(dateString), "MMMM d, yyyy");
        };

        // AIP Summary Table
        doc.autoTable({
            startY: 70,
            head: [["Field", "Value"]],
            body: [
                ["Title", aip.title],
                ["Fiscal Year", aip.fiscalYear.year],
                ["Status", aip.status],
                ["Total Budget", formatCurrency(aip.totalAmount)],
                ["Created By", aip.createdBy.name || aip.createdBy.email],
                ["Created Date", formatDateString(aip.createdAt)],
                ["Approved By", aip.approvedBy ? (aip.approvedBy.name || aip.approvedBy.email) : "Not Approved"],
                ["Approved Date", aip.approvedDate ? formatDateString(aip.approvedDate) : "Not Approved"],
                ["Description", aip.description || "No description provided"],
            ],
            theme: "striped",
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Calculate summary statistics
        const totalProjects = aip.projects.length;
        const completedProjects = aip.projects.filter(p => p.status === "COMPLETED").length;
        const ongoingProjects = aip.projects.filter(p => p.status === "ONGOING").length;
        const plannedProjects = aip.projects.filter(p => p.status === "PLANNED").length;
        const delayedProjects = aip.projects.filter(p => p.status === "DELAYED").length;
        const totalExpenditure = aip.projects.reduce(
            (sum, project) =>
                sum + project.expenses.reduce((s, e) => s + e.amount, 0),
            0
        );

        // Project status summary
        doc.setFontSize(16);
        doc.text("Project Status Overview", 20, doc.lastAutoTable.finalY + 20);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 30,
            head: [["Status", "Count", "Percentage"]],
            body: [
                ["Completed", completedProjects, `${totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0}%`],
                ["Ongoing", ongoingProjects, `${totalProjects ? Math.round((ongoingProjects / totalProjects) * 100) : 0}%`],
                ["Planned", plannedProjects, `${totalProjects ? Math.round((plannedProjects / totalProjects) * 100) : 0}%`],
                ["Delayed", delayedProjects, `${totalProjects ? Math.round((delayedProjects / totalProjects) * 100) : 0}%`],
                ["Total", totalProjects, "100%"],
            ],
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Budget utilization
        doc.setFontSize(16);
        doc.text("Budget Utilization", 20, doc.lastAutoTable.finalY + 20);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 30,
            head: [["Category", "Value"]],
            body: [
                ["Total Budget", formatCurrency(aip.totalAmount)],
                ["Total Expenditure", formatCurrency(totalExpenditure)],
                ["Remaining Budget", formatCurrency(aip.totalAmount - totalExpenditure)],
                ["Utilization Rate", `${aip.totalAmount ? Math.round((totalExpenditure / aip.totalAmount) * 100) : 0}%`],
            ],
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Projects Overview Page
        doc.addPage();
        doc.setFontSize(20);
        doc.text("2. Projects Overview", 20, 60);

        // Projects Summary
        doc.autoTable({
            startY: 70,
            head: [["Project Code", "Title", "Sector", "Budget", "Status"]],
            body: aip.projects.map(project => [
                project.projectCode,
                project.title,
                project.sector,
                formatCurrency(project.totalCost),
                project.status,
            ]),
            theme: "striped",
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Budget by sector
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

        doc.setFontSize(16);
        doc.text("Budget Allocation by Sector", 20, doc.lastAutoTable.finalY + 20);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 30,
            head: [["Sector", "Projects", "Budget", "Expenditure"]],
            body: projectsBySector.map(s => [
                s.sector,
                s.projectCount,
                formatCurrency(s.budget),
                formatCurrency(s.expenditure),
            ]),
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Budget Utilization Page
        doc.addPage();
        doc.setFontSize(20);
        doc.text("3. Budget Utilization", 20, 60);

        // Monthly expenditure
        // Group expenses by month
        const expenses = aip.projects.flatMap(p => p.expenses);
        const monthlyExpenses = new Map<string, number>();

        // Get the fiscal year start date and end date
        const fyStartDate = new Date(aip.fiscalYear.startDate);
        const fyEndDate = new Date(aip.fiscalYear.endDate);

        // Initialize all months with zero
        const currentDate = new Date(fyStartDate);
        while (currentDate <= fyEndDate) {
            const monthKey = format(currentDate, "MMM yyyy");
            monthlyExpenses.set(monthKey, 0);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Add up expenses by month
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = format(date, "MMM yyyy");

            if (monthlyExpenses.has(monthKey)) {
                monthlyExpenses.set(
                    monthKey,
                    (monthlyExpenses.get(monthKey) || 0) + expense.amount
                );
            }
        });

        // Convert map to sorted array
        const monthlyExpenditureData = Array.from(monthlyExpenses.entries())
            .sort((a, b) => {
                const dateA = new Date(a[0]);
                const dateB = new Date(b[0]);
                return dateA.getTime() - dateB.getTime();
            })
            .map(([month, amount]) => [month, formatCurrency(amount)]);

        doc.setFontSize(16);
        doc.text("Monthly Expenditure", 20, 70);

        doc.autoTable({
            startY: 80,
            head: [["Month", "Amount"]],
            body: monthlyExpenditureData,
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Budget by category
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
                utilized,
                remaining: allocated - utilized,
                utilization: allocated > 0 ? Math.round((utilized / allocated) * 100) : 0
            };
        });

        // Add a default "Total" category if no budget categories found
        if (budgetUtilization.length === 0) {
            budgetUtilization.push({
                category: "Total",
                allocated: aip.totalAmount,
                utilized: totalExpenditure,
                remaining: aip.totalAmount - totalExpenditure,
                utilization: aip.totalAmount > 0 ? Math.round((totalExpenditure / aip.totalAmount) * 100) : 0
            });
        }

        doc.setFontSize(16);
        doc.text("Budget Utilization by Category", 20, doc.lastAutoTable.finalY + 20);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 30,
            head: [["Category", "Allocated", "Utilized", "Remaining", "Utilization Rate"]],
            body: budgetUtilization.map(b => [
                b.category,
                formatCurrency(b.allocated),
                formatCurrency(b.utilized),
                formatCurrency(b.remaining),
                `${b.utilization}%`,
            ]),
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Project Details Page
        doc.addPage();
        doc.setFontSize(20);
        doc.text("4. Project Details", 20, 60);

        // For each project
        aip.projects.forEach((project, index) => {
            // Check if we need a new page
            if (index > 0) {
                doc.addPage();
            }

            doc.setFontSize(16);
            doc.text(`${project.projectCode}: ${project.title}`, 20, 70);

            // Project Summary
            doc.autoTable({
                startY: 80,
                head: [["Field", "Value"]],
                body: [
                    ["Sector", project.sector],
                    ["Status", project.status],
                    ["Budget", formatCurrency(project.totalCost)],
                    ["Location", project.location || "N/A"],
                    ["Start Date", formatDateString(project.startDate)],
                    ["End Date", formatDateString(project.endDate)],
                    ["Progress", `${project.progress}%`],
                    ["Fund Source", project.fundSource || "N/A"],
                    ["Budget Category", project.budgetCategory?.name || "Uncategorized"],
                    ["Description", project.description],
                ],
                theme: "striped",
                headStyles: { fillColor: [59, 130, 246] },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 140 },
                },
            });

            // If project has milestones
            if (project.milestones.length > 0) {
                doc.setFontSize(14);
                doc.text("Project Milestones", 20, doc.lastAutoTable.finalY + 20);

                doc.autoTable({
                    startY: doc.lastAutoTable.finalY + 30,
                    head: [["Title", "Status", "Due Date", "Completed"]],
                    body: project.milestones.map(m => [
                        m.title,
                        m.status,
                        formatDateString(m.dueDate),
                        m.completedAt ? formatDateString(m.completedAt) : "Not Completed",
                    ]),
                    theme: "grid",
                    headStyles: { fillColor: [59, 130, 246] },
                });
            }

            // If project has expenses
            if (project.expenses.length > 0) {
                doc.setFontSize(14);
                doc.text("Project Expenses", 20, doc.lastAutoTable.finalY + 20);

                doc.autoTable({
                    startY: doc.lastAutoTable.finalY + 30,
                    head: [["Date", "Description", "Amount", "Reference"]],
                    body: project.expenses.map(e => [
                        formatDateString(e.date),
                        e.description,
                        formatCurrency(e.amount),
                        e.reference || "N/A",
                    ]),
                    theme: "grid",
                    headStyles: { fillColor: [59, 130, 246] },
                });

                // Expense summary
                const totalExpense = project.expenses.reduce((sum, e) => sum + e.amount, 0);
                const remaining = project.totalCost - totalExpense;

                doc.autoTable({
                    startY: doc.lastAutoTable.finalY + 10,
                    body: [
                        ["Total Expenses", formatCurrency(totalExpense)],
                        ["Remaining Budget", formatCurrency(remaining)],
                        ["Budget Utilization", `${project.totalCost > 0 ? Math.round((totalExpense / project.totalCost) * 100) : 0}%`],
                    ],
                    theme: "plain",
                    styles: { fontStyle: "bold" },
                    columnStyles: {
                        0: { cellWidth: 100 },
                        1: { cellWidth: 80, halign: "right" },
                    },
                });
            }
        });

        // Add footer content to all pages except cover
        const addFooter = (pageNum: number) => {
            const footerHeight = 40; // Height reserved for footer
            const pageHeight = doc.internal.pageSize.height;

            // Check if content is too close to footer
            if (doc.lastAutoTable?.finalY && doc.lastAutoTable.finalY > pageHeight - footerHeight) {
                doc.addPage();
            }

            doc.setPage(pageNum);
            doc.setFontSize(10);

            // Move footer up by footerHeight
            const footerTop = pageHeight - footerHeight;

            // Page number
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${pageNum - 1} of ${pageCount - 1}`, doc.internal.pageSize.width / 2, footerTop + 10, {
                align: "center",
            });

            // Footer line
            doc.setDrawColor(200, 200, 200);
            doc.line(20, footerTop + 15, doc.internal.pageSize.width - 20, footerTop + 15);

            // Footer text
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);

            // Left side - Confidentiality
            doc.text("CONFIDENTIAL: This document contains sensitive financial information.", 20, footerTop + 20);

            // Center - Contact
            doc.text("Generated by BISIG Barangay Management System", doc.internal.pageSize.width / 2, footerTop + 20, {
                align: "center",
            });

            // Right side - Generated info
            doc.text(
                `Generated: ${format(new Date(), "MM/dd/yyyy h:mm a")}`,
                doc.internal.pageSize.width - 20,
                footerTop + 20,
                { align: "right" }
            );
        };

        // Update footer and watermark for all pages except cover
        const pageCount = doc.getNumberOfPages();
        for (let i = 2; i <= pageCount; i++) {
            // Add watermark
            doc.setPage(i);
            doc.setTextColor(230, 230, 230);
            doc.setFontSize(60);
            doc.text("BISIG", doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
                align: "center",
                angle: 45,
            });

            // Add footer
            addFooter(i);
        }

        // Generate PDF buffer
        const pdfBuffer = doc.output("arraybuffer");

        // Return the PDF as a download
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=aip-report-${aip.fiscalYear.year}.pdf`,
            },
        });
    } catch (error) {
        console.error("Error generating PDF report:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF report" },
            { status: 500 }
        );
    }
} 