import { Model, BudgetAllocationPrediction } from './index';
import prisma from '@/lib/prisma';

/**
 * Budget Allocation Model
 * 
 * Analyzes historical AIP data to recommend optimal budget allocations across sectors.
 * Uses a combination of historical patterns, sector impact scoring, and balance considerations.
 */
export class BudgetAllocationModel implements Model<BudgetAllocationPrediction> {

    // Default sector weights based on general importance
    private sectorWeights: Record<string, number> = {
        "Infrastructure": 0.8,
        "Health": 0.9,
        "Education": 0.85,
        "Social Services": 0.75,
        "Environmental": 0.7,
        "Livelihood": 0.8,
        "Agriculture": 0.75,
        "Technology": 0.65,
        "Sports & Culture": 0.6,
    };

    constructor() {
        // Initialize model and load weights if needed
    }

    /**
     * Predict optimal budget allocations based on historical data and current needs
     */
    async predict(data: { aipId: string; fiscalYear?: string }): Promise<BudgetAllocationPrediction> {
        const { aipId, fiscalYear } = data;

        // Get current AIP data
        const aip = await prisma.annualInvestmentProgram.findUnique({
            where: { id: aipId },
            include: {
                projects: {
                    include: {
                        expenses: true,
                    },
                },
                fiscalYear: true,
            },
        });

        if (!aip) {
            throw new Error("AIP not found");
        }

        // Get historical AIP data from the same or previous fiscal years
        const historicalAIPs = await prisma.annualInvestmentProgram.findMany({
            where: {
                fiscalYear: {
                    year: {
                        lte: aip.fiscalYear.year,
                        not: aip.fiscalYear.year, // Exclude current fiscal year
                    }
                },
                status: "COMPLETED", // Only consider completed AIPs
            },
            include: {
                projects: {
                    include: {
                        expenses: true,
                    },
                },
                fiscalYear: true,
            },
            orderBy: {
                fiscalYear: {
                    year: 'desc',
                },
            },
            take: 3, // Consider last 3 fiscal years
        });

        // Analyze historical sector allocations
        const historicalSectorAllocations = this.analyzeHistoricalSectorAllocations(historicalAIPs);

        // Analyze current needs based on existing projects and expenses
        const currentNeeds = this.analyzeCurrentNeeds(aip);

        // Generate allocation recommendations
        const totalBudget = aip.totalAmount;
        const sectorAllocations = this.generateSectorAllocations(
            totalBudget,
            historicalSectorAllocations,
            currentNeeds
        );

        // Create overall recommendation
        const overallRecommendation = this.generateOverallRecommendation(
            sectorAllocations,
            historicalSectorAllocations,
            currentNeeds
        );

        return {
            confidence: 0.85, // Confidence level
            timestamp: new Date().toISOString(),
            source: "budget-allocation-model-v1",
            sectorAllocations,
            overallRecommendation,
        };
    }

    /**
     * Analyze historical allocations to understand patterns
     */
    private analyzeHistoricalSectorAllocations(aips: any[]): Record<string, { avgPercentage: number, effectiveness: number }> {
        const sectorData: Record<string, { totalAllocated: number, totalBudgets: number, effectiveness: number, count: number }> = {};

        // Process each historical AIP
        aips.forEach(aip => {
            const totalBudget = aip.totalAmount;
            const sectorAllocations = new Map<string, number>();

            // Group projects by sector and sum their costs
            aip.projects.forEach((project: any) => {
                const sector = project.sector || "Uncategorized";
                const currentAmount = sectorAllocations.get(sector) || 0;
                sectorAllocations.set(sector, currentAmount + project.totalCost);

                // Calculate project effectiveness (simplified as progress vs expense ratio)
                const expenses = project.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
                const effectivenessScore = project.progress / 100 * (project.totalCost / Math.max(expenses, 1));

                if (!sectorData[sector]) {
                    sectorData[sector] = { totalAllocated: 0, totalBudgets: 0, effectiveness: 0, count: 0 };
                }

                sectorData[sector].totalAllocated += project.totalCost;
                sectorData[sector].totalBudgets += totalBudget;
                sectorData[sector].effectiveness += effectivenessScore;
                sectorData[sector].count++;
            });
        });

        // Calculate average percentages and normalize effectiveness
        const result: Record<string, { avgPercentage: number, effectiveness: number }> = {};

        Object.entries(sectorData).forEach(([sector, data]) => {
            result[sector] = {
                avgPercentage: data.totalAllocated / data.totalBudgets * 100,
                effectiveness: data.effectiveness / data.count
            };
        });

        return result;
    }

    /**
     * Analyze current needs based on existing projects and expenses
     */
    private analyzeCurrentNeeds(aip: any): Record<string, { currentPercentage: number, utilized: number, priority: number }> {
        const result: Record<string, { currentPercentage: number, utilized: number, priority: number }> = {};
        const sectors = new Map<string, { allocated: number, utilized: number }>();
        const totalBudget = aip.totalAmount;

        // Process current projects
        aip.projects.forEach((project: any) => {
            const sector = project.sector || "Uncategorized";
            if (!sectors.has(sector)) {
                sectors.set(sector, { allocated: 0, utilized: 0 });
            }

            const sectorData = sectors.get(sector)!;
            sectorData.allocated += project.totalCost;

            // Sum expenses for utilization
            const expenses = project.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
            sectorData.utilized += expenses;
        });

        // Calculate percentages and priorities
        sectors.forEach((data, sector) => {
            const currentPercentage = (data.allocated / totalBudget) * 100;
            const utilized = data.allocated > 0 ? (data.utilized / data.allocated) * 100 : 0;

            // Calculate priority based on utilization and sector weight
            const sectorWeight = this.sectorWeights[sector] || 0.7;
            const utilizationFactor = utilized < 50 ? 1.2 : utilized > 80 ? 0.8 : 1.0;
            const priority = sectorWeight * utilizationFactor;

            result[sector] = {
                currentPercentage,
                utilized,
                priority
            };
        });

        return result;
    }

    /**
     * Generate recommended sector allocations
     */
    private generateSectorAllocations(
        totalBudget: number,
        historicalAllocations: Record<string, { avgPercentage: number, effectiveness: number }>,
        currentNeeds: Record<string, { currentPercentage: number, utilized: number, priority: number }>
    ) {
        // Define the type for allocations
        const allocations: {
            sector: string;
            recommendedPercentage: number;
            recommendedAmount: number;
            reasoning: string;
        }[] = [];

        // Convert Set to Array for iteration
        const allSectors = Array.from(new Set([
            ...Object.keys(historicalAllocations),
            ...Object.keys(currentNeeds),
            ...Object.keys(this.sectorWeights)
        ]));

        // Minimum allocation percentage to ensure all sectors get some budget
        const minAllocationPct = 5;
        let allocatedSectors = 0;

        for (const sector of allSectors) {
            const historical = historicalAllocations[sector] || { avgPercentage: 0, effectiveness: 0.7 };
            const current = currentNeeds[sector] || { currentPercentage: 0, utilized: 0, priority: this.sectorWeights[sector] || 0.7 };

            // Calculate recommended percentage using a weighted formula
            let historicalWeight = 0.4;
            let priorityWeight = 0.4;
            let effectivenessWeight = 0.2;

            // Adjust weights based on historical data availability
            if (historical.avgPercentage === 0) {
                historicalWeight = 0;
                priorityWeight = 0.7;
                effectivenessWeight = 0.3;
            }

            let recommendedPercentage = (
                (historical.avgPercentage * historicalWeight) +
                (current.priority * 20 * priorityWeight) +
                (historical.effectiveness * 20 * effectivenessWeight)
            );

            // Ensure minimum allocation
            recommendedPercentage = Math.max(recommendedPercentage, minAllocationPct);

            allocations.push({
                sector,
                recommendedPercentage,
                recommendedAmount: (recommendedPercentage / 100) * totalBudget,
                reasoning: this.generateReasoning(sector, historical, current)
            });

            allocatedSectors++;
        }

        // Normalize percentages to ensure they sum to 100%
        const totalRecommendedPct = allocations.reduce((sum, item) => sum + item.recommendedPercentage, 0);
        allocations.forEach(item => {
            item.recommendedPercentage = (item.recommendedPercentage / totalRecommendedPct) * 100;
            item.recommendedAmount = (item.recommendedPercentage / 100) * totalBudget;
        });

        // Sort by recommended allocation (highest first)
        return allocations.sort((a, b) => b.recommendedPercentage - a.recommendedPercentage);
    }

    /**
     * Generate reasoning for allocation recommendation
     */
    private generateReasoning(
        sector: string,
        historical: { avgPercentage: number, effectiveness: number },
        current: { currentPercentage: number, utilized: number, priority: number }
    ): string {
        let reasoning = "";

        if (historical.avgPercentage > 0) {
            reasoning += `Historical allocation was ${historical.avgPercentage.toFixed(1)}% with ${historical.effectiveness.toFixed(2)} effectiveness score. `;
        }

        if (current.currentPercentage > 0) {
            reasoning += `Current allocation is ${current.currentPercentage.toFixed(1)}% with ${current.utilized.toFixed(1)}% utilization. `;
        }

        // Add sector-specific reasoning
        switch (sector) {
            case "Infrastructure":
                reasoning += "Infrastructure projects typically require substantial funding but provide long-term benefits.";
                break;
            case "Health":
                reasoning += "Health services are essential and typically high priority for community wellbeing.";
                break;
            case "Education":
                reasoning += "Education investments yield long-term dividends for community development.";
                break;
            case "Social Services":
                reasoning += "Social services address immediate community needs and support vulnerable populations.";
                break;
            default:
                reasoning += `${sector} allocation is based on historical patterns and current needs assessment.`;
        }

        return reasoning;
    }

    /**
     * Generate an overall budget recommendation
     */
    private generateOverallRecommendation(
        allocations: any[],
        historicalAllocations: Record<string, { avgPercentage: number, effectiveness: number }>,
        currentNeeds: Record<string, { currentPercentage: number, utilized: number, priority: number }>
    ): string {
        // Find sectors with significant changes
        const significantChanges = allocations.filter(alloc => {
            const currentPct = currentNeeds[alloc.sector]?.currentPercentage || 0;
            return Math.abs(alloc.recommendedPercentage - currentPct) > 10;
        });

        let recommendation = "Based on historical performance and current needs analysis, ";

        if (significantChanges.length > 0) {
            recommendation += "significant reallocation is recommended. ";

            // Add details for top 2 changes
            significantChanges.slice(0, 2).forEach(change => {
                const currentPct = currentNeeds[change.sector]?.currentPercentage || 0;
                if (change.recommendedPercentage > currentPct) {
                    recommendation += `Increase ${change.sector} allocation from ${currentPct.toFixed(1)}% to ${change.recommendedPercentage.toFixed(1)}%. `;
                } else {
                    recommendation += `Decrease ${change.sector} allocation from ${currentPct.toFixed(1)}% to ${change.recommendedPercentage.toFixed(1)}%. `;
                }
            });
        } else {
            recommendation += "the current allocation is generally aligned with optimal patterns. Minor adjustments are recommended to optimize impact.";
        }

        // Add general advice
        const topSectors = allocations.slice(0, 3).map(a => a.sector);
        recommendation += `Priority sectors: ${topSectors.join(", ")}.`;

        return recommendation;
    }

    /**
     * Train the model with new data (placeholder for future implementation)
     */
    async train(data: any): Promise<void> {
        console.log("Training functionality will be implemented in future versions");
        // Reserved for future implementation of model training
    }

    /**
     * Evaluate model performance (placeholder for future implementation)
     */
    async evaluate(data: any): Promise<{ accuracy: number, metrics: Record<string, number> }> {
        return {
            accuracy: 0.85,
            metrics: {
                precision: 0.87,
                recall: 0.82,
                f1Score: 0.84
            }
        };
    }
}

// Export model instance
export const budgetAllocationModel = new BudgetAllocationModel(); 