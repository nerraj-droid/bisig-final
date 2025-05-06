import { 
    Model, 
    FinancialForecastPrediction, 
    ModelVersion, 
    logModelOperation,
    TrainingMetadata
} from './index';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

/**
 * Financial Forecast Model
 * 
 * Predicts financial trends and spending patterns based on historical data
 * and current execution rate.
 */
export class FinancialForecastModel implements Model<FinancialForecastPrediction> {
    // Model version information
    private version: ModelVersion = {
        major: 1,
        minor: 0,
        patch: 0,
        timestamp: new Date().toISOString(),
        description: "Initial financial forecast model"
    };

    // Model parameters for financial forecasting
    private modelParameters = {
        // Seasonality patterns (spending by month)
        seasonalityFactors: [0.05, 0.08, 0.10, 0.12, 0.15, 0.13, 0.08, 0.07, 0.06, 0.06, 0.05, 0.05],
        // Anomaly detection thresholds
        anomalyThresholds: {
            lowSpending: 0.3,  // Below 30% of expected is suspicious
            highSpending: 1.7  // Above 170% of expected is suspicious
        },
        // Year-end projection factors
        yearEndFactors: {
            underspendRiskFactor: 0.8,  // Below 80% at halfway point indicates underspend risk
            overspendRiskFactor: 1.2    // Above 120% at halfway point indicates overspend risk
        }
    };

    constructor() {
        // Load model parameters if available
        this.loadModel().catch(() => {
            console.log("No saved financial forecast model found, using default parameters");
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
     * Predict financial trends for the AIP
     */
    async predict(data: { aipId: string }): Promise<FinancialForecastPrediction> {
        const startTime = performance.now();

        if (!this.validateInput(data)) {
            throw new Error("Invalid input data for financial forecast prediction");
        }

        try {
            const { aipId } = data;
            
            // Get AIP data with projects and expenses
            const aip = await prisma.annualInvestmentProgram.findUnique({
                where: { id: aipId },
                include: {
                    projects: {
                        include: {
                            expenses: true
                        }
                    },
                    fiscalYear: true
                }
            });

            if (!aip) {
                throw new Error("AIP not found");
            }

            // Generate monthly projections
            const monthlyProjections = await this.generateMonthlyProjections(aip);
            
            // Calculate year-end projection
            const yearEndProjection = this.calculateYearEndProjection(aip, monthlyProjections);

            const prediction = {
                confidence: 0.75,
                timestamp: new Date().toISOString(),
                source: `financial-forecast-model-v${this.version.major}.${this.version.minor}.${this.version.patch}`,
                monthlyProjections,
                yearEndProjection,
                executionTimeMs: performance.now() - startTime
            };

            // Log the prediction operation
            logModelOperation("FinancialForecastModel", "predict", {
                aipId,
                executionTimeMs: prediction.executionTimeMs
            });

            return prediction;
        } catch (error) {
            logModelOperation("FinancialForecastModel", "prediction_error", {
                error: error instanceof Error ? error.message : String(error),
                aipId: data.aipId
            });
            throw error;
        }
    }

    /**
     * Generate monthly projections for expenses and remaining budget
     */
    private async generateMonthlyProjections(aip: any) {
        const totalBudget = aip.totalAmount;
        const currentMonth = new Date().getMonth();
        const fiscalYear = aip.fiscalYear.year;
        
        // Get all expenses grouped by month
        const expenses = this.getExpensesByMonth(aip);
        
        // Calculate total spent so far
        const totalSpent = Object.values(expenses).reduce((sum: number, exp: number) => sum + exp, 0);
        const remainingBudget = totalBudget - totalSpent;
        
        // Generate projections for each month
        const projections: Array<{
            month: number;
            projectedExpenditure: number;
            projectedRemaining: number;
            anomalyRisk: number;
        }> = [];
        
        for (let month = 0; month < 12; month++) {
            // For past months, use actual spending
            if (month <= currentMonth) {
                const actual = expenses[month] || 0;
                const projectedRemaining = month === currentMonth ? 
                    remainingBudget : 
                    totalBudget - Object.entries(expenses)
                        .filter(([m]) => parseInt(m) <= month)
                        .reduce((sum, [_, exp]) => sum + exp, 0);
                
                // Calculate anomaly risk for past months
                const expectedSpending = totalBudget * this.modelParameters.seasonalityFactors[month];
                const spendingRatio = actual / Math.max(1, expectedSpending);
                const anomalyRisk = this.calculateAnomalyRisk(spendingRatio);
                
                projections.push({
                    month: month + 1,
                    projectedExpenditure: actual,
                    projectedRemaining,
                    anomalyRisk
                });
            } 
            // For future months, project spending based on patterns
            else {
                // Calculate expected spending for this month based on seasonality
                const expectedMonthlyPercentage = this.modelParameters.seasonalityFactors[month];
                const expectedSpending = totalBudget * expectedMonthlyPercentage;
                
                // Adjust based on current spending pattern
                const spendingRatio = totalSpent / (
                    totalBudget * this.modelParameters.seasonalityFactors
                        .slice(0, currentMonth + 1)
                        .reduce((sum, factor) => sum + factor, 0)
                );
                
                const adjustedSpending = expectedSpending * spendingRatio;
                
                // Calculate running total for remaining budget
                const previousMonthsProjected = projections.reduce(
                    (sum, proj) => sum + proj.projectedExpenditure, 0
                );
                const projectedRemaining = totalBudget - (previousMonthsProjected + adjustedSpending);
                
                // Calculate anomaly risk based on deviation from expected pattern
                const anomalyRisk = Math.min(1, Math.abs(spendingRatio - 1) * 0.5);
                
                projections.push({
                    month: month + 1,
                    projectedExpenditure: adjustedSpending,
                    projectedRemaining: Math.max(0, projectedRemaining),
                    anomalyRisk
                });
            }
        }
        
        return projections;
    }

    /**
     * Calculate year-end projection based on current spending patterns
     */
    private calculateYearEndProjection(aip: any, monthlyProjections: any[]) {
        const totalBudget = aip.totalAmount;
        const currentMonth = new Date().getMonth();
        
        // Calculate projected total expenditure by year-end
        const projectedTotalExpenditure = monthlyProjections.reduce(
            (sum, month) => sum + month.projectedExpenditure, 0
        );
        
        // Calculate expected utilization percentage
        const expectedUtilization = projectedTotalExpenditure / totalBudget;
        
        // Calculate risk of over/underspending
        
        // Overspend risk increases if:
        // - Current spending is ahead of expected rate
        // - Anomaly risk in future months is high
        // - Projects have history of going over budget
        const currentSpending = monthlyProjections
            .filter(m => m.month <= currentMonth + 1)
            .reduce((sum, m) => sum + m.projectedExpenditure, 0);
        
        const expectedSpendingToDate = totalBudget * this.modelParameters.seasonalityFactors
            .slice(0, currentMonth + 1)
            .reduce((sum, factor) => sum + factor, 0);
        
        const spendingRatio = currentSpending / Math.max(1, expectedSpendingToDate);
        
        // Risk of overspend
        let riskOfOverspend = 0;
        if (spendingRatio > this.modelParameters.yearEndFactors.overspendRiskFactor) {
            riskOfOverspend = Math.min(1, (spendingRatio - 1) * 2);
        }
        
        // Additional risk if projected total exceeds budget
        if (projectedTotalExpenditure > totalBudget) {
            riskOfOverspend = Math.max(riskOfOverspend, 
                Math.min(1, (projectedTotalExpenditure / totalBudget - 1) * 2)
            );
        }
        
        // Risk of underspend
        let riskOfUnderspend = 0;
        if (spendingRatio < this.modelParameters.yearEndFactors.underspendRiskFactor) {
            riskOfUnderspend = Math.min(1, (1 - spendingRatio) * 2);
        }
        
        // Additional risk if projected total is significantly under budget
        if (projectedTotalExpenditure < totalBudget * 0.9) {
            riskOfUnderspend = Math.max(riskOfUnderspend, 
                Math.min(1, (1 - projectedTotalExpenditure / totalBudget) * 2)
            );
        }
        
        return {
            expectedUtilization,
            riskOfOverspend,
            riskOfUnderspend
        };
    }

    /**
     * Get expenses aggregated by month from AIP data
     */
    private getExpensesByMonth(aip: any) {
        const expensesByMonth: Record<number, number> = {};
        
        // Process all expenses from all projects
        aip.projects.forEach((project: any) => {
            project.expenses.forEach((expense: any) => {
                if (expense.date) {
                    const expenseDate = new Date(expense.date);
                    const month = expenseDate.getMonth();
                    expensesByMonth[month] = (expensesByMonth[month] || 0) + expense.amount;
                }
            });
        });
        
        return expensesByMonth;
    }

    /**
     * Calculate anomaly risk based on spending ratio
     */
    private calculateAnomalyRisk(spendingRatio: number): number {
        if (spendingRatio < this.modelParameters.anomalyThresholds.lowSpending) {
            // Risk increases as spending falls below threshold
            return Math.min(1, (this.modelParameters.anomalyThresholds.lowSpending - spendingRatio) * 2);
        } else if (spendingRatio > this.modelParameters.anomalyThresholds.highSpending) {
            // Risk increases as spending exceeds threshold
            return Math.min(1, (spendingRatio - this.modelParameters.anomalyThresholds.highSpending) * 2);
        } else {
            // Normal spending range
            return Math.min(0.3, Math.abs(spendingRatio - 1) * 0.5);
        }
    }

    /**
     * Train the model with historical financial data
     */
    async train(data: { fiscalYears?: number[]; completedAIPsOnly?: boolean }): Promise<TrainingMetadata> {
        const startTime = new Date();
        let processedCount = 0;

        try {
            // Build the where conditions
            const whereCondition: any = {};
            
            // Add status filter if needed
            if (data.completedAIPsOnly) {
                whereCondition.status = "COMPLETED";
            }
            
            // Query for historical AIPs
            const historicalAIPs = await prisma.annualInvestmentProgram.findMany({
                where: whereCondition,
                include: {
                    projects: {
                        include: {
                            expenses: true
                        }
                    },
                    fiscalYear: true
                },
                orderBy: {
                    fiscalYear: {
                        year: 'desc'
                    }
                }
            });

            // Filter by fiscal years if needed
            let filteredAIPs = historicalAIPs;
            if (data.fiscalYears && data.fiscalYears.length > 0) {
                filteredAIPs = historicalAIPs.filter(aip => 
                    aip.fiscalYear && data.fiscalYears?.includes(Number(aip.fiscalYear.year))
                );
            }

            processedCount = filteredAIPs.length;
            if (processedCount === 0) {
                throw new Error("No training data available");
            }

            // Optimize seasonality patterns based on historical data
            const optimizedParameters = this.optimizeModelParameters(filteredAIPs);
            
            // Update model parameters
            this.modelParameters = optimizedParameters;
            
            // Update model version
            this.version = {
                ...this.version,
                minor: this.version.minor + 1,
                timestamp: new Date().toISOString(),
                description: `Model retrained with ${processedCount} AIPs`
            };
            
            // Save the trained model
            await this.saveModel();
            
            const endTime = new Date();
            const trainingMetadata: TrainingMetadata = {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                samplesProcessed: processedCount,
                convergenceMetrics: {
                    seasonalityFactorSum: optimizedParameters.seasonalityFactors.reduce((sum, factor) => sum + factor, 0),
                    anomalyLowThreshold: optimizedParameters.anomalyThresholds.lowSpending,
                    anomalyHighThreshold: optimizedParameters.anomalyThresholds.highSpending
                },
                version: this.getVersion()
            };
            
            // Log training completion
            logModelOperation("FinancialForecastModel", "training_complete", trainingMetadata);
            
            return trainingMetadata;
        } catch (error) {
            logModelOperation("FinancialForecastModel", "training_error", {
                error: error instanceof Error ? error.message : String(error),
                processedAIPs: processedCount
            });
            throw error;
        }
    }

    /**
     * Optimize model parameters based on historical AIP data
     */
    private optimizeModelParameters(historicalAIPs: any[]) {
        // Clone current parameters as starting point
        const params = JSON.parse(JSON.stringify(this.modelParameters));
        
        // Only use completed AIPs for parameter optimization
        const completedAIPs = historicalAIPs.filter(aip => aip.status === "COMPLETED");
        
        if (completedAIPs.length > 0) {
            // Calculate monthly spending patterns
            const expensesByMonth: number[] = Array(12).fill(0);
            const aipsByMonth: number[] = Array(12).fill(0);
            
            completedAIPs.forEach(aip => {
                const totalBudget = aip.totalAmount;
                const expenseMonths: Record<number, number> = {};
                
                // Aggregate expenses by month
                aip.projects.forEach((project: any) => {
                    project.expenses.forEach((expense: any) => {
                        if (expense.date) {
                            const expenseDate = new Date(expense.date);
                            const month = expenseDate.getMonth();
                            expenseMonths[month] = (expenseMonths[month] || 0) + expense.amount;
                        }
                    });
                });
                
                // Calculate percentage of total budget spent each month
                Object.entries(expenseMonths).forEach(([monthStr, amount]) => {
                    const month = parseInt(monthStr);
                    expensesByMonth[month] += amount / totalBudget;
                    aipsByMonth[month]++;
                });
            });
            
            // Calculate average spending percentage for each month
            const newSeasonalityFactors = expensesByMonth.map((total, month) => {
                if (aipsByMonth[month] === 0) return params.seasonalityFactors[month];
                return total / aipsByMonth[month];
            });
            
            // Normalize seasonality factors to sum to 1
            const factorSum = newSeasonalityFactors.reduce((sum, factor) => sum + factor, 0);
            if (factorSum > 0) {
                params.seasonalityFactors = newSeasonalityFactors.map(factor => factor / factorSum);
            }
            
            // Calculate anomaly thresholds based on historical patterns
            // Collect spending ratio data
            const spendingRatios: number[] = [];
            
            completedAIPs.forEach(aip => {
                const totalBudget = aip.totalAmount;
                const monthlySpendings: Record<number, number> = {};
                
                // Aggregate expenses by month
                aip.projects.forEach((project: any) => {
                    project.expenses.forEach((expense: any) => {
                        if (expense.date) {
                            const expenseDate = new Date(expense.date);
                            const month = expenseDate.getMonth();
                            monthlySpendings[month] = (monthlySpendings[month] || 0) + expense.amount;
                        }
                    });
                });
                
                // Calculate spending ratios for each month
                Object.entries(monthlySpendings).forEach(([monthStr, amount]) => {
                    const month = parseInt(monthStr);
                    const expectedSpending = totalBudget * params.seasonalityFactors[month];
                    if (expectedSpending > 0) {
                        spendingRatios.push(amount / expectedSpending);
                    }
                });
            });
            
            // Calculate anomaly thresholds based on distribution of ratios
            if (spendingRatios.length > 0) {
                // Sort ratios for percentile calculation
                spendingRatios.sort((a, b) => a - b);
                
                // Use 10th percentile for low threshold
                const lowIndex = Math.floor(spendingRatios.length * 0.1);
                const lowThreshold = spendingRatios[lowIndex];
                
                // Use 90th percentile for high threshold
                const highIndex = Math.floor(spendingRatios.length * 0.9);
                const highThreshold = spendingRatios[highIndex];
                
                // Update thresholds with some safety margins
                params.anomalyThresholds.lowSpending = Math.max(0.1, lowThreshold * 0.9);
                params.anomalyThresholds.highSpending = Math.min(3.0, highThreshold * 1.1);
            }
            
            // Optimize year-end factors
            // This is more complex and would require historical projections vs actuals
            // For simplicity, we'll just adjust based on observed spending patterns
            if (spendingRatios.length > 0) {
                // Calculate mean and standard deviation
                const mean = spendingRatios.reduce((sum, ratio) => sum + ratio, 0) / spendingRatios.length;
                const variance = spendingRatios.reduce((sum, ratio) => sum + Math.pow(ratio - mean, 2), 0) / spendingRatios.length;
                const stdDev = Math.sqrt(variance);
                
                // Adjust year-end factors based on observed variability
                params.yearEndFactors.underspendRiskFactor = Math.max(0.5, mean - stdDev);
                params.yearEndFactors.overspendRiskFactor = Math.min(1.5, mean + stdDev);
            }
        }
        
        return params;
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
            
            // Get test AIPs
            const testAIPs = await prisma.annualInvestmentProgram.findMany({
                where: {
                    id: { in: aipIds },
                    status: "COMPLETED" // Only evaluate completed AIPs
                },
                include: {
                    projects: {
                        include: {
                            expenses: true
                        }
                    },
                    fiscalYear: true
                }
            });
            
            if (testAIPs.length === 0) {
                throw new Error("No valid AIPs found for evaluation");
            }
            
            // Metrics to track
            let totalMAE = 0; // Mean Absolute Error
            let totalUtilizationAccuracy = 0;
            let totalAnomalyPrecision = 0;
            let totalAnomalyRecall = 0;
            
            // Evaluate each AIP
            for (const aip of testAIPs) {
                // Split expenses by months for ground truth
                const actualExpensesByMonth: Record<number, number> = {};
                const actualAnomaliesByMonth: Record<number, boolean> = {};
                
                // Get actual expenses by month
                aip.projects.forEach((project: any) => {
                    project.expenses.forEach((expense: any) => {
                        if (expense.date) {
                            const expenseDate = new Date(expense.date);
                            const month = expenseDate.getMonth();
                            actualExpensesByMonth[month] = (actualExpensesByMonth[month] || 0) + expense.amount;
                        }
                    });
                });
                
                // Calculate actual anomalies based on significant deviations
                const totalBudget = aip.totalAmount;
                const expectedMonthlySpending = Array(12).fill(0).map((_, i) => 
                    totalBudget * this.modelParameters.seasonalityFactors[i]
                );
                
                // Mark actual anomalies
                Object.entries(actualExpensesByMonth).forEach(([monthStr, amount]) => {
                    const month = parseInt(monthStr);
                    const expected = expectedMonthlySpending[month];
                    const ratio = amount / Math.max(1, expected);
                    
                    actualAnomaliesByMonth[month] = (
                        ratio < this.modelParameters.anomalyThresholds.lowSpending || 
                        ratio > this.modelParameters.anomalyThresholds.highSpending
                    );
                });
                
                // Simulate partial-year data to test predictions
                for (let testMonth = 3; testMonth < 12; testMonth++) {
                    // Create a partial AIP with data only up to testMonth
                    const partialAip = JSON.parse(JSON.stringify(aip));
                    
                    // Filter expenses to include only those up to testMonth
                    partialAip.projects.forEach((project: any) => {
                        project.expenses = project.expenses.filter((expense: any) => {
                            if (!expense.date) return false;
                            const expenseDate = new Date(expense.date);
                            return expenseDate.getMonth() <= testMonth;
                        });
                    });
                    
                    // Generate predictions based on partial data
                    const monthlyProjections = await this.generateMonthlyProjections(partialAip);
                    
                    // Compare predictions with actuals for remaining months
                    for (let month = testMonth + 1; month < 12; month++) {
                        if (monthlyProjections[month]) {
                            const projectedExpenditure = monthlyProjections[month].projectedExpenditure;
                            const actualExpenditure = actualExpensesByMonth[month] || 0;
                            
                            // Calculate error
                            const absoluteError = Math.abs(projectedExpenditure - actualExpenditure);
                            const percentError = actualExpenditure > 0 ? 
                                absoluteError / actualExpenditure : 
                                absoluteError > 0 ? 1 : 0;
                            
                            totalMAE += percentError;
                            
                            // Evaluate anomaly detection
                            const predictedAnomaly = monthlyProjections[month].anomalyRisk > 0.6;
                            const actualAnomaly = actualAnomaliesByMonth[month] || false;
                            
                            // Count true positives, false positives, false negatives
                            if (predictedAnomaly && actualAnomaly) {
                                totalAnomalyPrecision++;
                                totalAnomalyRecall++;
                            } else if (predictedAnomaly && !actualAnomaly) {
                                totalAnomalyPrecision++; // Denominator increment only
                            } else if (!predictedAnomaly && actualAnomaly) {
                                totalAnomalyRecall++; // Denominator increment only
                            }
                        }
                    }
                    
                    // Test year-end projection accuracy
                    const yearEndProjection = this.calculateYearEndProjection(partialAip, monthlyProjections);
                    const actualUtilization = Object.values(actualExpensesByMonth)
                        .reduce((sum, amount) => sum + amount, 0) / totalBudget;
                    
                    // Calculate utilization prediction accuracy
                    const utilizationError = Math.abs(yearEndProjection.expectedUtilization - actualUtilization);
                    totalUtilizationAccuracy += (1 - Math.min(1, utilizationError));
                }
            }
            
            // Calculate final metrics
            const totalPredictions = testAIPs.length * 8; // ~8 months predicted per AIP
            const accuracy = 1 - (totalMAE / totalPredictions);
            const utilizationAccuracy = totalUtilizationAccuracy / testAIPs.length;
            
            // Anomaly metrics - precision and recall
            const anomalyPrecision = totalAnomalyPrecision > 0 ? 
                totalAnomalyPrecision / (totalAnomalyPrecision + totalAnomalyRecall) : 
                0;
            
            const anomalyRecall = totalAnomalyRecall > 0 ? 
                totalAnomalyRecall / (totalAnomalyPrecision + totalAnomalyRecall) : 
                0;
                
            const f1Score = anomalyPrecision > 0 && anomalyRecall > 0 ? 
                2 * (anomalyPrecision * anomalyRecall) / (anomalyPrecision + anomalyRecall) : 
                0;
            
            // Log evaluation results
            logModelOperation("FinancialForecastModel", "evaluate", {
                aipCount: testAIPs.length,
                accuracy,
                utilizationAccuracy,
                anomalyPrecision,
                anomalyRecall,
                f1Score
            });
            
            return {
                accuracy,
                metrics: {
                    utilizationAccuracy,
                    anomalyPrecision,
                    anomalyRecall,
                    f1Score
                }
            };
        } catch (error) {
            logModelOperation("FinancialForecastModel", "evaluation_error", {
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
                modelParameters: this.modelParameters
            };
            
            const filePath = path.join(modelDir, 'financial-forecast-model.json');
            await fs.writeFile(filePath, JSON.stringify(modelData, null, 2));
            
            logModelOperation("FinancialForecastModel", "model_saved", {
                path: filePath,
                version: this.version
            });
        } catch (error) {
            logModelOperation("FinancialForecastModel", "save_model_error", {
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
            const filePath = path.join(modelDir, 'financial-forecast-model.json');
            
            const modelData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
            
            this.version = modelData.version;
            this.modelParameters = modelData.modelParameters;
            
            logModelOperation("FinancialForecastModel", "model_loaded", {
                path: filePath,
                version: this.version
            });
        } catch (error) {
            logModelOperation("FinancialForecastModel", "load_model_error", {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
}

// Export model instance
export const financialForecastModel = new FinancialForecastModel(); 