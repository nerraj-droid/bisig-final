/**
 * AI Models Registry
 * 
 * This file serves as the central registry for all AI models used in the application.
 * It defines common interfaces and exports the model implementations.
 */

// Base interface for all model predictions
export interface ModelPrediction {
    confidence: number;  // Confidence score (0-1)
    timestamp: string;   // When the prediction was made
    source: string;      // Source of the prediction (model name/version)
}

// Budget allocation prediction
export interface BudgetAllocationPrediction extends ModelPrediction {
    sectorAllocations: {
        sector: string;
        recommendedPercentage: number;
        recommendedAmount: number;
        reasoning: string;
    }[];
    overallRecommendation: string;
}

// Project prioritization prediction
export interface ProjectPriorityPrediction extends ModelPrediction {
    projectRankings: {
        projectId: string;
        score: number;
        priorityLevel: 'high' | 'medium' | 'low';
        impactScore: number;
        feasibilityScore: number;
        costEfficiencyScore: number;
    }[];
    recommendedFocus: string[];
}

// Financial forecast prediction
export interface FinancialForecastPrediction extends ModelPrediction {
    monthlyProjections: {
        month: number;
        projectedExpenditure: number;
        projectedRemaining: number;
        anomalyRisk: number;
    }[];
    yearEndProjection: {
        expectedUtilization: number;
        riskOfOverspend: number;
        riskOfUnderspend: number;
    };
}

// Risk assessment prediction
export interface RiskAssessmentPrediction extends ModelPrediction {
    projectRisks: {
        projectId: string;
        overallRiskScore: number;
        riskFactors: {
            factor: string;
            severity: 'high' | 'medium' | 'low';
            probability: number;
            impact: number;
        }[];
        mitigationSuggestions: string[];
    }[];
}

// Model interfaces
export interface Model<T extends ModelPrediction> {
    predict(data: any): Promise<T>;
    train?(data: any): Promise<void>;
    evaluate?(data: any): Promise<{ accuracy: number, metrics: Record<string, number> }>;
}

// Re-export specific model implementations
export * from './budget-allocation';
export * from './project-prioritization';
export * from './financial-forecast';
export * from './risk-assessment'; 