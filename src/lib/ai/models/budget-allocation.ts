import { 
    Model, 
    BudgetAllocationPrediction, 
    ModelVersion, 
    validateNumericRange, 
    logModelOperation,
    TrainingMetadata
} from './index';
import prisma from '@/lib/prisma';
import { AnnualInvestmentProgram, AIPProject, AIPExpense } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

/**
 * Budget Allocation Model
 * 
 * Analyzes historical AIP data to recommend optimal budget allocations across sectors.
 * Uses a combination of historical patterns, sector impact scoring, and balance considerations.
 */
export class BudgetAllocationModel implements Model<BudgetAllocationPrediction> {
    // Model version information
    private version: ModelVersion = {
        major: 1,
        minor: 0,
        patch: 0,
        timestamp: new Date().toISOString(),
        description: "Initial production model for budget allocation recommendations"
    };

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

    // Coefficients for allocation formula, to be adjusted during training
    private modelCoefficients = {
        historicalWeight: 0.4,
        priorityWeight: 0.4,
        effectivenessWeight: 0.2,
        minAllocationPct: 5
    };
    
    // Stats for normalizing input features
    private normalizationStats: Record<string, { mean: number, stdDev: number }> = {};

    constructor() {
        // Load model parameters if available
        this.loadModel().catch(() => {
            console.log("No saved model found, using default parameters");
        });
    }

    /**
     * Get current model version
     */
    getVersion(): ModelVersion {
        return { ...this.version };
    }

    /**
     * Validate input data for prediction
     */
    validateInput(data: any): boolean {
        if (!data) return false;
        if (!data.aipId || typeof data.aipId !== 'string') return false;
        return true;
    }

    /**
     * Validate output prediction
     */
    validateOutput(prediction: BudgetAllocationPrediction): boolean {
        if (!prediction) return false;
        if (!validateNumericRange(prediction.confidence, 0, 1)) return false;
        if (!prediction.sectorAllocations || !Array.isArray(prediction.sectorAllocations)) return false;
        
        // Check that allocations sum to approximately 100%
        const totalAllocation = prediction.sectorAllocations.reduce(
            (sum, sector) => sum + sector.recommendedPercentage, 0
        );
        if (Math.abs(totalAllocation - 100) > 1) return false;
        
        return true;
    }

    /**
     * Predict optimal budget allocations based on historical data and current needs
     */
    async predict(data: { aipId: string; fiscalYear?: string }): Promise<BudgetAllocationPrediction> {
        const startTime = performance.now();
        
        // Validate input
        if (!this.validateInput(data)) {
            throw new Error("Invalid input data for budget allocation prediction");
        }

        const { aipId, fiscalYear } = data;

        try {
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

            const prediction = {
                confidence: 0.85, // Confidence level
                timestamp: new Date().toISOString(),
                source: `budget-allocation-model-v${this.version.major}.${this.version.minor}.${this.version.patch}`,
                sectorAllocations,
                overallRecommendation,
                executionTimeMs: performance.now() - startTime
            };

            // Validate output
            if (!this.validateOutput(prediction)) {
                throw new Error("Generated prediction failed validation");
            }

            // Log the prediction operation
            logModelOperation("BudgetAllocationModel", "predict", {
                aipId,
                executionTimeMs: prediction.executionTimeMs,
                confidence: prediction.confidence
            });

            return prediction;
        } catch (error) {
            logModelOperation("BudgetAllocationModel", "prediction_error", {
                error: error instanceof Error ? error.message : String(error),
                aipId
            });
            throw error;
        }
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
     * Train the model with historical AIP data
     */
    async train(data: { fiscalYears?: number[]; includeIncomplete?: boolean }): Promise<TrainingMetadata> {
        const startTime = new Date();
        let processedCount = 0;

        try {
            // Build the where conditions
            const whereCondition: any = {};
            
            // Add status filter if needed
            if (!data.includeIncomplete) {
                whereCondition.status = "COMPLETED";
            }
            
            // Fetch training data
            const trainingAIPs = await prisma.annualInvestmentProgram.findMany({
                where: whereCondition,
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
            });

            // Filter by fiscal years if needed
            let filteredAIPs = trainingAIPs;
            if (data.fiscalYears && data.fiscalYears.length > 0) {
                filteredAIPs = trainingAIPs.filter(aip => 
                    aip.fiscalYear && data.fiscalYears?.includes(Number(aip.fiscalYear.year))
                );
            }

            processedCount = filteredAIPs.length;
            if (processedCount === 0) {
                throw new Error("No training data available");
            }

            // Collect features for optimization
            const features: {
                historicalWeight: number;
                priorityWeight: number;
                effectivenessWeight: number;
                sectorWeights: Record<string, number>;
                performance: number;
            }[] = [];

            // Prepare cross-validation folds
            const folds = this.createCrossValidationFolds(filteredAIPs, 5);
            
            // Use grid search to find optimal parameters
            const historicalWeights = [0.3, 0.4, 0.5];
            const priorityWeights = [0.3, 0.4, 0.5];
            const effectivenessWeights = [0.1, 0.2, 0.3];

            // Try different combinations of parameters
            for (const historicalWeight of historicalWeights) {
                for (const priorityWeight of priorityWeights) {
                    // Ensure weights sum to 1
                    const effectivenessWeight = 1 - historicalWeight - priorityWeight;
                    if (effectivenessWeight < 0) continue;
                    
                    // Evaluate this parameter combination
                    const performance = await this.evaluateParameters({
                        historicalWeight,
                        priorityWeight,
                        effectivenessWeight
                    }, folds);
                    
                    features.push({
                        historicalWeight,
                        priorityWeight,
                        effectivenessWeight,
                        sectorWeights: { ...this.sectorWeights },
                        performance
                    });
                }
            }

            // Find best performing parameters
            const bestFeature = features.reduce((best, current) => 
                current.performance > best.performance ? current : best, 
                features[0]
            );

            // Update model parameters
            this.modelCoefficients = {
                historicalWeight: bestFeature.historicalWeight,
                priorityWeight: bestFeature.priorityWeight,
                effectivenessWeight: bestFeature.effectivenessWeight,
                minAllocationPct: this.modelCoefficients.minAllocationPct
            };

            // Update model version
            this.version = {
                ...this.version,
                minor: this.version.minor + 1,
                timestamp: new Date().toISOString(),
                description: `Model retrained with ${processedCount} samples`
            };

            // Calculate normalization stats
            this.calculateNormalizationStats(filteredAIPs);

            // Save the trained model
            await this.saveModel();

            const endTime = new Date();
            const trainingMetadata: TrainingMetadata = {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                samplesProcessed: processedCount,
                convergenceMetrics: {
                    finalPerformance: bestFeature.performance,
                    historicalWeight: bestFeature.historicalWeight,
                    priorityWeight: bestFeature.priorityWeight,
                    effectivenessWeight: bestFeature.effectivenessWeight
                },
                version: this.getVersion()
            };

            // Log training completion
            logModelOperation("BudgetAllocationModel", "training_complete", trainingMetadata);

            return trainingMetadata;
        } catch (error) {
            logModelOperation("BudgetAllocationModel", "training_error", {
                error: error instanceof Error ? error.message : String(error),
                processedSamples: processedCount
            });
            throw error;
        }
    }

    /**
     * Create cross-validation folds from the data
     */
    private createCrossValidationFolds(data: any[], k: number) {
        // Shuffle the data
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        
        // Create k approximately equal-sized folds
        const folds: any[][] = [];
        const foldSize = Math.floor(shuffled.length / k);
        
        for (let i = 0; i < k; i++) {
            const start = i * foldSize;
            const end = i === k - 1 ? shuffled.length : start + foldSize;
            folds.push(shuffled.slice(start, end));
        }
        
        return folds;
    }

    /**
     * Evaluate a set of parameters using cross-validation
     */
    private async evaluateParameters(
        params: { 
            historicalWeight: number; 
            priorityWeight: number; 
            effectivenessWeight: number; 
        }, 
        folds: any[][]
    ): Promise<number> {
        let totalPerformance = 0;
        
        // Save current parameters
        const originalParams = { ...this.modelCoefficients };
        
        // Set new parameters for evaluation
        this.modelCoefficients = {
            ...this.modelCoefficients,
            ...params
        };
        
        // Evaluate each fold
        for (let i = 0; i < folds.length; i++) {
            // Use current fold as validation, rest as training
            const validationFold = folds[i];
            const trainingFolds = folds.filter((_, index) => index !== i);
            const trainingData = trainingFolds.flat();
            
            // Evaluate performance on validation fold
            const foldPerformance = this.evaluateFold(trainingData, validationFold);
            totalPerformance += foldPerformance;
        }
        
        // Reset original parameters
        this.modelCoefficients = originalParams;
        
        // Return average performance across folds
        return totalPerformance / folds.length;
    }

    /**
     * Evaluate model performance on a single fold
     */
    private evaluateFold(trainingData: any[], validationData: any[]): number {
        // Simplified evaluation - in a real implementation, this would be more sophisticated
        let correctPredictions = 0;
        
        for (const aip of validationData) {
            // Use the model to predict allocations
            const historicalAllocations = this.analyzeHistoricalSectorAllocations(trainingData);
            const currentNeeds = this.analyzeCurrentNeeds(aip);
            
            // Generate recommendations
            const recommendations = this.generateSectorAllocations(
                aip.totalAmount,
                historicalAllocations,
                currentNeeds
            );
            
            // Compare with actual allocations
            const actualAllocations = this.getActualAllocations(aip);
            const similarity = this.calculateAllocationSimilarity(recommendations, actualAllocations);
            
            // Add to correct predictions based on similarity threshold
            if (similarity > 0.7) {
                correctPredictions++;
            }
        }
        
        return correctPredictions / validationData.length;
    }

    /**
     * Get actual allocations from an AIP
     */
    private getActualAllocations(aip: any): any[] {
        const totalBudget = aip.totalAmount;
        const sectorAllocations: { sector: string; percentage: number; amount: number }[] = [];
        const sectors = new Map<string, number>();
        
        // Group projects by sector and sum their costs
        aip.projects.forEach((project: any) => {
            const sector = project.sector || "Uncategorized";
            const currentAmount = sectors.get(sector) || 0;
            sectors.set(sector, currentAmount + project.totalCost);
        });
        
        // Calculate percentages
        sectors.forEach((amount, sector) => {
            sectorAllocations.push({
                sector,
                percentage: (amount / totalBudget) * 100,
                amount
            });
        });
        
        return sectorAllocations;
    }

    /**
     * Calculate similarity between recommended and actual allocations
     */
    private calculateAllocationSimilarity(
        recommended: { sector: string; recommendedPercentage: number }[],
        actual: { sector: string; percentage: number }[]
    ): number {
        // Create maps for easier comparison
        const recommendedMap = new Map(
            recommended.map(r => [r.sector, r.recommendedPercentage])
        );
        const actualMap = new Map(
            actual.map(a => [a.sector, a.percentage])
        );
        
        // Collect all sectors
        const allSectors = new Set([
            ...Array.from(recommendedMap.keys()),
            ...Array.from(actualMap.keys())
        ]);
        
        let totalDifference = 0;
        
        // Calculate sum of absolute differences
        allSectors.forEach(sector => {
            const recommendedPct = recommendedMap.get(sector) || 0;
            const actualPct = actualMap.get(sector) || 0;
            totalDifference += Math.abs(recommendedPct - actualPct);
        });
        
        // Normalize to 0-1 scale (0 = completely different, 1 = identical)
        return Math.max(0, 1 - (totalDifference / 200));
    }

    /**
     * Calculate normalization statistics for input features
     */
    private calculateNormalizationStats(data: any[]) {
        // Collect sector percentages across all AIPs
        const sectorPercentages: Record<string, number[]> = {};
        
        data.forEach(aip => {
            const totalBudget = aip.totalAmount;
            const sectors = new Map<string, number>();
            
            // Group projects by sector and sum their costs
            aip.projects.forEach((project: any) => {
                const sector = project.sector || "Uncategorized";
                const currentAmount = sectors.get(sector) || 0;
                sectors.set(sector, currentAmount + project.totalCost);
            });
            
            // Calculate percentages
            sectors.forEach((amount, sector) => {
                const percentage = (amount / totalBudget) * 100;
                if (!sectorPercentages[sector]) {
                    sectorPercentages[sector] = [];
                }
                sectorPercentages[sector].push(percentage);
            });
        });
        
        // Calculate mean and standard deviation for each sector
        Object.entries(sectorPercentages).forEach(([sector, values]) => {
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            
            this.normalizationStats[sector] = { mean, stdDev };
        });
    }

    /**
     * Evaluate model performance on test data
     */
    async evaluate(data: { aipIds: string[] }): Promise<{ accuracy: number, metrics: Record<string, number> }> {
        try {
            const { aipIds } = data;
            if (!aipIds || !Array.isArray(aipIds) || aipIds.length === 0) {
                throw new Error("Invalid evaluation data: aipIds must be a non-empty array");
            }

            // Get AIPs for evaluation
            const aips = await prisma.annualInvestmentProgram.findMany({
                where: {
                    id: { in: aipIds },
                    status: "COMPLETED" // Only evaluate on completed AIPs
                },
                include: {
                    projects: {
                        include: {
                            expenses: true,
                        },
                    },
                    fiscalYear: true,
                },
            });

            if (aips.length === 0) {
                throw new Error("No valid AIPs found for evaluation");
            }

            // Metrics to track
            let totalAllocSimilarity = 0;
            let totalSectorAccuracy = 0;
            let totalUtilizationError = 0;

            // Evaluate each AIP
            for (const aip of aips) {
                // Get actual allocations
                const actualAllocations = this.getActualAllocations(aip);
                
                // Generate predicted allocations without using this AIP's data
                const otherAips = aips.filter(a => a.id !== aip.id);
                const historicalAllocations = this.analyzeHistoricalSectorAllocations(otherAips);
                const currentNeeds = this.analyzeCurrentNeeds(aip);
                
                const predictedAllocations = this.generateSectorAllocations(
                    aip.totalAmount,
                    historicalAllocations,
                    currentNeeds
                );

                // Calculate allocation similarity
                const similarity = this.calculateAllocationSimilarity(
                    predictedAllocations,
                    actualAllocations
                );
                totalAllocSimilarity += similarity;

                // Calculate sector accuracy - how many sectors were correctly identified as important
                const actualTopSectors = actualAllocations
                    .sort((a, b) => b.percentage - a.percentage)
                    .slice(0, 3)
                    .map(s => s.sector);
                
                const predictedTopSectors = predictedAllocations
                    .sort((a, b) => b.recommendedPercentage - a.recommendedPercentage)
                    .slice(0, 3)
                    .map(s => s.sector);
                
                const matchingTopSectors = actualTopSectors.filter(
                    s => predictedTopSectors.includes(s)
                ).length;
                
                totalSectorAccuracy += matchingTopSectors / 3;
                
                // Calculate utilization error - for completed AIPs, check actual spend vs allocated
                const totalAllocated = aip.totalAmount;
                const totalSpent = aip.projects.reduce(
                    (sum, p) => sum + p.expenses.reduce((s, e) => s + e.amount, 0), 
                    0
                );
                
                const utilizationError = Math.abs(totalSpent - totalAllocated) / totalAllocated;
                totalUtilizationError += utilizationError;
            }

            // Calculate final metrics
            const accuracy = totalAllocSimilarity / aips.length;
            const sectorAccuracy = totalSectorAccuracy / aips.length;
            const utilizationError = totalUtilizationError / aips.length;
            const f1Score = 2 * (accuracy * sectorAccuracy) / (accuracy + sectorAccuracy);

            // Log evaluation results
            logModelOperation("BudgetAllocationModel", "evaluate", {
                aipCount: aips.length,
                accuracy,
                sectorAccuracy,
                utilizationError,
                f1Score
            });

            return {
                accuracy,
                metrics: {
                    sectorAccuracy,
                    utilizationError,
                    f1Score
                }
            };
        } catch (error) {
            logModelOperation("BudgetAllocationModel", "evaluation_error", {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Save model to disk
     */
    async saveModel(customPath?: string): Promise<void> {
        try {
            const modelDir = customPath || path.join(process.cwd(), 'data', 'models');
            
            // Ensure directory exists
            await fs.mkdir(modelDir, { recursive: true });
            
            const modelData = {
                version: this.version,
                sectorWeights: this.sectorWeights,
                modelCoefficients: this.modelCoefficients,
                normalizationStats: this.normalizationStats
            };
            
            const filePath = path.join(modelDir, 'budget-allocation-model.json');
            await fs.writeFile(filePath, JSON.stringify(modelData, null, 2));
            
            logModelOperation("BudgetAllocationModel", "model_saved", {
                path: filePath,
                version: this.version
            });
        } catch (error) {
            logModelOperation("BudgetAllocationModel", "save_model_error", {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Load model from disk
     */
    async loadModel(customPath?: string): Promise<void> {
        try {
            const modelDir = customPath || path.join(process.cwd(), 'data', 'models');
            const filePath = path.join(modelDir, 'budget-allocation-model.json');
            
            const modelData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
            
            this.version = modelData.version;
            this.sectorWeights = modelData.sectorWeights;
            this.modelCoefficients = modelData.modelCoefficients;
            this.normalizationStats = modelData.normalizationStats;
            
            logModelOperation("BudgetAllocationModel", "model_loaded", {
                path: filePath,
                version: this.version
            });
        } catch (error) {
            logModelOperation("BudgetAllocationModel", "load_model_error", {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
}

// Export model instance
export const budgetAllocationModel = new BudgetAllocationModel(); 