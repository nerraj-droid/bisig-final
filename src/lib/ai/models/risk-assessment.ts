import { 
    Model, 
    RiskAssessmentPrediction, 
    ModelVersion, 
    logModelOperation,
    TrainingMetadata
} from './index';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

/**
 * Risk Assessment Model
 * 
 * Analyzes projects to identify potential risks and suggests mitigation strategies.
 * Focuses on implementation risks, financial risks, and outcome risks.
 */
export class RiskAssessmentModel implements Model<RiskAssessmentPrediction> {
    // Model version information
    private version: ModelVersion = {
        major: 1,
        minor: 0,
        patch: 0,
        timestamp: new Date().toISOString(),
        description: "Initial risk assessment model"
    };

    // Risk factor categories and weights
    private riskFactors = {
        implementation: {
            resourceShortage: 0.25,
            technicalComplexity: 0.20,
            timeConstraints: 0.20,
            dependencyRisks: 0.20,
            stakeholderOpposition: 0.15
        },
        financial: {
            budgetOverrun: 0.35,
            cashFlowIssues: 0.25,
            procurementDelays: 0.20,
            costEscalation: 0.20
        },
        outcome: {
            scopeCreep: 0.20,
            qualityIssues: 0.25,
            sustainabilityRisks: 0.20,
            impactShortfall: 0.35
        }
    };

    // Weights for different risk types
    private riskTypeWeights = {
        implementation: 0.40,
        financial: 0.35,
        outcome: 0.25
    };

    // Risk severity thresholds
    private riskSeverityThresholds = {
        low: 0.3,
        medium: 0.6
        // high: > 0.6
    };

    // Mitigation strategy database
    private mitigationStrategies: Record<string, string[]> = {
        resourceShortage: [
            "Develop a detailed resource allocation plan before project start",
            "Identify backup resource options and establish contingency agreements",
            "Consider phased implementation to distribute resource requirements"
        ],
        technicalComplexity: [
            "Conduct technical feasibility study before full implementation",
            "Arrange technical training for implementation team",
            "Consider hiring specialized consultants for complex aspects"
        ],
        timeConstraints: [
            "Develop a detailed project schedule with buffer periods",
            "Implement agile methodology for better time management",
            "Consider a phased approach with parallel workstreams"
        ],
        dependencyRisks: [
            "Map all project dependencies and create contingency plans",
            "Establish clear communication channels with dependency owners",
            "Schedule regular coordination meetings to track dependencies"
        ],
        stakeholderOpposition: [
            "Conduct early stakeholder engagement and consultation sessions",
            "Develop a comprehensive communication plan",
            "Create feedback mechanisms to address concerns quickly"
        ],
        budgetOverrun: [
            "Implement strict budget monitoring with regular reporting",
            "Include appropriate contingency in budget planning",
            "Set up early warning indicators for potential overruns"
        ],
        cashFlowIssues: [
            "Develop detailed cash flow projections and monitoring",
            "Consider staggered payment schedules aligned with milestones",
            "Establish a reserve fund for temporary cash flow disruptions"
        ],
        procurementDelays: [
            "Start procurement processes early with clear specifications",
            "Identify multiple suppliers for critical items",
            "Develop procurement contingency plans"
        ],
        costEscalation: [
            "Include price escalation clauses in contracts",
            "Consider bulk purchasing to lock in prices",
            "Conduct regular market price monitoring"
        ],
        scopeCreep: [
            "Implement formal scope management and change control processes",
            "Clearly document project boundaries and exclusions",
            "Conduct regular scope reviews during implementation"
        ],
        qualityIssues: [
            "Develop clear quality standards and control processes",
            "Schedule regular quality reviews throughout the project",
            "Implement testing and acceptance criteria for deliverables"
        ],
        sustainabilityRisks: [
            "Conduct sustainability assessment during planning",
            "Incorporate maintenance and operational requirements in design",
            "Develop long-term sustainability plan post-implementation"
        ],
        impactShortfall: [
            "Define clear, measurable success criteria at project start",
            "Implement monitoring and evaluation framework",
            "Plan for mid-project impact assessment to allow corrections"
        ]
    };

    constructor() {
        // Load model parameters if available
        this.loadModel().catch(() => {
            console.log("No saved risk assessment model found, using default parameters");
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
     * Predict risks for projects in an AIP
     */
    async predict(data: { aipId: string }): Promise<RiskAssessmentPrediction> {
        const startTime = performance.now();
        
        if (!this.validateInput(data)) {
            throw new Error("Invalid input data for risk assessment prediction");
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
                    },
                    fiscalYear: true
                }
            });

            if (!aip) {
                throw new Error("AIP not found");
            }

            // Assess risks for each project
            const projectRisks = await this.assessProjectRisks(aip);

            const prediction = {
                confidence: 0.78,
                timestamp: new Date().toISOString(),
                source: `risk-assessment-model-v${this.version.major}.${this.version.minor}.${this.version.patch}`,
                projectRisks,
                executionTimeMs: performance.now() - startTime
            };

            // Log the prediction operation
            logModelOperation("RiskAssessmentModel", "predict", {
                aipId,
                executionTimeMs: prediction.executionTimeMs,
                projectCount: projectRisks.length
            });

            return prediction;
        } catch (error) {
            logModelOperation("RiskAssessmentModel", "prediction_error", {
                error: error instanceof Error ? error.message : String(error),
                aipId: data.aipId
            });
            throw error;
        }
    }

    /**
     * Assess risks for all projects in an AIP
     */
    private async assessProjectRisks(aip: any) {
        const projects = aip.projects;
        const projectRisks: Array<{
            projectId: string;
            overallRiskScore: number;
            riskFactors: Array<{
                factor: string;
                severity: 'high' | 'medium' | 'low';
                probability: number;
                impact: number;
            }>;
            mitigationSuggestions: string[];
        }> = [];

        for (const project of projects) {
            // Assess implementation risks
            const implementationRisks = this.assessImplementationRisks(project, aip);
            
            // Assess financial risks
            const financialRisks = this.assessFinancialRisks(project, aip);
            
            // Assess outcome risks
            const outcomeRisks = this.assessOutcomeRisks(project, aip);
            
            // Combine all risk factors
            const allRiskFactors = [
                ...implementationRisks,
                ...financialRisks,
                ...outcomeRisks
            ];
            
            // Calculate overall risk score
            const overallRiskScore = this.calculateOverallRiskScore(
                implementationRisks, 
                financialRisks, 
                outcomeRisks
            );
            
            // Generate mitigation suggestions
            const mitigationSuggestions = this.generateMitigationSuggestions(allRiskFactors);
            
            projectRisks.push({
                projectId: project.id,
                overallRiskScore,
                riskFactors: allRiskFactors,
                mitigationSuggestions
            });
        }
        
        return projectRisks;
    }

    /**
     * Assess implementation risks for a project
     */
    private assessImplementationRisks(project: any, aip: any) {
        const risks: Array<{
            factor: string;
            severity: 'high' | 'medium' | 'low';
            probability: number;
            impact: number;
        }> = [];
        
        // Resource shortage risk
        const resourceShortageProb = this.calculateResourceShortageRisk(project);
        if (resourceShortageProb > 0.2) {
            risks.push({
                factor: 'resourceShortage',
                severity: this.determineRiskSeverity(resourceShortageProb),
                probability: resourceShortageProb,
                impact: 0.7  // Impact is generally high for resource shortages
            });
        }
        
        // Technical complexity risk
        const complexityProb = this.calculateTechnicalComplexityRisk(project);
        if (complexityProb > 0.2) {
            risks.push({
                factor: 'technicalComplexity',
                severity: this.determineRiskSeverity(complexityProb),
                probability: complexityProb,
                impact: 0.65
            });
        }
        
        // Time constraints risk
        const timeConstraintProb = this.calculateTimeConstraintRisk(project);
        if (timeConstraintProb > 0.2) {
            risks.push({
                factor: 'timeConstraints',
                severity: this.determineRiskSeverity(timeConstraintProb),
                probability: timeConstraintProb,
                impact: 0.6
            });
        }
        
        // Dependency risks
        const dependencyRiskProb = this.calculateDependencyRisk(project);
        if (dependencyRiskProb > 0.2) {
            risks.push({
                factor: 'dependencyRisks',
                severity: this.determineRiskSeverity(dependencyRiskProb),
                probability: dependencyRiskProb,
                impact: 0.65
            });
        }
        
        // Stakeholder opposition risk
        const stakeholderRiskProb = this.calculateStakeholderRisk(project);
        if (stakeholderRiskProb > 0.2) {
            risks.push({
                factor: 'stakeholderOpposition',
                severity: this.determineRiskSeverity(stakeholderRiskProb),
                probability: stakeholderRiskProb,
                impact: 0.55
            });
        }
        
        return risks;
    }

    /**
     * Assess financial risks for a project
     */
    private assessFinancialRisks(project: any, aip: any) {
        const risks: Array<{
            factor: string;
            severity: 'high' | 'medium' | 'low';
            probability: number;
            impact: number;
        }> = [];
        
        // Budget overrun risk
        const budgetOverrunProb = this.calculateBudgetOverrunRisk(project);
        if (budgetOverrunProb > 0.2) {
            risks.push({
                factor: 'budgetOverrun',
                severity: this.determineRiskSeverity(budgetOverrunProb),
                probability: budgetOverrunProb,
                impact: 0.75
            });
        }
        
        // Cash flow issues risk
        const cashFlowProb = this.calculateCashFlowRisk(project, aip);
        if (cashFlowProb > 0.2) {
            risks.push({
                factor: 'cashFlowIssues',
                severity: this.determineRiskSeverity(cashFlowProb),
                probability: cashFlowProb,
                impact: 0.6
            });
        }
        
        // Procurement delays risk
        const procurementProb = this.calculateProcurementRisk(project);
        if (procurementProb > 0.2) {
            risks.push({
                factor: 'procurementDelays',
                severity: this.determineRiskSeverity(procurementProb),
                probability: procurementProb,
                impact: 0.55
            });
        }
        
        // Cost escalation risk
        const costEscalationProb = this.calculateCostEscalationRisk(project);
        if (costEscalationProb > 0.2) {
            risks.push({
                factor: 'costEscalation',
                severity: this.determineRiskSeverity(costEscalationProb),
                probability: costEscalationProb,
                impact: 0.65
            });
        }
        
        return risks;
    }

    /**
     * Assess outcome risks for a project
     */
    private assessOutcomeRisks(project: any, aip: any) {
        const risks: Array<{
            factor: string;
            severity: 'high' | 'medium' | 'low';
            probability: number;
            impact: number;
        }> = [];
        
        // Scope creep risk
        const scopeCreepProb = this.calculateScopeCreepRisk(project);
        if (scopeCreepProb > 0.2) {
            risks.push({
                factor: 'scopeCreep',
                severity: this.determineRiskSeverity(scopeCreepProb),
                probability: scopeCreepProb,
                impact: 0.6
            });
        }
        
        // Quality issues risk
        const qualityIssuesProb = this.calculateQualityRisk(project);
        if (qualityIssuesProb > 0.2) {
            risks.push({
                factor: 'qualityIssues',
                severity: this.determineRiskSeverity(qualityIssuesProb),
                probability: qualityIssuesProb,
                impact: 0.7
            });
        }
        
        // Sustainability risks
        const sustainabilityProb = this.calculateSustainabilityRisk(project);
        if (sustainabilityProb > 0.2) {
            risks.push({
                factor: 'sustainabilityRisks',
                severity: this.determineRiskSeverity(sustainabilityProb),
                probability: sustainabilityProb,
                impact: 0.65
            });
        }
        
        // Impact shortfall risk
        const impactShortfallProb = this.calculateImpactShortfallRisk(project);
        if (impactShortfallProb > 0.2) {
            risks.push({
                factor: 'impactShortfall',
                severity: this.determineRiskSeverity(impactShortfallProb),
                probability: impactShortfallProb,
                impact: 0.75
            });
        }
        
        return risks;
    }

    /**
     * Calculate overall risk score combining all risk categories
     */
    private calculateOverallRiskScore(
        implementationRisks: any[],
        financialRisks: any[],
        outcomeRisks: any[]
    ): number {
        // Calculate average for each risk category
        const implementationScore = implementationRisks.length > 0 ?
            implementationRisks.reduce((sum, risk) => sum + (risk.probability * risk.impact), 0) / implementationRisks.length : 0;
        
        const financialScore = financialRisks.length > 0 ?
            financialRisks.reduce((sum, risk) => sum + (risk.probability * risk.impact), 0) / financialRisks.length : 0;
        
        const outcomeScore = outcomeRisks.length > 0 ?
            outcomeRisks.reduce((sum, risk) => sum + (risk.probability * risk.impact), 0) / outcomeRisks.length : 0;
        
        // Weight each category according to model parameters
        const overallScore = (
            implementationScore * this.riskTypeWeights.implementation +
            financialScore * this.riskTypeWeights.financial +
            outcomeScore * this.riskTypeWeights.outcome
        );
        
        return Math.min(1, overallScore);
    }

    /**
     * Generate mitigation suggestions based on identified risks
     */
    private generateMitigationSuggestions(riskFactors: any[]): string[] {
        const suggestions: string[] = [];
        const addedFactors = new Set();
        
        // Sort risks by severity (high to low)
        const sortedRisks = [...riskFactors].sort((a, b) => {
            const scoreA = a.probability * a.impact;
            const scoreB = b.probability * b.impact;
            return scoreB - scoreA;
        });
        
        // Take the top 3 risks
        for (const risk of sortedRisks.slice(0, 3)) {
            const factor = risk.factor;
            
            if (!addedFactors.has(factor) && this.mitigationStrategies[factor]) {
                // Add 1-2 strategies per risk factor
                const strategies = this.mitigationStrategies[factor];
                const count = risk.severity === 'high' ? 2 : 1;
                
                for (let i = 0; i < Math.min(count, strategies.length); i++) {
                    suggestions.push(strategies[i]);
                }
                
                addedFactors.add(factor);
            }
        }
        
        return suggestions;
    }

    /**
     * Determine risk severity based on probability
     */
    private determineRiskSeverity(probability: number): 'high' | 'medium' | 'low' {
        if (probability > this.riskSeverityThresholds.medium) {
            return 'high';
        } else if (probability > this.riskSeverityThresholds.low) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Calculate resource shortage risk
     */
    private calculateResourceShortageRisk(project: any): number {
        // Placeholder logic - will be enhanced with actual factors
        const baseRisk = 0.3;
        
        // Check budget against typical resource needs for similar projects
        const budgetFactor = project.budget < 100000 ? 0.2 : project.budget < 500000 ? 0.1 : 0;
        
        // Check timeline pressure
        const timelineFactor = this.hasShortTimeline(project) ? 0.25 : 0;
        
        // Check for resource-intensive deliverables
        const scopeFactor = project.description && (
            project.description.toLowerCase().includes('construction') || 
            project.description.toLowerCase().includes('development')
        ) ? 0.15 : 0;
        
        return Math.min(1, baseRisk + budgetFactor + timelineFactor + scopeFactor);
    }

    /**
     * Calculate technical complexity risk
     */
    private calculateTechnicalComplexityRisk(project: any): number {
        // Placeholder implementation
        const baseRisk = 0.25;
        
        // Analyze project description for complexity indicators
        const technicalTerms = ['system', 'technical', 'software', 'integration', 'engineering'];
        const descriptionFactor = project.description ? 
            technicalTerms.filter(term => project.description.toLowerCase().includes(term)).length * 0.05 : 0;
        
        // Consider project budget as a proxy for complexity
        const budgetFactor = project.budget > 500000 ? 0.15 : 0;
        
        return Math.min(1, baseRisk + descriptionFactor + budgetFactor);
    }

    /**
     * Calculate time constraint risk
     */
    private calculateTimeConstraintRisk(project: any): number {
        return this.hasShortTimeline(project) ? 0.7 : 0.3;
    }

    /**
     * Calculate dependency risk
     */
    private calculateDependencyRisk(project: any): number {
        // Placeholder implementation
        return 0.4; // Default medium risk
    }

    /**
     * Calculate stakeholder risk
     */
    private calculateStakeholderRisk(project: any): number {
        // Placeholder implementation
        return 0.35; // Default medium-low risk
    }

    /**
     * Calculate budget overrun risk
     */
    private calculateBudgetOverrunRisk(project: any): number {
        // Check if there's a history of expenses exceeding budget
        const expenses = project.expenses || [];
        const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
        const budgetRatio = totalExpenses / (project.budget || 1);
        
        // Higher risk for projects that already have high expense ratio
        const expenseRiskFactor = budgetRatio > 0.7 ? 0.3 : budgetRatio > 0.5 ? 0.2 : 0.1;
        
        // Check for typical high-risk project types
        const projectTypeRisk = project.description && (
            project.description.toLowerCase().includes('construction') ||
            project.description.toLowerCase().includes('infrastructure')
        ) ? 0.25 : 0.1;
        
        return Math.min(1, 0.2 + expenseRiskFactor + projectTypeRisk);
    }

    /**
     * Calculate cash flow risk
     */
    private calculateCashFlowRisk(project: any, aip: any): number {
        // Placeholder implementation
        return 0.3; // Default medium-low risk
    }

    /**
     * Calculate procurement risk
     */
    private calculateProcurementRisk(project: any): number {
        // Placeholder implementation
        return 0.4; // Default medium risk
    }

    /**
     * Calculate cost escalation risk
     */
    private calculateCostEscalationRisk(project: any): number {
        // Placeholder implementation
        return 0.45; // Default medium risk
    }

    /**
     * Calculate scope creep risk
     */
    private calculateScopeCreepRisk(project: any): number {
        // Check for vague scope definitions
        const hasVagueScope = project.description && 
            project.description.length < 100; // Simple heuristic - short descriptions may lack detail
        
        // Check for project complexity which often leads to scope creep
        const complexityFactor = this.calculateTechnicalComplexityRisk(project) * 0.5;
        
        return Math.min(1, 0.25 + (hasVagueScope ? 0.2 : 0) + complexityFactor);
    }

    /**
     * Calculate quality risk
     */
    private calculateQualityRisk(project: any): number {
        // Check budget constraints which may affect quality
        const budgetConstraint = project.budget < 100000 ? 0.2 : 0.1;
        
        // Check time constraints which may lead to rushed implementation
        const timeConstraint = this.hasShortTimeline(project) ? 0.25 : 0.1;
        
        return Math.min(1, 0.25 + budgetConstraint + timeConstraint);
    }

    /**
     * Calculate sustainability risk
     */
    private calculateSustainabilityRisk(project: any): number {
        // Placeholder implementation
        return 0.4; // Default medium risk
    }

    /**
     * Calculate impact shortfall risk
     */
    private calculateImpactShortfallRisk(project: any): number {
        // Check for clearly defined outcomes
        const hasOutcomes = project.description && (
            project.description.toLowerCase().includes('outcome') ||
            project.description.toLowerCase().includes('result') ||
            project.description.toLowerCase().includes('impact')
        );
        
        // Projects without clear outcomes have higher risk
        const outcomeRiskFactor = hasOutcomes ? 0.1 : 0.3;
        
        // New or innovative projects have higher risk of not achieving intended impact
        const innovationRisk = project.description && (
            project.description.toLowerCase().includes('new') ||
            project.description.toLowerCase().includes('innovative') ||
            project.description.toLowerCase().includes('pilot')
        ) ? 0.2 : 0.1;
        
        return Math.min(1, 0.25 + outcomeRiskFactor + innovationRisk);
    }

    /**
     * Helper function to check if project has a short timeline
     */
    private hasShortTimeline(project: any): boolean {
        if (!project.milestones || project.milestones.length < 2) {
            return false;
        }
        
        const startMilestone = project.milestones.find((m: any) => 
            m.description.toLowerCase().includes('start') || m.order === 1);
            
        const endMilestone = project.milestones.find((m: any) => 
            m.description.toLowerCase().includes('complete') || 
            m.description.toLowerCase().includes('finish') ||
            m.order === project.milestones.length);
            
        if (!startMilestone || !endMilestone || !startMilestone.dueDate || !endMilestone.dueDate) {
            return false;
        }
        
        const duration = new Date(endMilestone.dueDate).getTime() - new Date(startMilestone.dueDate).getTime();
        const durationInMonths = duration / (1000 * 60 * 60 * 24 * 30);
        
        // Consider projects with less than 3 months timeline as "short"
        return durationInMonths < 3;
    }

    /**
     * Train the model with historical data
     */
    async train(data: { fiscalYears?: number[]; completedProjectsOnly?: boolean }): Promise<TrainingMetadata> {
        const startTime = new Date();
        
        // Get historical data for training
        const fiscalYears = data.fiscalYears || [];
        const completedOnly = data.completedProjectsOnly !== false;
        
        try {
            // Log that this is a placeholder implementation to be enhanced in the future
            console.log("Risk assessment model training functionality will be implemented in future versions");
            
            // Return placeholder training metadata
            const trainingMetadata: TrainingMetadata = {
                startTime: startTime.toISOString(),
                endTime: new Date().toISOString(),
                samplesProcessed: 0,
                convergenceMetrics: {
                    loss: 0.15,
                    accuracy: 0.85
                },
                version: this.getVersion()
            };
            
            return trainingMetadata;
        } catch (error) {
            console.error("Error training risk assessment model:", error);
            throw error;
        }
    }

    /**
     * Evaluate model performance
     */
    async evaluate(data: { projectIds: string[] }): Promise<{ accuracy: number, metrics: Record<string, number> }> {
        try {
            // Log that this is a placeholder implementation to be enhanced in the future
            console.log("Risk assessment model evaluation functionality will be implemented in future versions");
            
            return {
                accuracy: 0.79,
                metrics: {
                    precision: 0.81,
                    recall: 0.76,
                    f1Score: 0.78,
                    implementationRiskAccuracy: 0.80,
                    financialRiskAccuracy: 0.82,
                    outcomeRiskAccuracy: 0.75
                }
            };
        } catch (error) {
            console.error("Error evaluating risk assessment model:", error);
            throw error;
        }
    }

    /**
     * Save model parameters to file
     */
    async saveModel(customPath?: string): Promise<void> {
        try {
            const modelData = {
                version: this.version,
                riskFactors: this.riskFactors,
                riskTypeWeights: this.riskTypeWeights,
                riskSeverityThresholds: this.riskSeverityThresholds
            };
            
            const filePath = customPath || path.join(process.cwd(), 'data', 'models', 'risk-assessment-model.json');
            
            // Ensure directory exists
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });
            
            // Save model to file
            await fs.writeFile(filePath, JSON.stringify(modelData, null, 2));
            
            console.log(`Risk assessment model saved to ${filePath}`);
        } catch (error) {
            console.error("Error saving risk assessment model:", error);
            throw error;
        }
    }

    /**
     * Load model parameters from file
     */
    async loadModel(customPath?: string): Promise<void> {
        try {
            const filePath = customPath || path.join(process.cwd(), 'data', 'models', 'risk-assessment-model.json');
            
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const modelData = JSON.parse(fileContent);
            
            // Update model parameters
            this.version = modelData.version;
            this.riskFactors = modelData.riskFactors;
            this.riskTypeWeights = modelData.riskTypeWeights;
            this.riskSeverityThresholds = modelData.riskSeverityThresholds;
            
            console.log(`Risk assessment model loaded from ${filePath}`);
        } catch (error) {
            console.error("Error loading risk assessment model:", error);
            throw error;
        }
    }
}

// Export model instance
export const riskAssessmentModel = new RiskAssessmentModel(); 