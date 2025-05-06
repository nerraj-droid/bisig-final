/**
 * AI Models Registry
 * 
 * This file serves as the central registry for all AI models used in the application.
 * It defines common interfaces and exports the model implementations.
 */

// Model version tracking
export interface ModelVersion {
    major: number;
    minor: number;
    patch: number;
    timestamp: string;
    description: string;
}

// Base interface for all model predictions
export interface ModelPrediction {
    confidence: number;  // Confidence score (0-1)
    timestamp: string;   // When the prediction was made
    source: string;      // Source of the prediction (model name/version)
    executionTimeMs?: number; // Performance tracking
}

// Training metadata
export interface TrainingMetadata {
    startTime: string;
    endTime: string;
    samplesProcessed: number;
    convergenceMetrics?: Record<string, number>;
    version: ModelVersion;
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

// Data validation prediction
export interface DataValidationPrediction extends ModelPrediction {
    validationResults: {
        entityType: string;
        entityId: string;
        isValid: boolean;
        issues: {
            field: string;
            severity: 'high' | 'medium' | 'low';
            message: string;
            suggestion?: string;
        }[];
    }[];
    summary: {
        totalEntities: number;
        validEntities: number;
        percentValid: number;
        criticalIssueCount: number;
    };
}

// Document Intelligence prediction
export interface DocumentIntelligencePrediction extends ModelPrediction {
    documentAnalysis: {
        documentId: string;
        documentType: string;
        extractedEntities: {
            entity: string;
            type: string;
            confidence: number;
            value: string;
        }[];
        keyPhrases: {
            phrase: string;
            importance: number;
        }[];
        summary: string;
        topics: {
            topic: string;
            relevance: number;
        }[];
        sentimentScore: number;
    };
    recommendations: {
        classification: string;
        tags: string[];
        relatedDocuments: string[];
        actionItems: string[];
    };
}

// Model interfaces
export interface Model<T extends ModelPrediction> {
    // Core functionality
    predict(data: any): Promise<T>;
    train(data: any): Promise<TrainingMetadata>;
    evaluate(data: any): Promise<{ accuracy: number, metrics: Record<string, number> }>;
    
    // Model management
    getVersion(): ModelVersion;
    saveModel?(path?: string): Promise<void>;
    loadModel?(path: string): Promise<void>;
    
    // Validation methods
    validateInput?(data: any): boolean;
    validateOutput?(prediction: T): boolean;
}

// Data validation utils
export function validateNumericRange(value: number, min: number, max: number): boolean {
    return !isNaN(value) && value >= min && value <= max;
}

// Logging utility for model operations
export function logModelOperation(modelName: string, operation: string, metadata: any): void {
    console.log(`[${new Date().toISOString()}] ${modelName} - ${operation}:`, metadata);
    // Here you could also send logs to a monitoring system
}

// Re-export specific model implementations
export * from './budget-allocation';
export * from './project-prioritization';
export * from './financial-forecast';
export * from './risk-assessment';
export * from './data-validation';
export * from './document-intelligence'; 