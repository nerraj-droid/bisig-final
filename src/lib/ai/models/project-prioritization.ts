import { 
    Model, 
    ProjectPriorityPrediction, 
    ModelVersion, 
    logModelOperation,
    TrainingMetadata
} from './index';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

/**
 * Project Prioritization Model
 * 
 * Analyzes projects to determine which ones should be prioritized based on
 * impact, feasibility, cost-efficiency, and alignment with strategic goals.
 */
export class ProjectPrioritizationModel implements Model<ProjectPriorityPrediction> {
    // Model version information
    private version: ModelVersion = {
        major: 1,
        minor: 0,
        patch: 0,
        timestamp: new Date().toISOString(),
        description: "Initial project prioritization model"
    };

    // Model parameters
    private modelParameters = {
        // Impact weights
        impactWeights: {
            communityBenefit: 0.40,
            urgency: 0.30,
            strategicAlignment: 0.30
        },
        // Feasibility weights
        feasibilityWeights: {
            technicalComplexity: 0.35,
            resourceAvailability: 0.35, 
            timeConstraint: 0.30
        },
        // Cost efficiency weights
        costEfficiencyWeights: {
            returnOnInvestment: 0.40,
            budgetUtilization: 0.35,
            maintenanceCost: 0.25
        },
        // Overall scoring weights
        overallWeights: {
            impact: 0.40,
            feasibility: 0.35,
            costEfficiency: 0.25
        }
    };

    constructor() {
        // Load model parameters if available
        this.loadModel().catch(() => {
            console.log("No saved project prioritization model found, using default parameters");
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
     * Predict project priorities based on various factors
     */
    async predict(data: { aipId: string }): Promise<ProjectPriorityPrediction> {
        const startTime = performance.now();
        
        if (!this.validateInput(data)) {
            throw new Error("Invalid input data for project prioritization prediction");
        }

        try {
            const { aipId } = data;
            
            // Get AIP data with projects
            const aip = await prisma.annualInvestmentProgram.findUnique({
                where: { id: aipId },
                include: {
                    projects: {
                        include: {
                            expenses: true,
                            milestones: true
                        }
                    }
                }
            });

            if (!aip) {
                throw new Error("AIP not found");
            }

            // Calculate rankings for each project
            const projectRankings = await this.rankProjects(aip);
            
            // Generate focus recommendations based on rankings
            const recommendedFocus = this.generateFocusRecommendations(projectRankings);

            const prediction = {
                confidence: 0.80,
                timestamp: new Date().toISOString(),
                source: `project-prioritization-model-v${this.version.major}.${this.version.minor}.${this.version.patch}`,
                projectRankings,
                recommendedFocus,
                executionTimeMs: performance.now() - startTime
            };

            // Log the prediction operation
            logModelOperation("ProjectPrioritizationModel", "predict", {
                aipId,
                executionTimeMs: prediction.executionTimeMs,
                projectCount: projectRankings.length
            });

            return prediction;
        } catch (error) {
            logModelOperation("ProjectPrioritizationModel", "prediction_error", {
                error: error instanceof Error ? error.message : String(error),
                aipId: data.aipId
            });
            throw error;
        }
    }

    /**
     * Rank projects based on impact, feasibility and cost-efficiency
     */
    private async rankProjects(aip: any) {
        const totalBudget = aip.totalAmount;
        const projects = aip.projects;
        const rankings: Array<{
            projectId: string;
            score: number;
            priorityLevel: 'high' | 'medium' | 'low';
            impactScore: number;
            feasibilityScore: number;
            costEfficiencyScore: number;
        }> = [];

        for (const project of projects) {
            // Calculate impact score
            const impactScore = this.calculateImpactScore(project);
            
            // Calculate feasibility score
            const feasibilityScore = this.calculateFeasibilityScore(project);
            
            // Calculate cost efficiency score
            const costEfficiencyScore = this.calculateCostEfficiencyScore(project, totalBudget);
            
            // Calculate overall score
            const overallScore = (
                impactScore * this.modelParameters.overallWeights.impact +
                feasibilityScore * this.modelParameters.overallWeights.feasibility +
                costEfficiencyScore * this.modelParameters.overallWeights.costEfficiency
            );
            
            // Determine priority level
            let priorityLevel: 'high' | 'medium' | 'low';
            if (overallScore >= 0.7) {
                priorityLevel = 'high';
            } else if (overallScore >= 0.4) {
                priorityLevel = 'medium';
            } else {
                priorityLevel = 'low';
            }
            
            rankings.push({
                projectId: project.id,
                score: overallScore,
                priorityLevel,
                impactScore,
                feasibilityScore,
                costEfficiencyScore
            });
        }
        
        // Sort by score (highest first)
        return rankings.sort((a, b) => b.score - a.score);
    }

    /**
     * Calculate impact score for a project
     */
    private calculateImpactScore(project: any): number {
        // Proxy measures for impact components
        
        // Community benefit estimation
        const communityBenefit = project.beneficiaries ? 
            Math.min(project.beneficiaries / 1000, 1) : // Normalize to 0-1 scale
            0.5; // Default if not specified
        
        // Urgency based on start date proximity
        const now = new Date();
        const startDate = project.startDate ? new Date(project.startDate) : now;
        const timeUntilStart = Math.max(0, (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)); // days
        const urgency = Math.max(0, 1 - (timeUntilStart / 90)); // Higher urgency for projects starting soon
        
        // Strategic alignment based on sector importance
        const sectorImportanceMap: Record<string, number> = {
            "Infrastructure": 0.9,
            "Health": 0.95,
            "Education": 0.9,
            "Social Services": 0.85,
            "Environmental": 0.8,
            "Livelihood": 0.85,
            "Agriculture": 0.8,
            "Technology": 0.75,
            "Sports & Culture": 0.7,
        };
        const strategicAlignment = sectorImportanceMap[project.sector] || 0.7;
        
        // Weighted impact score
        return (
            communityBenefit * this.modelParameters.impactWeights.communityBenefit +
            urgency * this.modelParameters.impactWeights.urgency +
            strategicAlignment * this.modelParameters.impactWeights.strategicAlignment
        );
    }

    /**
     * Calculate feasibility score for a project
     */
    private calculateFeasibilityScore(project: any): number {
        // Technical complexity (inverse - lower complexity is more feasible)
        const complexityMap: Record<string, number> = {
            "LOW": 0.9,
            "MEDIUM": 0.6,
            "HIGH": 0.3,
        };
        const technicalComplexity = complexityMap[project.complexity] || 0.6;
        
        // Resource availability based on budget consumption
        const allocatedBudget = project.totalCost || 0;
        const consumedBudget = project.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
        const resourceAvailability = allocatedBudget > 0 ? 
            Math.min(1, (allocatedBudget - consumedBudget) / allocatedBudget) : 
            0.5;
        
        // Time constraint assessment
        let timeConstraint = 0.5; // Default
        if (project.endDate) {
            const now = new Date();
            const endDate = new Date(project.endDate);
            const remainingDays = Math.max(0, (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const totalDays = project.startDate ? 
                Math.max(1, (endDate.getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 
                90; // Default if no start date
            
            const progressRatio = project.progress ? project.progress / 100 : 0;
            const expectedProgress = 1 - (remainingDays / totalDays);
            
            // Higher score if project is ahead of schedule
            timeConstraint = Math.max(0, Math.min(1, 1 - (expectedProgress - progressRatio)));
        }
        
        // Weighted feasibility score
        return (
            technicalComplexity * this.modelParameters.feasibilityWeights.technicalComplexity +
            resourceAvailability * this.modelParameters.feasibilityWeights.resourceAvailability +
            timeConstraint * this.modelParameters.feasibilityWeights.timeConstraint
        );
    }

    /**
     * Calculate cost efficiency score for a project
     */
    private calculateCostEfficiencyScore(project: any, totalBudget: number): number {
        // Return on investment approximation
        const roi = project.expectedReturn ? 
            Math.min(project.expectedReturn / (project.totalCost || 1), 1) : 
            0.6; // Default if not specified
        
        // Budget utilization (smaller projects more efficient if all else equal)
        const budgetRatio = project.totalCost / Math.max(1, totalBudget);
        const budgetUtilization = 1 - Math.min(budgetRatio * 2, 1); // Smaller projects score higher
        
        // Maintenance cost consideration
        const maintenanceCost = project.maintenanceCost ? 
            1 - Math.min(project.maintenanceCost / (project.totalCost || 1), 1) : 
            0.7; // Default if not specified
        
        // Weighted cost efficiency score
        return (
            roi * this.modelParameters.costEfficiencyWeights.returnOnInvestment +
            budgetUtilization * this.modelParameters.costEfficiencyWeights.budgetUtilization +
            maintenanceCost * this.modelParameters.costEfficiencyWeights.maintenanceCost
        );
    }

    /**
     * Generate focus recommendations based on project rankings
     */
    private generateFocusRecommendations(rankings: any[]): string[] {
        const focusRecommendations: string[] = [];
        
        // Recommend focusing on high-priority projects
        const highPriorityProjects = rankings.filter(r => r.priorityLevel === 'high');
        if (highPriorityProjects.length > 0) {
            focusRecommendations.push(`Prioritize ${highPriorityProjects.length} high-impact projects`);
        }
        
        // Check for projects with high impact but low feasibility
        const highImpactLowFeasibility = rankings.filter(
            r => r.impactScore > 0.7 && r.feasibilityScore < 0.4
        );
        if (highImpactLowFeasibility.length > 0) {
            focusRecommendations.push(`Address feasibility issues in ${highImpactLowFeasibility.length} high-impact projects`);
        }
        
        // Check for projects with good scores but budget concerns
        const budgetConcerns = rankings.filter(
            r => r.score > 0.6 && r.costEfficiencyScore < 0.4
        );
        if (budgetConcerns.length > 0) {
            focusRecommendations.push(`Review budget allocations for ${budgetConcerns.length} otherwise promising projects`);
        }
        
        // Check for quick wins (high feasibility, good impact)
        const quickWins = rankings.filter(
            r => r.feasibilityScore > 0.7 && r.impactScore > 0.5
        );
        if (quickWins.length > 0) {
            focusRecommendations.push(`Fast-track ${quickWins.length} high-feasibility projects for quick wins`);
        }
        
        return focusRecommendations;
    }

    /**
     * Train the model with historical project data
     */
    async train(data: { fiscalYears?: number[]; completedProjectsOnly?: boolean }): Promise<TrainingMetadata> {
        const startTime = new Date();
        let processedCount = 0;

        try {
            // Build the where conditions
            const whereCondition: any = {};
            
            // Add status filter if needed
            if (data.completedProjectsOnly) {
                whereCondition.status = "COMPLETED";
            }

            // Query for historical projects
            const historicalProjects = await prisma.aIPProject.findMany({
                where: whereCondition,
                include: {
                    expenses: true,
                    milestones: true,
                    aip: {
                        include: {
                            fiscalYear: true
                        }
                    }
                }
            });

            // Filter by fiscal years if needed
            let filteredProjects = historicalProjects;
            if (data.fiscalYears && data.fiscalYears.length > 0) {
                filteredProjects = historicalProjects.filter(project => 
                    project.aip?.fiscalYear && 
                    data.fiscalYears?.includes(Number(project.aip.fiscalYear.year))
                );
            }

            processedCount = filteredProjects.length;
            if (processedCount === 0) {
                throw new Error("No training data available");
            }

            // Optimize model parameters based on historical data
            const optimizedParameters = this.optimizeModelParameters(filteredProjects);
            
            // Update model parameters
            this.modelParameters = optimizedParameters;
            
            // Update model version
            this.version = {
                ...this.version,
                minor: this.version.minor + 1,
                timestamp: new Date().toISOString(),
                description: `Model retrained with ${processedCount} projects`
            };
            
            // Save the trained model
            await this.saveModel();
            
            const endTime = new Date();
            const trainingMetadata: TrainingMetadata = {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                samplesProcessed: processedCount,
                convergenceMetrics: {
                    impactWeight: optimizedParameters.overallWeights.impact,
                    feasibilityWeight: optimizedParameters.overallWeights.feasibility,
                    costEfficiencyWeight: optimizedParameters.overallWeights.costEfficiency
                },
                version: this.getVersion()
            };
            
            // Log training completion
            logModelOperation("ProjectPrioritizationModel", "training_complete", trainingMetadata);
            
            return trainingMetadata;
        } catch (error) {
            logModelOperation("ProjectPrioritizationModel", "training_error", {
                error: error instanceof Error ? error.message : String(error),
                processedProjects: processedCount
            });
            throw error;
        }
    }

    /**
     * Optimize model parameters based on historical project data
     */
    private optimizeModelParameters(historicalProjects: any[]) {
        // Clone current parameters as starting point
        const params = JSON.parse(JSON.stringify(this.modelParameters));
        
        // Filter for completed projects to analyze success patterns
        const completedProjects = historicalProjects.filter(p => p.status === "COMPLETED");
        
        if (completedProjects.length > 0) {
            // Calculate success metrics for completed projects
            const successMetrics = completedProjects.map(project => {
                // Timeliness: completed on time or early
                const onTime = project.completedAt && project.endDate ? 
                    new Date(project.completedAt) <= new Date(project.endDate) : 
                    false;
                
                // Budget adherence: expenses within budget
                const totalExpenses = project.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
                const withinBudget = totalExpenses <= (project.totalCost * 1.05); // Allow 5% overrun
                
                // Milestone achievement: all milestones completed
                const milestonesCompleted = project.milestones.every((m: any) => m.status === "COMPLETED");
                
                // Quality proxy: no rework or substantial delays
                const noRework = !project.issues || !project.issues.includes("rework");
                
                // Overall success score (0-1)
                return {
                    projectId: project.id,
                    onTime: onTime ? 1 : 0,
                    withinBudget: withinBudget ? 1 : 0,
                    milestonesCompleted: milestonesCompleted ? 1 : 0,
                    noRework: noRework ? 1 : 0,
                    sector: project.sector,
                    complexity: project.complexity,
                    totalCost: project.totalCost,
                    successScore: (
                        (onTime ? 0.3 : 0) + 
                        (withinBudget ? 0.3 : 0) + 
                        (milestonesCompleted ? 0.2 : 0) + 
                        (noRework ? 0.2 : 0)
                    )
                };
            });
            
            // Analyze impact factors in successful projects
            const highSuccessProjects = successMetrics.filter(p => p.successScore >= 0.7);
            
            if (highSuccessProjects.length > 0) {
                // Extract success patterns for impact weights
                const sectorSuccessRate: Record<string, { count: number, totalScore: number }> = {};
                highSuccessProjects.forEach(project => {
                    const sector = project.sector || "Unknown";
                    if (!sectorSuccessRate[sector]) {
                        sectorSuccessRate[sector] = { count: 0, totalScore: 0 };
                    }
                    sectorSuccessRate[sector].count++;
                    sectorSuccessRate[sector].totalScore += project.successScore;
                });
                
                // Analyze correlation between factors and success
                const timelinessFactor = this.calculateCorrelation(
                    highSuccessProjects.map(p => p.onTime), 
                    highSuccessProjects.map(p => p.successScore)
                );
                
                const budgetFactor = this.calculateCorrelation(
                    highSuccessProjects.map(p => p.withinBudget), 
                    highSuccessProjects.map(p => p.successScore)
                );
                
                const milestoneFactor = this.calculateCorrelation(
                    highSuccessProjects.map(p => p.milestonesCompleted), 
                    highSuccessProjects.map(p => p.successScore)
                );
                
                // Adjust weights based on findings
                const factorSum = Math.abs(timelinessFactor) + Math.abs(budgetFactor) + Math.abs(milestoneFactor);
                
                if (factorSum > 0) {
                    // Adjust overall weights
                    const impactContribution = Math.max(0.2, Math.min(0.6, Math.abs(milestoneFactor) / factorSum));
                    const feasibilityContribution = Math.max(0.2, Math.min(0.6, Math.abs(timelinessFactor) / factorSum));
                    const costContribution = Math.max(0.2, Math.min(0.6, Math.abs(budgetFactor) / factorSum));
                    
                    const weightSum = impactContribution + feasibilityContribution + costContribution;
                    
                    params.overallWeights = {
                        impact: impactContribution / weightSum,
                        feasibility: feasibilityContribution / weightSum,
                        costEfficiency: costContribution / weightSum
                    };
                }
                
                // Update sector importance in impact weights
                Object.entries(sectorSuccessRate).forEach(([sector, data]) => {
                    const avgScore = data.totalScore / data.count;
                    const sectorImportance = Math.max(0.6, Math.min(0.95, avgScore));
                    
                    // Adjust strategicAlignment component
                    if (params.impactWeights.strategicAlignment >= 0.2) {
                        // We can't directly modify the sector mappings here since they're used in calculateImpactScore
                        // but we can adjust the weight of the strategicAlignment component
                        const sectorCount = Object.keys(sectorSuccessRate).length;
                        if (sectorCount > 1) {
                            // If we have data for multiple sectors, strategicAlignment becomes more important
                            params.impactWeights.strategicAlignment = Math.min(0.4, params.impactWeights.strategicAlignment + 0.05);
                            
                            // Rebalance other weights
                            const remainingWeight = 1 - params.impactWeights.strategicAlignment;
                            params.impactWeights.communityBenefit = remainingWeight * 0.6;
                            params.impactWeights.urgency = remainingWeight * 0.4;
                        }
                    }
                });
            }
            
            // Analyze complexity impact on feasibility
            const complexitySuccessRate: Record<string, { count: number, totalScore: number }> = {};
            successMetrics.forEach(project => {
                const complexity = project.complexity || "MEDIUM";
                if (!complexitySuccessRate[complexity]) {
                    complexitySuccessRate[complexity] = { count: 0, totalScore: 0 };
                }
                complexitySuccessRate[complexity].count++;
                complexitySuccessRate[complexity].totalScore += project.successScore;
            });
            
            // Calculate average success by complexity
            const complexityScores: Record<string, number> = {};
            Object.entries(complexitySuccessRate).forEach(([complexity, data]) => {
                complexityScores[complexity] = data.totalScore / data.count;
            });
            
            // If we have data for different complexity levels, adjust the weights
            if (Object.keys(complexityScores).length > 1) {
                // If high complexity projects have similar success to low complexity,
                // reduce the weight of technical complexity in feasibility
                const highScore = complexityScores["HIGH"] || 0;
                const lowScore = complexityScores["LOW"] || 0;
                
                if (highScore > 0 && lowScore > 0) {
                    const complexityImpact = Math.max(0, (lowScore - highScore) / lowScore);
                    
                    // Adjust complexity weight based on its actual impact
                    params.feasibilityWeights.technicalComplexity = Math.max(0.25, Math.min(0.45, 0.35 + (complexityImpact * 0.1)));
                    
                    // Rebalance other feasibility weights
                    const remainingWeight = 1 - params.feasibilityWeights.technicalComplexity;
                    params.feasibilityWeights.resourceAvailability = remainingWeight * 0.55;
                    params.feasibilityWeights.timeConstraint = remainingWeight * 0.45;
                }
            }
        }
        
        return params;
    }

    /**
     * Calculate correlation between two series
     */
    private calculateCorrelation(seriesA: number[], seriesB: number[]): number {
        const n = Math.min(seriesA.length, seriesB.length);
        if (n < 2) return 0;
        
        // Calculate means
        const meanA = seriesA.reduce((sum, val) => sum + val, 0) / n;
        const meanB = seriesB.reduce((sum, val) => sum + val, 0) / n;
        
        // Calculate covariance and variances
        let covariance = 0;
        let varianceA = 0;
        let varianceB = 0;
        
        for (let i = 0; i < n; i++) {
            const diffA = seriesA[i] - meanA;
            const diffB = seriesB[i] - meanB;
            covariance += diffA * diffB;
            varianceA += diffA * diffA;
            varianceB += diffB * diffB;
        }
        
        covariance /= n;
        varianceA /= n;
        varianceB /= n;
        
        // Calculate correlation coefficient
        const stdDevA = Math.sqrt(varianceA);
        const stdDevB = Math.sqrt(varianceB);
        
        if (stdDevA === 0 || stdDevB === 0) return 0;
        
        return covariance / (stdDevA * stdDevB);
    }

    /**
     * Evaluate model performance on test data
     */
    async evaluate(data: { projectIds: string[] }): Promise<{ accuracy: number, metrics: Record<string, number> }> {
        try {
            const { projectIds } = data;
            if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
                throw new Error("Invalid evaluation data: projectIds must be a non-empty array");
            }
            
            // Get test projects
            const testProjects = await prisma.aIPProject.findMany({
                where: {
                    id: { in: projectIds },
                    status: "COMPLETED" // Only evaluate completed projects
                },
                include: {
                    expenses: true,
                    milestones: true,
                    aip: true
                }
            });
            
            if (testProjects.length === 0) {
                throw new Error("No valid projects found for evaluation");
            }
            
            // Group projects by AIP
            const aipProjects = new Map<string, any[]>();
            testProjects.forEach(project => {
                const aipId = project.aipId;
                if (aipId && !aipProjects.has(aipId)) {
                    aipProjects.set(aipId, []);
                }
                if (aipId) {
                    aipProjects.get(aipId)?.push(project);
                }
            });
            
            // Evaluate each AIP
            let totalAccuracy = 0;
            let totalPrecision = 0;
            let totalRecall = 0;
            let aipCount = 0;
            
            for (const [aipId, projects] of Array.from(aipProjects.entries())) {
                // Get AIP details
                const aip = await prisma.annualInvestmentProgram.findUnique({
                    where: { id: aipId },
                    select: { totalAmount: true }
                });
                
                if (!aip) continue;
                
                // Calculate actual project success
                const actualSuccesses = projects.map(project => {
                    // Calculate success metrics (similar to training)
                    const onTime = project.completedAt && project.endDate ? 
                        new Date(project.completedAt) <= new Date(project.endDate) : 
                        false;
                    
                    const totalExpenses = project.expenses.reduce((sum, exp) => sum + exp.amount, 0);
                    const withinBudget = totalExpenses <= (project.totalCost * 1.05);
                    
                    const milestonesCompleted = project.milestones.every(m => m.status === "COMPLETED");
                    
                    const successScore = (
                        (onTime ? 0.3 : 0) + 
                        (withinBudget ? 0.3 : 0) + 
                        (milestonesCompleted ? 0.2 : 0) + 
                        (project.quality >= 0.7 ? 0.2 : 0)
                    );
                    
                    return {
                        projectId: project.id,
                        actualSuccess: successScore >= 0.7 // Consider success if score >= 0.7
                    };
                });
                
                // Generate predictions
                const predictions = await this.rankProjects({
                    totalAmount: aip.totalAmount,
                    projects
                });
                
                // Match predictions with actual results
                const combinedResults = predictions.map(pred => {
                    const actual = actualSuccesses.find(a => a.projectId === pred.projectId);
                    return {
                        projectId: pred.projectId,
                        predictedPriority: pred.priorityLevel === 'high',
                        actualSuccess: actual ? actual.actualSuccess : false
                    };
                });
                
                // Calculate metrics
                const truePositives = combinedResults.filter(r => r.predictedPriority && r.actualSuccess).length;
                const falsePositives = combinedResults.filter(r => r.predictedPriority && !r.actualSuccess).length;
                const falseNegatives = combinedResults.filter(r => !r.predictedPriority && r.actualSuccess).length;
                const trueNegatives = combinedResults.filter(r => !r.predictedPriority && !r.actualSuccess).length;
                
                const accuracy = (truePositives + trueNegatives) / combinedResults.length;
                const precision = truePositives / (truePositives + falsePositives) || 0;
                const recall = truePositives / (truePositives + falseNegatives) || 0;
                
                totalAccuracy += accuracy;
                totalPrecision += precision;
                totalRecall += recall;
                aipCount++;
            }
            
            // Calculate averages
            const avgAccuracy = totalAccuracy / aipCount;
            const avgPrecision = totalPrecision / aipCount;
            const avgRecall = totalRecall / aipCount;
            const f1Score = 2 * (avgPrecision * avgRecall) / (avgPrecision + avgRecall) || 0;
            
            // Log evaluation results
            logModelOperation("ProjectPrioritizationModel", "evaluate", {
                projectCount: testProjects.length,
                aipCount,
                accuracy: avgAccuracy,
                precision: avgPrecision,
                recall: avgRecall,
                f1Score
            });
            
            return {
                accuracy: avgAccuracy,
                metrics: {
                    precision: avgPrecision,
                    recall: avgRecall,
                    f1Score
                }
            };
        } catch (error) {
            logModelOperation("ProjectPrioritizationModel", "evaluation_error", {
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
            
            const filePath = path.join(modelDir, 'project-prioritization-model.json');
            await fs.writeFile(filePath, JSON.stringify(modelData, null, 2));
            
            logModelOperation("ProjectPrioritizationModel", "model_saved", {
                path: filePath,
                version: this.version
            });
        } catch (error) {
            logModelOperation("ProjectPrioritizationModel", "save_model_error", {
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
            const filePath = path.join(modelDir, 'project-prioritization-model.json');
            
            const modelData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
            
            this.version = modelData.version;
            this.modelParameters = modelData.modelParameters;
            
            logModelOperation("ProjectPrioritizationModel", "model_loaded", {
                path: filePath,
                version: this.version
            });
        } catch (error) {
            logModelOperation("ProjectPrioritizationModel", "load_model_error", {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
}

// Export model instance
export const projectPrioritizationModel = new ProjectPrioritizationModel(); 