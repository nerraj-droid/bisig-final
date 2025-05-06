/**
 * AI Performance Metrics Tracking
 * 
 * This module provides utilities for tracking, recording, and analyzing
 * the performance of AI models within the system.
 */

import fs from 'fs/promises';
import path from 'path';

// Performance metric types
export interface PerformanceMetric {
  modelId: string;           // Identifier for the AI model
  operation: string;         // Operation performed (e.g., 'predict', 'extract')
  timestamp: string;         // When the operation was performed
  executionTimeMs: number;   // How long the operation took
  inputSize?: number;        // Size of input (e.g., document size in bytes)
  outputSize?: number;       // Size of output (if applicable)
  success: boolean;          // Whether the operation succeeded
  errorMessage?: string;     // Error message if any
  confidenceScore?: number;  // Confidence score of the prediction (0-1)
  metadata?: Record<string, any>; // Additional operation-specific metadata
  userId?: string;           // User who performed the operation (if applicable)
}

export interface ModelPerformanceSummary {
  modelId: string;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageExecutionTimeMs: number;
  minExecutionTimeMs: number;
  maxExecutionTimeMs: number;
  averageConfidenceScore?: number;
  successRate: number;
  lastExecutionTimestamp: string;
}

export interface SystemPerformanceSummary {
  totalOperations: number;
  totalSuccessful: number;
  totalFailed: number;
  modelsCount: number;
  modelPerformance: ModelPerformanceSummary[];
  timeRange: {
    start: string;
    end: string;
  };
}

/**
 * Record a performance metric for an AI operation
 */
export async function recordPerformanceMetric(metric: PerformanceMetric): Promise<void> {
  try {
    // Create the data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data', 'ai-metrics');
    await fs.mkdir(dataDir, { recursive: true });

    // Create a filename based on the date (one file per day)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filePath = path.join(dataDir, `metrics-${today}.json`);

    // Read existing metrics or create a new array
    let metrics: PerformanceMetric[] = [];
    try {
      const existingData = await fs.readFile(filePath, 'utf-8');
      metrics = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist or is invalid JSON, start with an empty array
      metrics = [];
    }

    // Add the new metric
    metrics.push(metric);

    // Write the updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(metrics, null, 2), 'utf-8');

    // Log the recording operation
    console.log(`Recorded performance metric for ${metric.modelId}:${metric.operation}`);
  } catch (error) {
    console.error('Error recording performance metric:', error);
  }
}

/**
 * Get performance metrics for a specific model
 */
export async function getModelPerformanceMetrics(
  modelId: string,
  startDate?: string,
  endDate?: string
): Promise<PerformanceMetric[]> {
  try {
    const metrics = await getAllPerformanceMetrics(startDate, endDate);
    return metrics.filter(metric => metric.modelId === modelId);
  } catch (error) {
    console.error(`Error getting metrics for model ${modelId}:`, error);
    return [];
  }
}

/**
 * Get all performance metrics within a date range
 */
export async function getAllPerformanceMetrics(
  startDate?: string,
  endDate?: string
): Promise<PerformanceMetric[]> {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'ai-metrics');
    
    // Create directory if it doesn't exist
    await fs.mkdir(dataDir, { recursive: true });
    
    // List all metric files
    const files = await fs.readdir(dataDir);
    const metricFiles = files.filter(file => file.startsWith('metrics-') && file.endsWith('.json'));
    
    // Filter files by date if start/end dates provided
    const filteredFiles = metricFiles.filter(file => {
      const fileDate = file.replace('metrics-', '').replace('.json', '');
      if (startDate && fileDate < startDate) return false;
      if (endDate && fileDate > endDate) return false;
      return true;
    });
    
    // Read and combine all metrics
    let allMetrics: PerformanceMetric[] = [];
    for (const file of filteredFiles) {
      try {
        const filePath = path.join(dataDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const fileMetrics: PerformanceMetric[] = JSON.parse(fileContent);
        allMetrics = [...allMetrics, ...fileMetrics];
      } catch (error) {
        console.warn(`Error reading metrics file ${file}:`, error);
      }
    }
    
    // Further filter by timestamp if needed
    if (startDate || endDate) {
      allMetrics = allMetrics.filter(metric => {
        const metricDate = metric.timestamp.split('T')[0];
        if (startDate && metricDate < startDate) return false;
        if (endDate && metricDate > endDate) return false;
        return true;
      });
    }
    
    return allMetrics;
  } catch (error) {
    console.error('Error getting all performance metrics:', error);
    return [];
  }
}

/**
 * Generate a performance summary for a specific model
 */
export function generateModelPerformanceSummary(
  modelId: string,
  metrics: PerformanceMetric[]
): ModelPerformanceSummary {
  // Filter metrics for this model
  const modelMetrics = metrics.filter(m => m.modelId === modelId);
  
  if (modelMetrics.length === 0) {
    return {
      modelId,
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageExecutionTimeMs: 0,
      minExecutionTimeMs: 0,
      maxExecutionTimeMs: 0,
      successRate: 0,
      lastExecutionTimestamp: ''
    };
  }
  
  // Calculate summary statistics
  const successfulMetrics = modelMetrics.filter(m => m.success);
  const executionTimes = modelMetrics.map(m => m.executionTimeMs);
  const confidenceScores = modelMetrics
    .filter(m => m.confidenceScore !== undefined)
    .map(m => m.confidenceScore as number);
  
  // Sort by timestamp (newest first) to get the last execution
  const sortedByTime = [...modelMetrics].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return {
    modelId,
    totalOperations: modelMetrics.length,
    successfulOperations: successfulMetrics.length,
    failedOperations: modelMetrics.length - successfulMetrics.length,
    averageExecutionTimeMs: executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length,
    minExecutionTimeMs: Math.min(...executionTimes),
    maxExecutionTimeMs: Math.max(...executionTimes),
    averageConfidenceScore: confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
      : undefined,
    successRate: modelMetrics.length > 0 
      ? successfulMetrics.length / modelMetrics.length 
      : 0,
    lastExecutionTimestamp: sortedByTime.length > 0 ? sortedByTime[0].timestamp : ''
  };
}

/**
 * Generate a system-wide performance summary
 */
export async function generateSystemPerformanceSummary(
  startDate?: string,
  endDate?: string
): Promise<SystemPerformanceSummary> {
  // Get all metrics within the date range
  const allMetrics = await getAllPerformanceMetrics(startDate, endDate);
  
  // Find all unique model IDs
  const modelIds = Array.from(new Set(allMetrics.map(m => m.modelId)));
  
  // Generate summary for each model
  const modelSummaries = modelIds.map(modelId => 
    generateModelPerformanceSummary(modelId, allMetrics)
  );
  
  // Sort model summaries by success rate (descending)
  modelSummaries.sort((a, b) => b.successRate - a.successRate);
  
  // Calculate overall stats
  const totalSuccessful = allMetrics.filter(m => m.success).length;
  
  return {
    totalOperations: allMetrics.length,
    totalSuccessful,
    totalFailed: allMetrics.length - totalSuccessful,
    modelsCount: modelIds.length,
    modelPerformance: modelSummaries,
    timeRange: {
      start: startDate || (allMetrics.length > 0 ? 
        allMetrics.reduce((earliest, metric) => 
          metric.timestamp < earliest ? metric.timestamp : earliest, 
          allMetrics[0].timestamp
        ) : 
        new Date().toISOString()),
      end: endDate || new Date().toISOString()
    }
  };
}

/**
 * Generate performance comparison between two time periods
 */
export async function comparePerformancePeriods(
  period1Start: string,
  period1End: string,
  period2Start: string,
  period2End: string
): Promise<Record<string, any>> {
  const period1Metrics = await getAllPerformanceMetrics(period1Start, period1End);
  const period2Metrics = await getAllPerformanceMetrics(period2Start, period2End);
  
  const period1Summary = {
    totalOperations: period1Metrics.length,
    successRate: period1Metrics.length > 0 ? 
      period1Metrics.filter(m => m.success).length / period1Metrics.length : 0,
    averageExecutionTime: period1Metrics.length > 0 ?
      period1Metrics.reduce((sum, m) => sum + m.executionTimeMs, 0) / period1Metrics.length : 0
  };
  
  const period2Summary = {
    totalOperations: period2Metrics.length,
    successRate: period2Metrics.length > 0 ? 
      period2Metrics.filter(m => m.success).length / period2Metrics.length : 0,
    averageExecutionTime: period2Metrics.length > 0 ?
      period2Metrics.reduce((sum, m) => sum + m.executionTimeMs, 0) / period2Metrics.length : 0
  };
  
  // Calculate deltas
  const operationsChange = period2Summary.totalOperations - period1Summary.totalOperations;
  const operationsPercentChange = period1Summary.totalOperations > 0 ?
    (operationsChange / period1Summary.totalOperations) * 100 : 0;
    
  const successRateChange = period2Summary.successRate - period1Summary.successRate;
  const executionTimeChange = period2Summary.averageExecutionTime - period1Summary.averageExecutionTime;
  const executionTimePercentChange = period1Summary.averageExecutionTime > 0 ?
    (executionTimeChange / period1Summary.averageExecutionTime) * 100 : 0;
  
  return {
    period1: {
      start: period1Start,
      end: period1End,
      ...period1Summary
    },
    period2: {
      start: period2Start,
      end: period2End,
      ...period2Summary
    },
    comparison: {
      operationsChange,
      operationsPercentChange,
      successRateChange,
      executionTimeChange,
      executionTimePercentChange,
      improved: (
        (successRateChange > 0) ||
        (executionTimeChange < 0 && executionTimePercentChange < -5)
      )
    }
  };
}

/**
 * Create a benchmark record for model comparison
 */
export async function recordModelBenchmark(
  modelId: string,
  benchmarkData: {
    datasetSize: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    averageLatencyMs: number;
    timestamp: string;
    dataset: string;
    version: string;
  }
): Promise<void> {
  try {
    // Create the benchmarks directory if it doesn't exist
    const benchmarksDir = path.join(process.cwd(), 'data', 'ai-benchmarks');
    await fs.mkdir(benchmarksDir, { recursive: true });
    
    // Create a file for this model's benchmarks
    const filePath = path.join(benchmarksDir, `${modelId}-benchmarks.json`);
    
    // Read existing benchmarks or create a new array
    let benchmarks: any[] = [];
    try {
      const existingData = await fs.readFile(filePath, 'utf-8');
      benchmarks = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist or is invalid JSON, start with an empty array
      benchmarks = [];
    }
    
    // Add the new benchmark
    benchmarks.push({
      ...benchmarkData,
      modelId
    });
    
    // Write the updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(benchmarks, null, 2), 'utf-8');
    
    console.log(`Recorded benchmark for ${modelId} using dataset ${benchmarkData.dataset}`);
  } catch (error) {
    console.error('Error recording model benchmark:', error);
  }
}

/**
 * Get benchmarks for a specific model
 */
export async function getModelBenchmarks(modelId: string): Promise<any[]> {
  try {
    const benchmarksDir = path.join(process.cwd(), 'data', 'ai-benchmarks');
    const filePath = path.join(benchmarksDir, `${modelId}-benchmarks.json`);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is invalid JSON
      return [];
    }
  } catch (error) {
    console.error(`Error getting benchmarks for model ${modelId}:`, error);
    return [];
  }
} 